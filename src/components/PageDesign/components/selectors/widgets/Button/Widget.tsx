import _ from 'lodash'
import cls from 'classnames'
import { useModel } from 'umi'
import React, { useMemo, useState, forwardRef } from 'react';

import { Form, Button as AntdButton, ButtonProps } from 'antd'

import type { WidgetItemType } from '@/models/AppEditor'
import { runActions } from '@/components/PageDesign/components/Action/queue'

import styles from '../../style.less'

type Props = {
  text: string
  inForm?: boolean
} & ButtonProps & WidgetItemType

const Button:React.FC<Props> = forwardRef((props, ref) => {
  const { settings } = props

  const [loading, setLoading] = useState(false)
  const { currentAppInfo } = useModel('App', (model) => ({
    currentAppInfo: model.currentAppInfo
  }));
  const { formValues, hiddenWidgets, setHiddenWidgets, allWidgets, updateWidgets } = useModel('AppEditor', (model) => ({
    allWidgets: model.widgets,
    formValues: model.formValues,
    hiddenWidgets: model.hiddenWidgets,
    setHiddenWidgets: model.setHiddenWidgets,
    updateWidgets: model.updateWidgets
  }));

  const form = Form.useFormInstance()

  const triggerActionEvent = (type, data) => {
    if (window.AppEvent) {
      window.AppEvent.emit({
        type: 'APP_ACTION_EVENT',
        value: {
          type,
          data
        }
      })
    }
  }

  const operateWidgets = (widgets: any[]) => {
    const visibleOrHiddenWidgets = _.filter(widgets,(widget) => widget.status === 'visible' || widget.status === 'hidden')
    if (visibleOrHiddenWidgets.length > 0) {
      let newHiddenWidgets = [...hiddenWidgets]
      _.forEach(visibleOrHiddenWidgets, (item) => {
        if (item.status === 'hidden') {
          newHiddenWidgets.push(item.widget)
        } else {
          newHiddenWidgets = _.filter(newHiddenWidgets, (hiddenWidget) => hiddenWidget !== item.widget)
        }
      })
      setHiddenWidgets(newHiddenWidgets)
    }

    const resetFields = _.map(_.filter(widgets, (item) => item.status === 'reset'), (item) => item.widget)
    if (resetFields.length > 0) {
      form.resetFields(resetFields)
    }

    const editableWidgets = _.filter(widgets, (item) => item.status === 'editable')
    if (editableWidgets.length > 0) {
      _.each(editableWidgets, (item) => {
        const widget = _.find(allWidgets, (widget) => widget.name === item.widget)
        if (widget?.settings?.disabled) {
          widget.settings = {
            ...widget.settings,
            disabled: false
          }
        }
      })
      updateWidgets([
        ...allWidgets,
      ])
    }
  }

  const triggerClickEvent = async () => {
    if (props.pageType === 'edit' || !settings?.clickEvent) return

    try {
      const result = await form.validateFields()
      if (result) {
        const curValues = {
          ...formValues.initialValues,
          ...result
        }
        setLoading(true)
        runActions(settings.clickEvent, {
          getAppInfo: () => currentAppInfo,
          process: (actionResult: any) => {
            const curAction = actionResult.action || {}
            const actionType = curAction.type
            const curActionResult = actionResult.result
            /** if (actionType === 'SAVE_DATA') {
              if (curActionResult) {
                message.success('保存成功')
              } else {
                message.error('保存失败')
              }
            } else **/
            if (actionType === 'SET_DATA') {
              const { valueType, widgetId } = curAction.formData || {}
              if (valueType === 'LAST_EVENT_VALUE') {
                const results = curActionResult.results || []
                const { result }: any = _.last(results) || {}
                if (result) {
                  form.setFieldValue(widgetId, result)
                }
              }
            } else if (actionType === 'RESET_FORM') {
              form.setFieldsValue(formValues.initialValues)
            } else if (actionType === 'SUBMIT_FORM_DATA') {
              if (_.isPlainObject(curActionResult)) {
                form.setFieldsValue(curActionResult)
              }
            } else if (actionType === 'READ_DATA') {
              if (curActionResult && _.isPlainObject(curActionResult) && curAction) {
                const { widget, showType } = curAction.formData || {}
                if (showType === 'WIDGET') {
                  form.setFieldValue(widget, curActionResult)
                } else {
                  form.setFieldsValue({
                    ...curValues,
                    ...curActionResult
                  })
                }
              }
            } else if (actionType === 'OPERATE_WIDGETS') {
              const { widgets } = curAction.formData || {}
              if (widgets) {
                operateWidgets(widgets)
              }
            }

            triggerActionEvent('process', actionResult)
          },
          getParams: (action) => {
            if (['SAVE_DATA', 'SUBMIT_FORM_DATA', 'READ_DATA'].includes(action.type)) {
              return curValues
            }
            return {}
          },
          end: (results) => {
            console.info(results)
            setLoading(false)
            triggerActionEvent('end', results)
          }
        })
      }
    } catch (e) {
      console.info(e)
      setLoading(false)
    }
  }

  const buttonProps = useMemo(() => {
    const _props: any = _.pick(settings, ['type', 'disabled'])

    if (settings?.clickEvent) {
      _props.onClick = () => {
        triggerClickEvent()
      }
    }

    return _props
  }, [ settings ])

  return (
    <div className={cls(styles.node, styles.button, 'editor-node-widget')}>
      <div className={styles.inner}>
        <AntdButton block { ...buttonProps } loading={loading}>
          { settings?.text }
        </AntdButton>
      </div>
    </div>
  )
})

export default Button


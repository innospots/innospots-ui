import React, { useEffect } from 'react';

import _ from 'lodash';
import {Form} from 'antd';
import { useModel } from 'umi'
import { useDebounceFn } from 'ahooks'

import styles from '../style.less'

const defaultValueFormat = (changedValues, allValues) => ({
  allValues,
  changedValues
})

export const WidgetSetting:React.FC<{
  getForm?: (form: any) => void
  valueFormat?: (changedValues: any, allValues: any) => any
}> = ({ children, getForm, valueFormat = defaultValueFormat }) => {

  const {
    formValue,
    selectedWidget,
    updateWidgetProps
  } = useModel('AppEditor', model => ({
    formValue: model.formValue,
    selectedWidget: model.selectedWidget,
    updateWidgetProps: model.updateSelectedWidgetProps
  }))

  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedWidget?.id) {
      const values = {
        type: selectedWidget.type,
        name: selectedWidget.name || selectedWidget.type,
        settings: selectedWidget.settings
      }
      form.resetFields()
      form.setFieldsValue(_.cloneDeep(values))
    }
  }, [ selectedWidget?.id ])

  useEffect(() => {
    getForm?.(form)
  }, [ form ])

  const {
    run: handleValuesChange
  } = useDebounceFn((changed, all) => {
    const { allValues, changedValues } = valueFormat(changed, all)
    updateWidgetProps(allValues || all, true)

    const changedForbidden = _.get(changedValues, 'settings.forbidden')
    const changedInitValue = _.get(changedValues, 'settings.initialValue')
    const isChangeInitValue = _.hasIn(changedValues, 'settings.initialValue')
    if (selectedWidget?.name && (!_.isUndefined(changedForbidden) || isChangeInitValue)) {
      const widgetName = selectedWidget.name
      const initialValues = formValue.initialValues || {}
      if (!_.isUndefined(changedForbidden)) {
        if (changedForbidden) {
          delete initialValues[widgetName]
        } else {
          const initValue = _.get(allValues, 'settings.initialValue')
          if (!_.isUndefined(initValue)) {
            initialValues[widgetName] = initValue
          }
        }
      } else {
        const forbidden = _.get(allValues, 'settings.forbidden')
        if (!forbidden && isChangeInitValue) {
          initialValues[widgetName] = changedInitValue
        }
      }
      formValue.initialValues = {
        ...initialValues
      }
      formValue.currentValues = {
        ...formValue.editValues,
        ...formValue.initialValues,
      }
    }
  }, {
    wait: 500
  })

  return (
    <div className={styles.widgetSettingContainer}>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
      >
        { children }
      </Form>
    </div>
  )
}
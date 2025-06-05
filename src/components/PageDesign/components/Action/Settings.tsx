import React from 'react'
import ReactDom from 'react-dom'

import { useModel } from 'umi'
import cls from 'classnames'
import { useReactive } from 'ahooks'
import { Space, Button } from 'antd'

import CustomSuspense from '../CustomSuspense'

import { DEFAULT_JS_CODE } from './constants'

const ActionPanel = React.lazy(() => import('./Panels/ActionPanel'))
const JavascriptPanel = React.lazy(() => import('./Panels/JavascriptPanel'))

import styles from './style.less'

interface ActionSettingsProps {
  value?: any
  onCancel?: () => void
  onSubmit?: (values: any) => void
}

export const ActionSettings:React.FC<ActionSettingsProps> = ({ value, onCancel, onSubmit }) => {

  const actionTypes = [{
    value: 'action',
    label: '动作'
  }/**, {
    value: 'javascript',
    label: 'Javascript'
  } */]
  const {
    editorIns,
    actionState,
    currentAction,
    actionFormIns,
    updateAction,
    updateActionState
  } = useModel('Action')

  const state = useReactive({
    value,
    tips: {
      type: '',
      visible: false
    },
    actionType: actionTypes[0].value
  })

  const handleSubmit = () => {
    if (currentAction && actionFormIns.current) {
      actionFormIns.current.validateFields().then(values => {
        const { id, type, label } = (currentAction || {})
        updateAction({
          id,
          type,
          label,
          formData: values
        })
        onSubmit?.(actionState.list)
      })
    } else {
      onSubmit?.(actionState.list)
    }
  }

  const handleChangeActionType = (type) => {
    if (type === 'javascript' && actionState.list.length) {
      state.tips = {
        type,
        visible: true
      }
      return
    } else if (type === 'action') {
      if (editorIns.current) {
        const value = editorIns.current.doc.getValue()
        if (value && value !== DEFAULT_JS_CODE) {
          state.tips = {
            type,
            visible: true
          }
          return
        }
      }
    }
    state.actionType = type
  }

  const closeTips = () => {
    state.tips = { type: '', visible: false }
  }

  const changeActionType = () => {
    state.actionType = state.tips.type
    actionState.list = []
    actionState.currentId = ''
    updateActionState()

    closeTips()
  }

  const renderHeader = () => {
    return (
      <div className={styles.header}>
        <span className={styles.title}>动作设置</span>
        <Space>
          <Button size="small" onClick={onCancel}>取消</Button>
          <Button size="small" type="primary" onClick={handleSubmit}>保存</Button>
        </Space>
      </div>
    )
  }

  const renderLeftBar = () => {
    return (
      <div className={styles.leftBar}>
        {
          actionTypes.map(item => (
            <div
              key={item.value}
              className={cls(styles.menuItem, {[styles.active]: item.value === state.actionType})}
              onClick={() => handleChangeActionType(item.value)}
            >
              <span className={styles.text}>{ item.label }</span>
            </div>
          ))
        }
      </div>
    )
  }

  const renderSettings = () => {
    return (
      <div className={styles.settingPanel}>
        <CustomSuspense>
          {
            state.actionType === 'action' ? <ActionPanel /> : <JavascriptPanel />
          }
        </CustomSuspense>
      </div>
    )
  }

  const renderTips = () => {
    const { tips } = state
    return (
      <div className={styles.tips}>
        <h3 className={styles.tipTitle}>
          {
            tips.type === 'javascript' ? '确认启用Javascript?' : '确认启用动作?'
          }
        </h3>
        <p>
          {
            tips.type === 'javascript' ? '启用JavaScript之后，所设置的动作会被清空' : '启用动作之后，所设置的JavaScript会被清空'
          }
        </p>
        <div>
          <Space>
            <Button size="small" onClick={closeTips}>取消</Button>
            <Button size="small" type="primary" onClick={changeActionType}>确定</Button>
          </Space>
        </div>
      </div>
    )
  }

  const render = () => {

    return (
      <>
        <div className={styles.settings}>
          { renderHeader() }
          <div className={styles.content}>
            { renderLeftBar() }
            { renderSettings() }
          </div>
          { state.tips.visible && renderTips() }
        </div>
        <div className={styles.background} />
      </>
    )
  }

  return ReactDom.createPortal(render(), document.getElementById('MainContent') as Element)
}
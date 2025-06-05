import _ from 'lodash'
import React from 'react'
import { useModel } from 'umi'
import { Row, Col } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { useReactive, useUpdateEffect, useControllableValue } from 'ahooks'

import { ActionSettings } from './Settings'

import styles from './style.less'

export const Action:React.FC<any> = (props) => {
  const settingState = useReactive({
    visible: false
  })
  const { setAction, clearAction } = useModel('Action', model => ({
    setAction: model.setAction,
    clearAction: model.clearAction
  }))
  const [actions, setActions] = useControllableValue<any[]>(props)

  useUpdateEffect(() => {
    if (!settingState.visible) {
      clearAction()
    } else {
      setAction([
        ...(actions || [])
      ])
    }
  }, [ settingState.visible, actions ])

  const toggleSettings = () => {
    settingState.visible = !settingState.visible
  }

  const handleActionChange = (list) => {
    setActions([
      ...list
    ])
    settingState.visible = false
  }

  const renderActions = () => {
    if (!actions?.length) {
      return (
        <p className={styles.empty}>请点击“设置”添加动作</p>
      )
    }

    return (
      <div className={styles.addedList} style={{marginLeft: -12, marginRight: -12}}>
        {
          _.map(actions, (item, index) => (
            <div key={item.id} className={styles.addedListItem}>
              <span className={styles.label}>{ index + 1 }. { item.label }</span>
            </div>
          ))
        }
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Row justify="end">
        <Col>
          <span className="b-button" onClick={toggleSettings}>
            <SettingOutlined /> 设置
          </span>
        </Col>
      </Row>
      <div className={styles.content}>
        { renderActions() }
      </div>
      { settingState.visible && <ActionSettings onCancel={toggleSettings} onSubmit={handleActionChange} /> }
    </div>
  )
}
import React, { useState } from 'react'
import { Row, Col } from 'antd'
import { useReactive } from 'ahooks'
import { SettingOutlined } from '@ant-design/icons'

import { RuleSettings } from './Settings'

import styles from './style.less'

type RuleValue = any[]

export interface ValidatorRuleProps {
  value?: RuleValue;
  onChange?: (value: RuleValue) => void;
}

export const ValidatorRule:React.FC<ValidatorRuleProps> = ({ value, onChange }) => {

  const settingState = useReactive({
    visible: false
  })

  const toggleSettings = () => {
    settingState.visible = !settingState.visible
  }

  const handleSettingSubmit = (rules) => {
    onChange?.([].concat(rules))
    settingState.visible = false
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
      {
        !value?.length ? (
          <div className={styles.content}>
            <p className={styles.empty}>请点击“设置”添加验证规则</p>
          </div>
        ) : (
          <ul className={styles.addedList}>
            {
              value.map((rule, index) => (
                <li key={index} className={styles.addedListItem}>
                  <span className={styles.label}>{index + 1}. {rule.label}</span>
                </li>
              ))
            }
          </ul>
        )
      }
      { settingState.visible && <RuleSettings value={value} onSubmit={handleSettingSubmit} onCancel={toggleSettings} /> }
    </div>
  )
}
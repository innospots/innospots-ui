import React from 'react'
import ReactDom from 'react-dom'

import _ from 'lodash'
import cls from 'classnames'
import { useReactive, useDeepCompareEffect } from 'ahooks'
import {CloseOutlined} from '@ant-design/icons';
import {Space, Button, Row, Col, Input} from 'antd'

import { ExpressionInput } from '@/components/Expression'

import styles from './style.less'

interface ActionSettingsProps {
  value?: any
  onCancel?: () => void
  onSubmit?: (values: any) => void
}

const ALL_RULES = [{
  type: 'required',
  label: '必填项规则'
}, {
  type: 'max',
  label: '最大长度规则'
}, {
  type: 'pattern',
  label: '正则表达式规则'
}]

export const RuleSettings:React.FC<ActionSettingsProps> = ({ value, onCancel, onSubmit }) => {

  const state = useReactive<{
    list: any[]
  }>({
    list: []
  })

  useDeepCompareEffect(() => {
    state.list = _.cloneDeep(value || [])
  }, [value])

  const handleSubmit = () => {
    onSubmit?.(state.list)
  }

  const activeRule = (rule) => {
    state.list.push({
      ...rule
    })
  }

  const removeRule = (rule) => {
    state.list = _.filter(state.list, item => (item.type !== rule.type))
  }

  const updateRule = (index, data) => {
    _.merge(state.list[index], data)
  }

  const renderHeader = () => {
    return (
      <div className={styles.header}>
        <span className={styles.title}>验证规则设置</span>
        <Space>
          <Button size="small" onClick={onCancel}>取消</Button>
          <Button size="small" type="primary" onClick={handleSubmit}>保存</Button>
        </Space>
      </div>
    )
  }

  const renderRuleList = () => {
    return (
      <div className={styles.listBox}>
        <div className={styles.panelTop}>
          <h4>添加规则</h4>
        </div>
        <div className={styles.ruleList}>
          {
            ALL_RULES.map(item => (
              <div key={item.type} className={cls(styles.ruleListItem, {
                [styles.active]: !!_.find(state.list, rule => rule.type === item.type)
              })} onClick={() => activeRule(item)}>
                <span className={styles.label}>{ item.label }</span>
              </div>
            ))
          }
        </div>
      </div>
    )
  }

  const renderAddedList = () => {
    const ruleList = state.list

    if (!ruleList.length) {
      return (
        <div className={styles.addedList}>
          <p className={styles.empty}>请点击左侧规则添加</p>
        </div>
      )
    }

    return (
      <div className={styles.addedList}>
        <Row gutter={20}>
          <Col span={6}>
            <h4>规则类型</h4>
          </Col>
          <Col span={8}>
            <h4>验证规则</h4>
          </Col>
          <Col span={8}>
            <h4>错误提示信息</h4>
          </Col>
        </Row>
        {
          state.list.map((item, index) => (
            <Row key={item.type} gutter={20} className={styles.addedListItem}>
              <Col span={6}>
                <span className={styles.title}>{ index + 1 }. { item.label }</span>
              </Col>
              <Col span={8}>
                {
                  item.type === 'required' && (
                    <Input disabled />
                  )
                }
                {
                  item.type === 'max' && (
                    <ExpressionInput value={item.value} placeholder="请输入最大长度" onChange={value => updateRule(index, {value})} />
                  )
                }
                {
                  item.type === 'pattern' && (
                    <ExpressionInput value={item.value} placeholder="请输入正则表达式" onChange={value => updateRule(index, {value})} />
                  )
                }
              </Col>
              <Col span={8}>
                <ExpressionInput value={item.message} placeholder="请输入错误提示信息" onChange={value => updateRule(index, {message: value})} />
              </Col>
              <Col span={2}>
                <span className="g-button" style={{lineHeight: '34px'}} onClick={() => removeRule(item)}>
                  <CloseOutlined />
                </span>
              </Col>
            </Row>
          ))
        }
      </div>
    )
  }

  const renderSettings = () => {
    return (
      <div className={styles.settingPanel}>
        <div className={cls(styles.panels, styles.actionPanel)}>
          { renderRuleList() }
          { renderAddedList() }
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
            { renderSettings() }
          </div>
        </div>
        <div className={styles.background} />
      </>
    )
  }

  return ReactDom.createPortal(render(), document.getElementById('MainContent') as Element)
}
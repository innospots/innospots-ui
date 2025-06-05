import React from 'react'
import {Row, Col, Select, Checkbox, Switch} from 'antd'

import { SettingFormItemProps } from '../types'

import { ExpressionInput } from '@/components/Expression'

import SettingFormItem from '../SettingFormItem'
import DataSourceSelect from './components/DataSourceSelect'

const Condition:React.FC<SettingFormItemProps> = () => {

  return (
    <Row gutter={12}>
      <Col span={8}>
        <Select placeholder="请选择字段" style={{width: '100%'}} />
      </Col>
      <Col span={6}>
        <Select placeholder="请选择" style={{width: '100%'}} />
      </Col>
      <Col span={10}>
        <ExpressionInput />
      </Col>
    </Row>
  )
}

export const DeleteData:React.FC = () => {

  return (
    <>
      <SettingFormItem
        name="table"
        label="数据库表"
        rules={[{required: true, message: '请选择数据库表'}]}
      >
        <DataSourceSelect />
      </SettingFormItem>
      <SettingFormItem
        name="condition"
        label="匹配条件"
        rules={[{required: true, message: '请添加匹配条件'}]}
      >
        <Condition />
      </SettingFormItem>
      <SettingFormItem
        name="confirm"
        label="启用确认对话框"
        valuePropName="checked"
      >
        <Switch />
      </SettingFormItem>
      <SettingFormItem
        name="successNotice"
        label="启用删除成功提醒"
        valuePropName="checked"
      >
        <Switch />
      </SettingFormItem>
    </>
  )
}
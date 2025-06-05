import React from 'react'
import { Select, Checkbox } from 'antd'

import SettingFormItem from '../SettingFormItem'
import DataFieldSelect from './components/DataFieldSelect'
import DataSourceSelect from './components/DataSourceSelect'
import ContentExpressionInput from './components/ContentExpressionInput'

export const GetOneData:React.FC = () => {

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
      name="field"
      label="查询字段"
      rules={[{required: true, message: '请选择查询字段'}]}
    >
      <DataFieldSelect />
    </SettingFormItem>
    <SettingFormItem
      name="fieldValue"
      label="字段值"
      rules={[{required: true, message: '请选择字段值'}]}
    >
      <ContentExpressionInput />
    </SettingFormItem>
    <SettingFormItem
      name="variable"
      label="存储变量"
      rules={[{required: true, message: '请选择存储变量'}]}
    >
      <Select style={{width: '100%'}} placeholder="请选择" />
    </SettingFormItem>
    <SettingFormItem
      name="hold"
      label={<span />}
      colon={false}
      valuePropName="checked"
    >
      <Checkbox>持久化存储此变量</Checkbox>
    </SettingFormItem>
    </>
  )
}
import { Radio } from 'antd'
import React from 'react'

import SettingFormItem from '../SettingFormItem'

import MappingTable from './components/MappingTable'
// import DataFieldSelect from './components/DataFieldSelect'
import DataSourceSelect from './components/DataSourceSelect'
// import ContentExpressionInput from './components/ContentExpressionInput'

export const defaultData = {
  saveMethod: 'insert'
}

export const SaveData:React.FC = () => {

  return (
    <>
    <SettingFormItem
      required
      name="saveMethod"
      label="保存方式"
    >
      <Radio.Group>
        <Radio value="insert">插入</Radio>
        <Radio value="update">更新</Radio>
      </Radio.Group>
    </SettingFormItem>
    <SettingFormItem
      name="table"
      label="数据库表"
      rules={[{required: true, message: '请选择数据库表'}]}
    >
      <DataSourceSelect />
    </SettingFormItem>
    <SettingFormItem
      name="fieldMapping"
      label="字段映射"
      rules={[{required: true, message: '请添加字段映射'}]}
    >
      <MappingTable />
    </SettingFormItem>
    {/* <SettingFormItem
      name="field"
      label="匹配字段"
      rules={[{required: true, message: '请选择匹配字段'}]}
    >
      <DataFieldSelect />
    </SettingFormItem>
    <SettingFormItem
      name="fieldValue"
      label="字段值"
      rules={[{required: true, message: '请选择字段值'}]}
    >
      <ContentExpressionInput />
    </SettingFormItem> */}
    </>
  )
}
import React from 'react'
import {Select, Checkbox} from 'antd'

import SettingFormItem from '../SettingFormItem'
import MappingTable from './components/MappingTable'
import DataQuerySelect from './components/DataQuerySelect'

export const QueryData:React.FC = () => {

  return (
    <>
      <SettingFormItem
        name="table"
        label="查询"
        rules={[{required: true, message: '请选择关联查询'}]}
      >
        <DataQuerySelect />
      </SettingFormItem>
      <SettingFormItem
        name="fieldMapping"
        label="字段映射"
        rules={[{required: true, message: '请添加字段映射'}]}
      >
        <MappingTable />
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
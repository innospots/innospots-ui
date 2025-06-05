import React from 'react'
import {Select} from 'antd'

import SettingFormItem from '../SettingFormItem'

import WidgetSelect from './components/WidgetSelect'
// import ContentExpressionInput from './components/ContentExpressionInput'

const VALUE_TYPES = [{
  value: 'LAST_EVENT_VALUE',
  label: '上一事件数据'
}]

export const SetData:React.FC = () => {

  return (
    <>
    <SettingFormItem
      name="widgetId"
      label="控件标识"
      rules={[{required: true, message: '请选择控件标识'}]}
    >
      <WidgetSelect placeholder="请选择控件标识" />
    </SettingFormItem>
    <SettingFormItem
      required
      name="valueType"
      label="控件值来源"
    >
      <Select placeholder="请选择" options={VALUE_TYPES} />
    </SettingFormItem>
    {/* <SettingFormItem
      name="value"
      label="值"
      rules={[{required: true, message: '请输入值'}]}
    >
      <ContentExpressionInput />
    </SettingFormItem> */}
    </>
  )
}
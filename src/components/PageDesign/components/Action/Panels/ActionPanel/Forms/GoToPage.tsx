import React from 'react'
import {Radio, Select, Switch} from 'antd'

import SettingFormItem from '../SettingFormItem'
import ContentExpressionInput from './components/ContentExpressionInput'

export const defaultData = {
  type: 'page'
}

export const GoToPage:React.FC = () => {

  return (
    <>
    <SettingFormItem
      required
      name="type"
      label="跳转类型"
      valuePropName="checked"
    >
      <Radio.Group>
        <Radio value="page">页面</Radio>
        <Radio value="url">URL地址</Radio>
      </Radio.Group>
    </SettingFormItem>
    <SettingFormItem
      name="page"
      label="页面"
      rules={[{required: true, message: '请选择页面'}]}
    >
      <Select placeholder="请选择" />
    </SettingFormItem>
    <SettingFormItem
      name="url"
      label="URL地址"
      rules={[{required: true, message: '请输入URL地址'}]}
    >
      <ContentExpressionInput />
    </SettingFormItem>
      <SettingFormItem
        name="blank"
        label="在新标签打开页面"
        valuePropName="checked"
      >
        <Switch />
      </SettingFormItem>
    </>
  )
}
import React from 'react'
import { Input } from 'antd'

import { SettingItem } from './index';

export const WidgetNameSetting: React.FC = () => {

  return (
    <SettingItem
      name="name"
      label="组件名称"
      rules={[{
        required: true,
        message: '请输入组件名称'
      }]}
    >
      <Input placeholder="请输入" />
    </SettingItem>
  )
}

import React from 'react'
import { Switch } from 'antd'

import { SettingItem, WidgetTypeSetting } from './index';

export const WidgetCommonSetting: React.FC = () => {

  return (
    <>
    <WidgetTypeSetting />
    <SettingItem
      label="隐藏"
      name={['settings', 'hidden']}
      valuePropName="checked"
    >
      <Switch />
    </SettingItem>
    <SettingItem
      label="失效"
      name={['settings', 'forbidden']}
      valuePropName="checked"
    >
      <Switch />
    </SettingItem>
    </>
  )
}

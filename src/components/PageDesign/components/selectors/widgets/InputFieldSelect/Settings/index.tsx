import React from 'react';
import {Input, Switch} from 'antd'

import { WidgetSetting, SettingItem, WidgetNameSetting, WidgetCommonSetting, WidgetConditionRule, WidgetValidationRule } from '@/components/PageDesign/components/Viewport/Settings'

const Settings:React.FC = () => {

  return (
    <WidgetSetting>
      <WidgetNameSetting />
      <WidgetCommonSetting />
      <SettingItem required name={['settings', 'label']} label="标题">
        <Input placeholder="请输入标题名称" />
      </SettingItem>
      <SettingItem required name={['settings', 'placeholder']} label="提示信息">
        <Input placeholder="请输入提示信息" />
      </SettingItem>
      <SettingItem name={['settings', 'dependencies']} label="父字段">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'dependencies']} label="父字段">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'filterProps']} label="过滤属性">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'disabled']} label="禁用" valuePropName="checked">
        <Switch />
      </SettingItem>
      <WidgetValidationRule />
      <WidgetConditionRule />
    </WidgetSetting>
  )
}

export default Settings
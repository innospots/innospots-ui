import React from 'react';
import {Input, Switch, InputNumber} from 'antd'

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
      <SettingItem name={['settings', 'initialValue']} label="默认值">
        <Input placeholder="请输入默认值" />
      </SettingItem>
      <SettingItem name={['settings', 'maxLength']} label="最大长度">
        <InputNumber min={1} step={1} precision={0} style={{width: '100%'}} placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'showCount']} label="展示字数" valuePropName="checked">
        <Switch />
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
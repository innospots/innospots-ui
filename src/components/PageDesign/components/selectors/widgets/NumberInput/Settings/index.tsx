import React from 'react';
import {Input, InputNumber, Switch} from 'antd'

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
        <InputNumber placeholder="请输入默认值" style={{width: '100%'}} />
      </SettingItem>
      <SettingItem name={['settings', 'disabled']} label="禁用" valuePropName="checked">
        <Switch />
      </SettingItem>
      <SettingItem name={['settings', 'width']} label="默认宽度">
        <InputNumber min={10} max={100} addonAfter="%" placeholder="请输入" style={{width: '100%'}} />
      </SettingItem>
      <SettingItem name={['settings', 'addonBefore']} label="文本前缀">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'addonAfter']} label="文本后缀">
        <Input placeholder="请输入" />
      </SettingItem>
      <WidgetValidationRule />
      <WidgetConditionRule />
    </WidgetSetting>
  )
}

export default Settings
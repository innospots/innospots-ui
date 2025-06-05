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
      <SettingItem name={['settings', 'url']} label="图片链接">
        <Input placeholder="请输入图片链接" />
      </SettingItem>
      <WidgetConditionRule />
    </WidgetSetting>
  )
}

export default Settings
import React from 'react';
import {Input} from 'antd'

import { WidgetSetting, SettingItem, WidgetNameSetting, WidgetCommonSetting, WidgetConditionRule } from '@/components/PageDesign/components/Viewport/Settings'

const Settings:React.FC = () => {

  return (
    <WidgetSetting>
      <WidgetNameSetting />
      <WidgetCommonSetting />
      <SettingItem required name={['settings', 'label']} label="标题">
        <Input placeholder="请输入标题名称" />
      </SettingItem>
      <SettingItem required name={['settings', 'tableName']} label="表名称">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'dependencies']} label="关联字段">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'codeTitle']} label="标识标题">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'valueTitle']} label="值标题">
        <Input placeholder="请输入" />
      </SettingItem>
      <WidgetConditionRule />
    </WidgetSetting>
  )
}

export default Settings
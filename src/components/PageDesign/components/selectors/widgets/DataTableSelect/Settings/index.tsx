import React from 'react';
import {Input, Switch} from 'antd'

import { WidgetSetting, SettingItem, WidgetNameSetting, WidgetCommonSetting, WidgetConditionRule } from '@/components/PageDesign/components/Viewport/Settings'

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
      <SettingItem required name={['settings', 'dataSource']} label="数据源">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem required name={['settings', 'dependencies']} label="关联字段">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'showAddButton']} label="是否可新建" valuePropName="checked">
        <Switch />
      </SettingItem>
      <SettingItem name={['settings', 'showEditButton']} label="是否可编辑" valuePropName="checked">
        <Switch />
      </SettingItem>
      <WidgetConditionRule />
    </WidgetSetting>
  )
}

export default Settings
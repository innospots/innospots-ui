import React from 'react';
import {Input, Select} from 'antd'

import { WidgetSetting, SettingItem, WidgetNameSetting, WidgetCommonSetting, WidgetConditionRule } from '@/components/PageDesign/components/Viewport/Settings'

const optOptions = ['>>', '='].map(k => ({
  value: k,
  label: k
}))

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
      <SettingItem name={['settings', 'leftPlaceholder']} label="左侧选择器提示信息">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'rightPlaceholder']} label="右侧选择器提示信息">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'opt']} label="运算符">
        <Select placeholder="请选择" options={optOptions} />
      </SettingItem>
      <WidgetConditionRule />
    </WidgetSetting>
  )
}

export default Settings
import _ from 'lodash'
import React from 'react';
// import { useModel } from 'umi';
import {Input, Select, Switch} from 'antd'

import { WidgetSetting, SettingItem, WidgetNameSetting, WidgetCommonSetting, WidgetConditionRule } from '@/components/PageDesign/components/Viewport/Settings'

import { CODE_MODES } from '../index'

const typeOptions = _.map(CODE_MODES, (value, label) => ({
  value: label,
  label
}))

const Settings:React.FC = () => {
  // const { getSettings } = useModel('AppEditor', (model) => ({
  //   getSettings: model.getSelectedWidgetSettings,
  // }));

  // const { enableCompleter } = getSettings() || {};

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
      <SettingItem required name={['settings', 'scriptType']} label="脚本类型">
        <Select placeholder="请选择" style={{width: '100%'}} options={typeOptions} />
      </SettingItem>
      <SettingItem name={['settings', 'enableMappingFields']} label="启用映射字段" valuePropName="checked">
        <Switch />
      </SettingItem>
      <SettingItem name={['settings', 'enableCompleter']} label="自动匹配输入字段" valuePropName="checked">
        <Switch />
      </SettingItem>
      {/* {enableCompleter && (
        <SettingItem name={['settings', 'completerPrefix']} label="自动匹配字段前缀">
          <Input placeholder="请输入前缀" />
        </SettingItem>
      )} */}
      <WidgetConditionRule />
    </WidgetSetting>
  )
}

export default Settings
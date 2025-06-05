import _ from 'lodash'
import React from 'react';
import {Input, Switch} from 'antd'

import { DEFAULT_FORMAT } from '../index'

import CustTimePicker from '../CustTimePicker';
import { WidgetSetting, SettingItem, WidgetNameSetting, WidgetCommonSetting, WidgetConditionRule, WidgetValidationRule } from '@/components/PageDesign/components/Viewport/Settings'

const Settings:React.FC = () => {

  const valueFormat = (changedValues, allValues) => {
    const changed = _.cloneDeep(changedValues)
    if (_.has(changed, 'settings.initialValue')) {
      try {
        changed.settings.initialValue = changed.settings.initialValue.format(DEFAULT_FORMAT)
      } catch (e) {}
    }

    return {
      allValues: _.merge({}, allValues, changed),
      changedValues: changed
    }
  }

  return (
    <WidgetSetting valueFormat={valueFormat}>
      <WidgetNameSetting />
      <WidgetCommonSetting />
      <SettingItem required name={['settings', 'label']} label="标题">
        <Input placeholder="请输入标题名称" />
      </SettingItem>
      <SettingItem required name={['settings', 'placeholder']} label="提示信息">
        <Input placeholder="请输入提示信息" />
      </SettingItem>
      <SettingItem name={['settings', 'initialValue']} label="默认值">
        <CustTimePicker />
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
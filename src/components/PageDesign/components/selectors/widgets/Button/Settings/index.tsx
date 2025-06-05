import React from 'react';
import {Input, Switch, Select} from 'antd';

import {
  SettingBox,
  SettingItem,
  WidgetSetting,
  WidgetNameSetting,
  WidgetCommonSetting
} from '@/components/PageDesign/components/Viewport/Settings';

import ClickEvent from './ClickEvent'

const buttonTypes = [{
  value: 'default',
  label: '默认'
}, {
  value: 'primary',
  label: '主按钮'
}]

const Settings:React.FC = () => {

  return (
    <WidgetSetting>
      <WidgetNameSetting />
      <WidgetCommonSetting />
      <SettingItem required name={['settings', 'text']} label="文字">
        <Input placeholder="请输入按钮展示文字" />
      </SettingItem>
      <SettingItem name={['settings', 'type']} label="样式">
        <Select options={buttonTypes} />
      </SettingItem>
      <SettingItem name={['settings', 'disabled']} label="禁用" valuePropName="checked">
        <Switch />
      </SettingItem>
      <SettingBox title="事件">
        <SettingItem name={['settings', 'clickEvent']} label="OnClick">
          <ClickEvent />
        </SettingItem>
      </SettingBox>
    </WidgetSetting>
  )
}

export default Settings
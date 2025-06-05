import React from 'react';
import { useModel } from 'umi';
import { Input, Radio, Checkbox, Switch } from 'antd';

import {
  WidgetSetting,
  SettingItem,
  WidgetNameSetting,
  WidgetCommonSetting,
  WidgetConditionRule,
} from '@/components/PageDesign/components/Viewport/Settings';

const VIEW_TYPE_OPTIONS = [
  { label: '开关', value: 'switch' },
  { label: '复选框', value: 'checkbox' },
];

const Settings: React.FC = () => {
  const { getSettings } = useModel('AppEditor', (model) => ({
    getSettings: model.getSelectedWidgetSettings,
  }));

  const { viewType } = getSettings();

  return (
    <WidgetSetting>
      <WidgetNameSetting />
      <WidgetCommonSetting />
      <SettingItem required name={['settings', 'label']} label="标题">
        <Input placeholder="请输入标题名称" />
      </SettingItem>
      <SettingItem name={['settings', 'disabled']} label="禁用" valuePropName="checked">
        <Switch />
      </SettingItem>
      <SettingItem name={['settings', 'viewType']} label="展现形式">
        <Radio.Group options={VIEW_TYPE_OPTIONS} />
      </SettingItem>
      <SettingItem name={['settings', 'initialValue']} label="默认值" valuePropName="checked">
        {viewType === 'checkbox' ? <Checkbox>是否默认选中</Checkbox> : <Switch />}
      </SettingItem>
      <SettingItem
        required
        label="复选框标题"
        hidden={viewType !== 'checkbox'}
        name={['settings', 'placeholder']}
      >
        <Input placeholder="请输入复选框标题" />
      </SettingItem>
      <WidgetConditionRule />
    </WidgetSetting>
  );
};

export default Settings;

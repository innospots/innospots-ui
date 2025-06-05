import React from 'react';
import { Input, InputNumber, Switch } from 'antd';

import {
  WidgetSetting,
  SettingItem,
  WidgetNameSetting,
  WidgetCommonSetting,
} from '@/components/PageDesign/components/Viewport/Settings';

const Settings: React.FC = () => {
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
      <SettingItem name={['settings', 'disabled']} label="禁用" valuePropName="checked">
        <Switch />
      </SettingItem>
      <SettingItem name={['settings', 'maxCount']} label="最大上传数量">
        <InputNumber min={1} step={1} precision={0} style={{width: '100%'}} placeholder="请输入" />
      </SettingItem>
    </WidgetSetting>
  );
};

export default Settings;

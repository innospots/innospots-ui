import React from 'react';
import { Input } from 'antd';

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
    </WidgetSetting>
  );
};

export default Settings;

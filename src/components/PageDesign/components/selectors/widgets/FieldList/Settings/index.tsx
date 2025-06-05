import React from 'react';
import { Input } from 'antd';
import {
  WidgetSetting,
  SettingItem,
  WidgetFieldSource,
  WidgetNameSetting,
  WidgetCommonSetting,
  WidgetConditionRule,
} from '@/components/PageDesign/components/Viewport/Settings';

// import OptionsTable from '../Widget';
// import KeyValueEditor from '../../KeyValueEditor/Widget';
import CustomColumns from '../CustomColumns';

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
      <WidgetFieldSource />
      <SettingItem name={['settings', 'customColumns']} label="自定义表格列">
        <CustomColumns />
      </SettingItem>
      {/*<SettingItem name={['settings', 'initialValue']} label="默认值">*/}
      {/*  <OptionsTable />*/}
      {/*</SettingItem>*/}
      <WidgetConditionRule />
    </WidgetSetting>
  );
};

export default Settings;

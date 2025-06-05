import React, { useMemo } from 'react';
import { useModel } from 'umi';
import { Input, Radio, Select } from 'antd';

import {
  WidgetSetting,
  SettingItem,
  WidgetNameSetting,
  WidgetFieldSource,
  WidgetCommonSetting,
  WidgetConditionRule,
} from '@/components/PageDesign/components/Viewport/Settings';

import OptionsTable from '../../KeyValueEditor/Widget';

const DATA_SOURCE_OPTIONS = [
  { label: '手动输入', value: 'static' },
  // { label: '接口输入', value: 'interface' },
  { label: '输入字段', value: 'input' },
];

const Settings: React.FC = () => {
  const { getSettings } = useModel('AppEditor', (model) => ({
    getSettings: model.getSelectedWidgetSettings,
  }));

  const { dataSource } = getSettings();
  const isStatic = useMemo(() => dataSource === 'static', [dataSource]);
  // const isInterface = useMemo(() => (dataSource === 'interface'), [ dataSource ])
  const isInputField = useMemo(() => dataSource === 'input', [dataSource]);

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
      {/* <SettingItem name={['settings', 'optionsType']} label="选项类型">
        <Radio.Group options={VIEW_TYPE_OPTIONS} />
      </SettingItem> */}
      <SettingItem name={['settings', 'dataSource']} label="选项数据源">
        <Radio.Group options={DATA_SOURCE_OPTIONS} />
      </SettingItem>
      {isInputField && <WidgetFieldSource />}
      <SettingItem hidden={!isStatic} name={['settings', 'options']} label="选项">
        <OptionsTable />
      </SettingItem>
      <WidgetConditionRule />
    </WidgetSetting>
  );
};

export default Settings;

import React, { useMemo } from 'react';
import { Input, Radio, Divider } from 'antd';
import { useModel } from 'umi';

import {
  WidgetSetting,
  SettingItem,
  WidgetNameSetting,
  WidgetCommonSetting,
  WidgetConditionRule,
} from '@/components/PageDesign/components/Viewport/Settings';

import OptionsTable from '../../KeyValueEditor/Widget';

const CONDITION_OPTIONS = [
  { label: '是', value: '1' },
  { label: '否', value: '0' },
];

const DATA_SOURCE_OPTIONS = [
  { label: '手动输入', value: 'static' },
  { label: '接口输入', value: 'interface' },
];

const OPTIONS_METHOD = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
];

const Settings: React.FC = () => {
  const { getSettings } = useModel('AppEditor', (model) => ({
    getSettings: model.getSelectedWidgetSettings,
  }));

  const { conditionOption, conditionOptionsMethod } = getSettings();

  const isShowConditionOption = conditionOption === '1';
  const isStatic = conditionOptionsMethod !== 'interface';

  return (
    <WidgetSetting>
      <WidgetNameSetting />
      <WidgetCommonSetting />
      <SettingItem required name={['settings', 'label']} label="标题">
        <Input placeholder="请输入标题名称" />
      </SettingItem>
      <SettingItem name={['settings', 'dependencies']} label="关联字段">
        <Input placeholder="请输入" />
      </SettingItem>
      <SettingItem name={['settings', 'conditionOption']} label="开启条件值选项">
        <Radio.Group options={CONDITION_OPTIONS} />
      </SettingItem>
      {isShowConditionOption && (
        <>
          <SettingItem name={['settings', 'conditionOptionsMethod']} label="条件值选项获取方式">
            <Radio.Group options={DATA_SOURCE_OPTIONS} />
          </SettingItem>
          <SettingItem noStyle hidden={isStatic}>
            {
              <>
                <SettingItem required name={['settings', 'dynamicOptions', 'url']} label="选项URL">
                  <Input placeholder="请输入" />
                </SettingItem>
                <SettingItem
                  required
                  name={['settings', 'dynamicOptions', 'method']}
                  initialValue="GET"
                  label="请求方式"
                >
                  <Radio.Group options={OPTIONS_METHOD} />
                </SettingItem>
                <div style={{ padding: '0 8px' }}>
                  <span style={{ paddingLeft: 12 }}>字段映射：</span>
                  <Divider style={{ margin: '8px 0' }} />
                  <SettingItem
                    name={['settings', 'dynamicOptions', 'fieldNames', 'value']}
                    label="字段值"
                  >
                    <Input placeholder="请输入" />
                  </SettingItem>
                  <SettingItem
                    name={['settings', 'dynamicOptions', 'fieldNames', 'label']}
                    label="字段文字"
                  >
                    <Input placeholder="请输入" />
                  </SettingItem>
                </div>
              </>
            }
          </SettingItem>
          <SettingItem
            hidden={!isStatic}
            name={['settings', 'conditionOptions']}
            label="条件值选项"
          >
            <OptionsTable />
          </SettingItem>
        </>
      )}
      <WidgetConditionRule />
    </WidgetSetting>
  );
};

export default Settings;

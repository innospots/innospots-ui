import { Radio } from 'antd';
import React from 'react';
import { useModel } from 'umi';

import SettingFormItem from '../SettingFormItem';

import FieldMapping from './components/FieldMapping';
import WidgetSelect from './components/WidgetSelect';
import DataSourceSelect from './components/DataSourceSelect';

export const ReadData: React.FC = () => {
  const { currentFormData } = useModel('Action', (model) => ({
    currentFormData: model.currentActionFormData,
  }));
  const showType = currentFormData.showType;

  return (
    <>
      <SettingFormItem required name="action" label="请求方式" initialValue="GET">
        <Radio.Group>
          <Radio value="GET">GET</Radio>
          <Radio value="POST">POST</Radio>
        </Radio.Group>
      </SettingFormItem>
      <SettingFormItem
        name="table"
        label="读取API"
        rules={[{ required: true, message: '请选择读取API' }]}
      >
        <DataSourceSelect />
      </SettingFormItem>
      <SettingFormItem name="fieldMapping" label="字段映射">
        <FieldMapping />
      </SettingFormItem>
      <SettingFormItem name="showType" label="结果展示方式" initialValue="FORM">
        <Radio.Group>
          <Radio value="FORM">当前表单</Radio>
          <Radio value="WIDGET">选定组件</Radio>
        </Radio.Group>
      </SettingFormItem>
      {showType === 'WIDGET' && (
        <SettingFormItem
          name="widget"
          label="组件"
          rules={[{ required: true, message: '请选择组件' }]}
        >
          <WidgetSelect placeholder="请选择组件" />
        </SettingFormItem>
      )}
    </>
  );
};

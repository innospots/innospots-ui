import { Radio } from 'antd';
import React from 'react';

import SettingFormItem from '../SettingFormItem';

import FieldMapping from './components/FieldMapping';
import DataSourceSelect from './components/DataSourceSelect';

export const SubmitFormData: React.FC = () => {
  return (
    <>
      <SettingFormItem required name="action" label="请求方式" initialValue="POST">
        <Radio.Group>
          <Radio value="POST">POST</Radio>
          <Radio value="PUT">PUT</Radio>
        </Radio.Group>
      </SettingFormItem>
      <SettingFormItem
        name="table"
        label="接入API"
        rules={[{ required: true, message: '请选择接入API' }]}
      >
        <DataSourceSelect />
      </SettingFormItem>
      <SettingFormItem
        name="fieldMapping"
        label="字段映射"
      >
        <FieldMapping />
      </SettingFormItem>
      {/* <SettingFormItem
      name="field"
      label="匹配字段"
      rules={[{required: true, message: '请选择匹配字段'}]}
    >
      <DataFieldSelect />
    </SettingFormItem>
    <SettingFormItem
      name="fieldValue"
      label="字段值"
      rules={[{required: true, message: '请选择字段值'}]}
    >
      <ContentExpressionInput />
    </SettingFormItem> */}
    </>
  );
};

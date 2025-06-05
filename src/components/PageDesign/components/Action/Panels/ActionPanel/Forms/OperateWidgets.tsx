import { Radio } from 'antd';
import React from 'react';
import { useModel } from 'umi';

import SettingFormItem from '../SettingFormItem';

import OperateWidgetsTable from './components/OperateWidgetsTable';

export const OperateWidgets: React.FC = () => {

  return (
    <SettingFormItem noStyle name="widgets">
      <OperateWidgetsTable />
    </SettingFormItem>
  );
};

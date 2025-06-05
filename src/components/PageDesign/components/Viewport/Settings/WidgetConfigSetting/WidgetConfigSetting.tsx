import React, { useEffect } from 'react';

import _ from 'lodash';
import { Form } from 'antd';
import { useModel } from 'umi';
import { useDebounceFn } from 'ahooks';

import styles from './style.less';

export const WidgetConfigSetting: React.FC = ({ children }) => {
  const { selectedWidget, updateWidgetProps } = useModel('AppEditor', (model) => ({
    selectedWidget: model.selectedWidget,
    updateWidgetProps: model.updateSelectedWidgetProps,
  }));

  const [form] = Form.useForm();

  const handleValuesChange = (changedValues, allValues) => {
    console.info(changedValues, allValues);
  };

  return (
    <div className={styles.settingItemWrapper}>
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        {children}
      </Form>
    </div>
  );
};

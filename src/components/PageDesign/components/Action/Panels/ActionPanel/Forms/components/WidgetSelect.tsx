import _ from 'lodash';
import { useModel } from 'umi';
import React, { useMemo } from 'react';
import { Select, SelectProps } from 'antd';

import { SettingFormItemProps } from '../../types';

const WidgetSelect: React.FC<SettingFormItemProps & SelectProps & {
  excludeTypes?: string[]
  widgets?: {
    value: string
    label: string
  }[]
}> = ({ placeholder, excludeTypes, widgets, ...props }) => {
  const { currentPage } = useModel('AppEditor', (model) => ({
    currentPage: model.currentPage,
  }));

  const widgetOptions = useMemo(() => {
    if (widgets) {
      return widgets;
    }
    if (currentPage) {
      const options: any[] = [];
      _.each(currentPage.components, (item) => {
        if (!(excludeTypes || []).includes(item.type)) {
          options.push({
            value: item.name,
            label: item.settings?.label || item.name,
          });
        }
      });
      return options;
    }
    return [];
  }, [currentPage, excludeTypes, widgets]);

  return (
    <Select
      allowClear
      options={widgetOptions}
      style={{ width: '100%' }}
      placeholder={placeholder || "请选择"}
      { ...props }
    />
  );
};

export default WidgetSelect;

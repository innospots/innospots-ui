import _ from 'lodash';
import moment from 'moment';
import React, { useMemo } from 'react';
import { DatePicker } from 'antd'
import { useControllableValue } from 'ahooks';

import { DEFAULT_FORMAT } from './index';

import ReadOnlyWidget from '../ReadOnlyWidget';

const CustDatePicker:React.FC<Record<string, any>> = ({ value, widgetType, onChange, ...props }) => {
  const [curValue, setCurValue] = useControllableValue({
    value,
    onChange
  });

  const formatValue = useMemo(() => (_.isString(curValue) ? moment(curValue, DEFAULT_FORMAT) : curValue), [curValue]);

  const handleValueChange = (newValue) => {
    setCurValue(newValue ? newValue.format(DEFAULT_FORMAT) : newValue)
  };

  if (widgetType === 'view') {
    return (
      <ReadOnlyWidget value={curValue} { ...props } />
    )
  }

  return (
    <DatePicker
      { ...props }
      value={formatValue}
      format={DEFAULT_FORMAT}
      style={{ width: '100%' }}
      onChange={handleValueChange}
    />
  );
};

export default CustDatePicker;

import _ from 'lodash';
import moment from 'moment';
import React, { useMemo } from 'react';
import { DatePicker } from 'antd'
import { useControllableValue } from 'ahooks';

import { DEFAULT_FORMAT } from './index';

import ReadOnlyWidget from '../ReadOnlyWidget';

const CustDatePicker:React.FC<{
  value?: any 
  onChange?: (value: any) => void
  widgetType?: string
}> = ({ value, onChange, widgetType, ...props }) => {
  const [curValue, setCurValue] = useControllableValue({
    value,
    onChange
  });

  const formatValue = useMemo(() => _.map(curValue, v => _.isString(v) ? moment(v, DEFAULT_FORMAT) : v), [curValue]);
  const showValue = useMemo(() => {
    const sv = _.map(curValue, v => _.isString(v) ? moment(v).format(DEFAULT_FORMAT) : v)
    return sv.join(' - ')
  }, [curValue]);

  const handleValueChange = (newValue) => {
    let values = newValue
    if (values) {
      values = _.map(values, v => _.isString(v) ? moment(v, DEFAULT_FORMAT) : v)
    }
    setCurValue(values)
  };

  if (widgetType === 'view') {
    return (
      <ReadOnlyWidget value={showValue} { ...props } />
    )
  }

  return (
    <DatePicker.RangePicker
      { ...props }
      value={formatValue}
      format={DEFAULT_FORMAT}
      style={{ width: '100%' }}
      onChange={handleValueChange}
    />
  );
};

export default CustDatePicker;

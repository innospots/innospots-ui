/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { useEffect, useMemo } from 'react';
import _ from 'lodash';
import { Select, SelectProps } from 'antd';

import type { FormItemProps } from './types';

import useI18n from '@/common/hooks/useI18n';

const FieldSelect: React.FC<
  FormItemProps &
  SelectProps & {
  onChange: (value: any) => {};
}> = ({ value, schema, readOnly, onChange}) => {
  const { t } = useI18n(['common']);
  const { optionsType, placeholder, options } = schema || {};

  const curOptions = useMemo(() => {
    if (optionsType === 'dateOptions') {
        return _.map(_.range(1, 32), (n) => ({
            value: n,
            label: n,
        }));
    }

    return options || []
  }, [ optionsType, options ]);

  useEffect(() => {
    if (_.isUndefined(value)) return;
    
    const result = _.find(curOptions, item => item.value == value);
    if (!result) {
      onChange(curOptions[0]?.value)
    }
  }, [ value, curOptions ]);

  const renderReadOnlyItem = () => {
    const result = _.find(curOptions, item => item.value === value);
    return (
      <div className="form-item-value">
        { result ? result.label : (value || '-') }
      </div>
    )
  }

  if (readOnly) {
    return renderReadOnlyItem();
  }

  return (
    <Select
      allowClear
      value={value}
      mode={schema.mode}
      options={curOptions}
      style={{width: '100%'}}
      dropdownMatchSelectWidth={false}
      placeholder={placeholder || t('common.select.placeholder')}
      onChange={onChange}
    />
  );
};

export default FieldSelect;

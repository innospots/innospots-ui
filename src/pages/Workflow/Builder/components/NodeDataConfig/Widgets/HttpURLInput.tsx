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

import React, {useMemo} from 'react';

import _ from 'lodash';
import {Input, Select} from 'antd';
import {useControllableValue} from 'ahooks';

import useI18n from '@/common/hooks/useI18n';

import type {FormItemProps} from './types';

const SELECT_OPTIONS = [{
  value: 'GET',
  label: 'GET'
}, {
  value: 'POST',
  label: 'POST'
}];

const defaultValue = ['POST'];

const HttpURLInput: React.FC<FormItemProps> = ({readOnly, addons, schema, ...props}) => {

  const { t } = useI18n('common');
  const {props: formProps} = schema;

  const [value, setValue] = useControllableValue(props);

  const currentValue = useMemo(() => {
    if (_.isString(value) && value) {
      const values = value.split(',');
      if (values.length > 1) {
        const method = _.toUpper(values[0]);
        const url = value.replace(new RegExp('^('+ method +'),'), '');
        return [method, url];
      }
      return values
    }
    return value || defaultValue
  }, [value]);

  const handleMethodChange = (method: string) => {
    const cloneValue = _.clone(currentValue);
    cloneValue[0] = method;
    setValue(cloneValue);
  }

  const handleURLChange = (event) => {
    const cloneValue = _.clone(currentValue);
    cloneValue[1] = event.target.value;
    setValue(cloneValue);
  }

  return (
    <Input.Group compact>
      <Select
        value={currentValue?.[0]}
        disabled={readOnly}
        style={{width: 100}}
        options={SELECT_OPTIONS}
        placeholder={t('common.select.placeholder')}
        onChange={handleMethodChange}
      />
      <Input
        value={currentValue?.[1]}
        disabled={readOnly}
        style={{ width: 'calc(100% - 100px)' }}
        placeholder={formProps?.placeholder || t('common.input.placeholder')}
        onChange={handleURLChange}
      />
    </Input.Group>
  );
};

export default HttpURLInput;

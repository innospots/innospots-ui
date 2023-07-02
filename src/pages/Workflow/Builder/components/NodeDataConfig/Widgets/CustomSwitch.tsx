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

import React, { useState, useEffect, useMemo } from 'react';
import _ from 'lodash';
import { Switch, SwitchProps } from 'antd';

import type { FormItemProps } from './types';

const CustomSwitch: React.FC<
  FormItemProps &
  SwitchProps & {
  onChange: (value: any) => {};
}> = ({ value, schema, readOnly, addons, onChange}) => {

  const [newValue, setNewValue] = useState<boolean>();

  useEffect(() => {
    onChange(schema.default);
    setNewValue(schema.default);
  }, [schema.default]);

  const curValue = useMemo(() => {
    if (!_.isUndefined(newValue)) return newValue;
    if (_.isUndefined(value)) return schema.default;

    return value;
  }, [ value, newValue, schema.default ]);

  const handleChange = (checked: boolean) => {
    onChange(checked);
    setNewValue(checked)
  }

  return (
    <Switch checked={curValue} disabled={readOnly} onChange={handleChange} />
  );
};

export default CustomSwitch;

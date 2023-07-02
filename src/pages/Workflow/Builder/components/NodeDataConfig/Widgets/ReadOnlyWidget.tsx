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

import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Switch } from 'antd';

const ReadOnlyWidget:React.FC<{
  schema: any
  value: any
}> = ({ value, schema }) => {

  const [newValue, setNewValue] = useState('');

  const getOptionsValue = () => {
    const _value = schema.enumNames[(schema.enum || []).indexOf(value)] || value;
    setNewValue(_value)
  }

  const getCheckboxValue = () => {
    const values = _.map(value, v => {
      const index = (schema.enum || []).indexOf(v);
      return (schema.enumNames || [])[index] || v;
    })
    setNewValue(values.join('、'))
  }

  useEffect(() => {
    if (schema.type === 'string') {
      if (!schema.widget) {
        setNewValue(value)
      } else if (['select', 'radio'].includes(schema.widget)) {
        getOptionsValue()
      } else {
        setNewValue(value)
      }
    } else if (schema.type === 'array') {
      if ('checkboxes' === schema.widget) {
        getCheckboxValue()
      } else {
        if (_.isArray(value)) {
          setNewValue(value.join('、'))
        } else {
          setNewValue(value)
        }
      }
    } else {
      setNewValue(value)
    }
  }, [ value, schema ]);

  if (schema.type === 'boolean' && schema.widget === 'switch') {
    return (
      <Switch disabled checked={value} />
    )
  }

  return (
    <div className="form-item-value">
        { newValue || '-' }
    </div>
  )
}

export default ReadOnlyWidget
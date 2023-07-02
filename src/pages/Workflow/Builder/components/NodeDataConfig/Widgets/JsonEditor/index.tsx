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

import React, {useState, useMemo, useEffect} from 'react';
import JSONInput from 'react-json-editor-ajrm';
import {useControllableValue} from 'ahooks';
import { isString, debounce } from 'lodash'

import type {FormItemProps} from '../types';

import styles from './index.less';

const JsonEditor:React.FC<FormItemProps> = ({ schema, readOnly, ...rest }) => {

  const [json, setJson] = useState({});
  const [error, setError] = useState();
  const curProps = useMemo(() => {
    const props = { ...rest };
    if (props.value === undefined) {
      props.value = schema.default || '{}'
    }
    return props
  }, [rest, schema.default]);
  const [jsonValue, setJsonValue] = useControllableValue(curProps);

  useEffect(() => {
    if (isString(jsonValue)) {
      try {
        setJson(JSON.parse(jsonValue))
      } catch (e) {}
    }
  }, [ jsonValue ]);

  const inputBlur = data => {
    try {
      setError(data.error);
      setJsonValue(data.json);
    } catch (e) {}
  }

  const inputChange = data => {
    try {
      if (error && !data.error) {
        setError(undefined);
      }
    } catch (e) {}
  }

  return (
    <div className={styles.container}>
      <JSONInput
        width="100%"
        height="310px"
        error={error}
        viewOnly={readOnly}
        placeholder={json}
        colors={{
          background: '#fafafa'
        }}
        onKeyPressUpdate={false}
        onBlur={inputBlur}
      />
    </div>
  )
}

export default JsonEditor
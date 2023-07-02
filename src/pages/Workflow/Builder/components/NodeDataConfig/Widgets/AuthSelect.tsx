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

import React, {useContext, useMemo, useEffect} from 'react';
import {Select} from 'antd';
import _ from 'lodash';
import { useModel } from 'umi';

import useI18n from '@/common/hooks/useI18n';
import FormContext from './FormContext';

import type {FormItemProps} from './types';

const AuthSelect: React.FC<FormItemProps> = ({ schema, readOnly, ...props }) => {
  const {t} = useI18n(['common']);

  const { formSchema, setFormSchema } = useModel('App', model => ({
    formSchema: model.formSchema,
    setFormSchema: model.setFormSchema,
  }));
  const { appData } = useContext(FormContext);

  const currentWidgetId = useMemo(() => (schema?.$id || '').replace(/\#\//g, ''), [schema?.$id]);

  const authOptions = useMemo(() => _.map(appData?.connectorConfigs, item => ({
    value: item.configCode,
    label: item.configName
  })), [appData?.connectorConfigs]);

  const current = useMemo(() => {
    if (!readOnly || !authOptions.length || !props.value) return '-';
    const curItem = _.find(authOptions, item => item.value === props.value) || { label: '-' };
    return curItem.label;
  }, [ authOptions, props.value, readOnly ]);

  useEffect(() => {
    try {
      const options = formSchema.properties[currentWidgetId].options || [];
      if (!options.length && authOptions.length) {
        // @ts-ignore
        formSchema.properties[currentWidgetId].options = authOptions;
        setFormSchema(formSchema);
      }
    } catch (e) {}
  }, [ authOptions, currentWidgetId ]);

  if (readOnly) {
    return (
      <span className="form-item-value">
          { current }
      </span>
    )
  }

  return (
    <Select
      allowClear
      options={authOptions}
      dropdownMatchSelectWidth={false}
      placeholder={t('common.select.placeholder')}
      style={{width: '100%'}}
      { ...props}
      disabled={readOnly}
    />
  );
};

export default AuthSelect;

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

import React, {useMemo, useCallback, useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import _ from 'lodash';
import {useForm} from 'form-render';

import FormContext from './Widgets/FormContext';
import CustomFormRender from '../CustomFormRender';

const ConfigFormRender = (props, ref) => {
  const {nodeId, viewType, schema = {}, appData, errorFields, initialValues, onValuesChange} = props;

  const form = useForm();
  const [formValues, setFormValues] = useState({});
  const [formMount, setFormMount] = useState(false);
  const [changedValues, setChangedValues] = useState({});
  const [curErrorFields, setCurErrorFields] = useState([]);

  useEffect(() => {
    setFormValues({});
    setChangedValues({});
    setCurErrorFields([]);
  }, [nodeId]);

  const formatSchema = useMemo(() => {
    if (!appData || !appData.config) return {};

    if (viewType !== 'info') return appData.config;

    const _schema = _.cloneDeep(appData.config.schema || appData.config);
    try {
      Object.keys(_schema.properties).forEach(key => {
        if (key !== 'displayName') {
          _schema.properties[key].readOnly = true;
        }
      })
    } catch (e) {
    }

    return _schema
  }, [ appData, nodeId, viewType ]);

  useEffect(() => {
    if (formMount) {
      form.setValues(initialValues);
    }
  }, [JSON.stringify(initialValues), formMount]);

  useEffect(() => {
    if (errorFields) {
      setCurErrorFields([...errorFields]);
    }
  }, [errorFields]);

  useEffect(() => {
    // checkDependencies(changedValues);
    resetErrorFields(_.keys(changedValues)[0]);
  }, [changedValues]);

  /**
   * 暴露给父组件的方法
   */
  useImperativeHandle(ref, () => ({
    resetValue: () => {
      form.resetFields();
    },

    validateFields: () => {
      return new Promise((resolve, reject) => {
        form.validateFields().then((values) => {
          resolve(values);
        }).catch((errorInfo) => {
          reject(errorInfo);
        });
      });
    },
  }));

  const resetErrorFields = (fieldName) => {
    if (!_.isArray(fieldName)) {
      fieldName = [fieldName];
    }
    const index = _.findIndex(curErrorFields, (field) => _.isEqual(field.name, fieldName));

    if (index > -1) {
      curErrorFields.splice(index, 1);
      setCurErrorFields([...curErrorFields]);
    }
  };

  const handleValuesChange = (changedValues, allValues) => {
    // if (changedValues.dataPath === 'displayName') {
    onValuesChange && onValuesChange({
      [changedValues.dataPath]: changedValues.value
    }, allValues);
    // }
  };

  const handleFormMount = useCallback(() => {
    setFormMount(true)
  }, [])

  return (
    <FormContext.Provider
      value={{
        appData,
        viewType,
        formValues,
        initialValues,
        formSchema: formatSchema,
        errorFields: curErrorFields,
      }}
    >
      <div className="config-form">
        <CustomFormRender
          form={form}
          layout="vertical"
          scrollToFirstError
          schema={formatSchema}
          validateTrigger="onBlur"
          onMount={handleFormMount}
          onValuesChange={handleValuesChange}
        />
      </div>
    </FormContext.Provider>);
};

export default forwardRef(ConfigFormRender);

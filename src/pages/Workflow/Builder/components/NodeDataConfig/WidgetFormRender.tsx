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

import _ from 'lodash'
import cls from 'classnames'
import { useModel } from 'umi'
import React, { useEffect } from 'react';

import WidgetsRender from '@/components/PageDesign/components/WidgetsRender';

const WidgetFormRender: React.FC<any> = ({ widgetType = 'edit', initialValues }) => {
  const {
    formValues,
    formatedLayout,
    updateFormValue,
  } = useModel('AppEditor', model => ({
    formValues: model.formValues,
    formatedLayout: model.formatedLayout,
    updateFormValue: model.updateFormValue,
  }));
  const {
    flowNodeConfigState
  } = useModel('FlowNode', model => ({
    flowNodeConfigState: model.flowNodeConfigState,
  }));

  const { widgets, layouts } = formatedLayout

  const handleValuesChange = (changedValues, allValues) => {
  };

  const getFormInstance = (form: any) => {
    flowNodeConfigState.formInstance = form
  }

  useEffect(() => {
    const form = flowNodeConfigState.formInstance
    if (form) {
      form.setFieldsValue({
        ...(initialValues || {})
      })
      formValues.editValues = {
        ...formValues.editValues,
        ...initialValues
      }
      updateFormValue(formValues)
    }
  }, [ initialValues, flowNodeConfigState.formInstance ])

  return (
    <div className={cls('widget-form-render', 'config-form', 'custom-scrollbar')}>
      <WidgetsRender
        appType="node"
        pageType="preview"
        layouts={layouts}
        widgets={widgets}
        widgetType={widgetType}
        onValuesChange={handleValuesChange}
        getFormInstance={getFormInstance}
      />
    </div>
  )
}

export default WidgetFormRender

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
import React from 'react';

import WidgetsRender from '../../../WidgetsRender';

import styles from '../../style.less'

const NodeViews: React.FC = () => {
  const {
    formatedLayout
  } = useModel('AppEditor', model => ({
    formatedLayout: model.formatedLayout
  }));
  const {
    flowNodeDebugState
  } = useModel('FlowNode', model => ({
    flowNodeDebugState: model.flowNodeDebugState,
  }));

  const { widgets, layouts } = formatedLayout

  const handleValuesChange = (changedValues, allValues) => {
    _.merge(flowNodeDebugState.data, allValues)
  };

  const getFormInstance = (form: any) => {
    flowNodeDebugState.formInstance = form
  }

  return (
    <div className={cls(styles.nodeViews, `node-views-wrapper`)}>
      <WidgetsRender
        appType="node"
        pageType="view"
        layouts={layouts}
        widgets={widgets}
        onValuesChange={handleValuesChange}
        getFormInstance={getFormInstance}
      />
    </div>
  )
}

export default NodeViews

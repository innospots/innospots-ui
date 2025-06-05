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

import _ from 'lodash';
import { useDebounceEffect } from 'ahooks'
import {useContext, useMemo, useEffect} from 'react';

import { useModel } from 'umi';
import {Row, Col} from 'antd';

import CurContext from '../../common/context';
import WidgetFormRender from './WidgetFormRender';

import styles from './index.less';

const NodeConfig = () => {
  const {nodeId, nodeData, onChange} = useContext(CurContext);

  const {
    currentAppInfo
  } = useModel('App', model => ({
    currentAppInfo: model.currentAppInfo
  }));
  const {
    formValues,
    updateFormValue
  } = useModel('AppEditor', model => ({
    formValues: model.formValues,
    updateFormValue: model.updateFormValue
  }));

  const configData = _.get(nodeData, 'configData', {});

  const handleValuesChange = (changedValues) => {
    onChange(changedValues);
  };

  const initialValues = useMemo(() => {
    return {
      ...nodeData.data, displayName: nodeData.displayName,
    };
  }, [nodeData.data, nodeData.displayName]);

  useDebounceEffect(() => {
    formValues.currentValues = {
      ...initialValues
    }
    updateFormValue(formValues)
  }, [ initialValues ], {
    wait: 1e3
  })

  const renderConfigInfo = () => {
    return (
      <WidgetFormRender
        nodeId={nodeId}
        viewType="info"
        { ...configData }
        appData={currentAppInfo}
        schema={configData.config}
        initialValues={initialValues}
        onValuesChange={handleValuesChange}
      />
    );
  };

  return (
    <div className={styles.nodeConfig}>
      <div style={{padding: '0 12px'}}>
        <Row style={{marginBottom: 24}} gutter={12}>
          <Col>nodeKey:</Col>
          <Col>
            <span className="form-item-value">{nodeId}</span>
          </Col>
        </Row>
      </div>
      <div>{renderConfigInfo()}</div>
    </div>
  );
};

export default NodeConfig;

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

import React, {useRef, useEffect, useState, useContext, useCallback} from 'react';
import cls from 'classnames';
import {useModel} from 'umi';
import _ from 'lodash';

import {Button} from 'antd';
import SplitPane from 'react-split-pane';
import Pane from 'react-split-pane/lib/Pane';
import {BorderOutlined, CloseOutlined, MinusOutlined} from '@ant-design/icons';

import DataContext from '../DataContext';
import NavTabs from '../components/NavTabs';
import NodeConfigPreview from '../components/NodeConfigPreview';

import CodeEditor from './components/CodeEditor';
import ParamConfig from './components/ParamConfig';
import ExecutionResult from './components/ExecutionResult';

import styles from './style.less';

const tabItems = [{
  key: 'log',
  label: '执行日志'
}, {
  key: 'result',
  label: '执行结果'
}, {
  key: 'json',
  label: 'JSON结构'
}, {
  key: 'attachment',
  label: '文件'
}];

const CodeConfig = () => {

  const paramConfigRef = useRef(null);
  const { appDetail, appValue, executeValue, pageType } = useContext(DataContext);

  const {
    executeResult,
    setExecuteResult,
    appExecuteRequest
  } = useModel('App', model => ({
    executeResult: model.executeResult,
    setExecuteResult: model.setExecuteResult,
    appExecuteRequest: model.appExecuteRequest
  }));

  const [resultKey, setResultKey] = useState('log');
  const [resultVisible, setResultVisible] = useState(false);

  useEffect(() => {
    setResultKey('log');
    setResultVisible(false);
    setExecuteResult({});
  }, [pageType]);

  const handleAppExecute = async (values) => {
    const inputs = executeValue.inputs.map(item => {
      return {
        ...item,
        resources: (item.resources || []).map(res => {
          const response = res.response || {};
          return response.body;
        })
      }
    });
    const postData = {
      inputs,
      ni: {
        data: {},
        nodeType: appValue.nodeType,
        ...values
      }
    };

    postData.ni.data = await paramConfigRef.current?.validateFields();

    _.extend(postData.ni, appDetail);

    appExecuteRequest.run(postData)
  }

  const handleKeyChange = useCallback((key: string) => {
    setResultKey(key);
    if (!resultVisible) {
      setResultVisible(true)
    }
  }, [ resultKey, resultVisible ]);

  const renderExecutionResult = () => {
    return (
      <div className={styles.executionItems}>
        <div className={styles.executionHeader}>
          <NavTabs activeKey={resultKey} items={tabItems} onChange={handleKeyChange} />
          <div>
            <Button
              type="text"
              size="small"
              icon={<MinusOutlined />}
              onClick={() => setResultVisible(false)}
            />
            <Button
              type="text"
              size="small"
              icon={<BorderOutlined />}
              onClick={() => setResultVisible(true)}
            />
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setResultVisible(false)}
            />
          </div>
        </div>
        <div className={cls(styles.executionContent, 'custom-scrollbar')}>
          {
            resultVisible && (
              <ExecutionResult itemType={resultKey} executeData={executeResult} />
            )
          }
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/*@ts-ignore*/}
      <SplitPane
        split="vertical"
        className="SplitPane"
      >
        <Pane
          minSize="320px"
          maxSize="480px"
          initialSize="320px"
          className={styles.paramConfig}
        >
          <ParamConfig ref={paramConfigRef} />
        </Pane>
        <Pane className={cls(styles.rightContent, {
          [styles.showResult]: resultVisible
        })}>
          <div className={styles.mainContent}>
            <div className={styles.mainConfig}>
              <div className={styles.codeEditor}>
                <CodeEditor onAppExecute={handleAppExecute} />
              </div>
              <div className={styles.nodePreview}>
                <NodeConfigPreview />
              </div>
            </div>
            { renderExecutionResult() }
          </div>
        </Pane>
      </SplitPane>
    </div>
  )
}

export default CodeConfig;
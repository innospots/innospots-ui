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

import React, { useMemo, useState } from 'react';
import { useModel } from 'umi'
import cls from 'classnames'
import { Button } from 'antd'
import { useUpdateEffect } from 'ahooks'
import {BorderOutlined, MinusOutlined} from '@ant-design/icons';

import { getItemByType } from '@/pages/Workflow/Builder/components/NodeDataConfig/ExecutionItems';

import CustTabs from '../CustTabs'

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

const ExecutionResult:React.FC = () => {
  const { executeResult, resultVisible, setResultVisible, flowNodeDebugState } = useModel('FlowNode', (model) => ({
    executeResult: model.executeResult,
    resultVisible: model.resultVisible,
    setResultVisible: model.setResultVisible,
    flowNodeDebugState: model.flowNodeDebugState,
  }));
  const [resultKey, setResultKey] = useState('log');

  const RenderElement = useMemo(() => getItemByType(resultKey || 'log'), [ resultKey ])

  useUpdateEffect(() => {
    setResultVisible(true)
  }, [resultKey])

  const renderExecutionResult = () => {
    return (
      <>
      <div className={cls(styles.executionItems, {[styles.showResult]: resultVisible})}>
        <div className={styles.executionHeader}>
          <CustTabs activeKey={resultKey} items={tabItems} onChange={setResultKey} />
          <div>
            {
              resultVisible ? (
                <Button
                  type="text"
                  size="small"
                  icon={<MinusOutlined />}
                  onClick={() => setResultVisible(false)}
                />
              ) : (
                <Button
                  type="text"
                  size="small"
                  icon={<BorderOutlined />}
                  onClick={() => setResultVisible(true)}
                />
              )
            }
            {/* <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setResultVisible(false)}
            /> */}
          </div>
        </div>
        <div className={cls(styles.executionContent, 'custom-scrollbar')}>
          <div className={styles.container}>
            <RenderElement executeData={executeResult} />
          </div>
        </div>
      </div>
      </>
    )
  }

  return renderExecutionResult()
}

export default ExecutionResult;
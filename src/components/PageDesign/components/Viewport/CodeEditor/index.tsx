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
import { useModel } from 'umi';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Select } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

const AceCodeEditor = React.lazy(() => import('@/components/AceCodeEditor'))

import styles from './style.less';

const SCRIPT_TYPE_OPTIONS = [
  {
    value: 'java',
    label: 'Java',
  },
  {
    value: 'groovy',
    label: 'Groovy',
  },
  {
    value: 'python',
    label: 'Python',
  },
  {
    value: 'javascript',
    label: 'JavaScript',
  },
];

const CodeEditor = () => {
  const { nodeInfo, flowNodeDebugState, nodeDebugExecute, debugExecuteRequest } = useModel('FlowNode', (model) => ({
    nodeInfo: model.nodeInfo,
    nodeDebugExecute: model.nodeDebugExecute,
    flowNodeDebugState: model.flowNodeDebugState,
    debugExecuteRequest: model.debugExecuteRequest,
  }));

  const editorRef = useRef(null);
  const [codeMode, setCodeMode] = useState(SCRIPT_TYPE_OPTIONS[0].value)

  useEffect(() => {
    if (!nodeInfo.scripts?.scriptType) {
      nodeInfo.scripts = {
        scriptType: SCRIPT_TYPE_OPTIONS[0].value,
      };
    } else {
      setCodeMode(nodeInfo.scripts?.scriptType)
    }
  }, [nodeInfo.scripts?.scriptType]);

  const handleScriptTypeChange = (scriptType: string) => {
    nodeInfo.scripts = {
      ...nodeInfo.scripts,
      scriptType,
    };
    setCodeMode(scriptType)
  };

  const handleCodeChange = (newValue: string) => {
    nodeInfo.scripts = {
      ...nodeInfo.scripts,
      actionScript: newValue
    };
  }

  const handleAppExecute = async () => {
    if (flowNodeDebugState.formInstance) {
      try {
        const formValues = await flowNodeDebugState.formInstance.validateFields()
        _.merge(flowNodeDebugState.data, {
          ...formValues,
          scriptType: 'JAVA',
          actionScript: nodeInfo.scripts?.actionScript
        })
        nodeDebugExecute()
      } catch (e) {}
    }
  };

  const beautifyCode = () => {
    try {
      editorRef.current?.beautifyCode()
    } catch (error) {}
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Space>
          <Button
            type="text"
            size="small"
            icon={<PlayCircleOutlined />}
            loading={debugExecuteRequest.loading}
            onClick={handleAppExecute}
          >
            运行
          </Button>
          <Button type="text" size="small" icon={<PauseCircleOutlined />}>
            停止
          </Button>
          <Button
            type="text"
            size="small"
            icon={<img src={require('./m.svg')} style={{ width: 14, marginRight: 8 }} />}
            onClick={beautifyCode}
          >
            美化
          </Button>
        </Space>
        <Select
          size="small"
          style={{width: 120}}
          options={SCRIPT_TYPE_OPTIONS}
          defaultValue={nodeInfo.scripts?.scriptType || 'java'}
          onChange={handleScriptTypeChange}
        />
      </div>
      <div className={styles.codeEditor}>
        {/* <textarea ref={editorContainer} style={{ display: 'none' }} placeholder="请输入" /> */}
        <AceCodeEditor
          ref={editorRef}
          mode={codeMode}
          name="codeEditor"
          theme="tomorrow_night"
          placeholder="请输入"
          defaultValue={nodeInfo.scripts?.actionScript}
          onChange={handleCodeChange}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

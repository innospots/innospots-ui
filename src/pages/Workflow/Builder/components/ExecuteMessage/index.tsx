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
import cls from 'classnames';
import { useModel } from 'umi';
import { Resizable } from 're-resizable';
import { Row, Col, Tabs, Spin, Empty } from 'antd';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { MinusOutlined, BorderOutlined, CloseOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';

import { fetchEventSourceRequest } from '@/common/request';

import Logs from './Logs';
import Result from './Result';
import Message from './Message';

import styles from './index.less';

export type ExecuteType = 'note' | 'flow' | 'node';

interface ExecuteMessageProps {
  node?: any;
  defaultCollapsed: boolean;
  execType: ExecuteType;
  nodeExecutionId?: string;
  templateCode?: string;
  workflowInstanceId?: string | number;
  execTimer?: number;
  nodeCode?: string;
  nodeKey?: string;
  onResize: (height: number) => void;
  onClose: () => void;
  onCollapsed: (collapsed: boolean) => void;
  onNodeExecute: (node: any, executing: boolean) => void;
}

const maxHeight = 700;
const defaultHeight = 300;
const collapsedHeight = 43;

const ExecuteMessage: React.FC<ExecuteMessageProps> = ({
  node,
  nodeKey,
  nodeCode,
  execType,
  execTimer,
  templateCode,
  nodeExecutionId,
  workflowInstanceId,
  defaultCollapsed,
  onClose,
  onCollapsed,
  onResize,
  onNodeExecute
}) => {
  const { t } = useI18n(['workflow', 'common']);

  const [collapsed, setCollapsed] = useState(!!defaultCollapsed);

  const resizableRef = useRef<any>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const [tabKey, setTabKey] = useState('');
  const [wrapperHeight, setWrapperHeight] = useState(defaultHeight);

  const currentHeight = useRef(defaultHeight);

  const contentHeight = useMemo(() => {
    return collapsed ? 0 : wrapperHeight - collapsedHeight;
  }, [collapsed, wrapperHeight]);

  const {
    nodeExecutions,
    nodeExecutionRequest,
    workflowExecStreamData,
    updateFlowStreamData,
    executeFlowLoading,
    setExecuteFlowLoading,
  } = useModel('Builder', (model) => ({
    nodeExecutions: model.nodeExecutions,
    nodeExecutionRequest: model.nodeExecutionRequest,
    workflowExecStreamData: model.workflowExecStreamData,
    updateFlowStreamData: model.updateFlowStreamData,
    executeFlowLoading: model.executeFlowLoading,
    setExecuteFlowLoading: model.setExecuteFlowLoading,
  }));

  useEffect(() => {
    if (resizableRef.current) {
      if (collapsed) {
        resizableRef.current.updateSize({
          height: collapsedHeight,
        });
      } else {
        resizableRef.current.updateSize({
          height: defaultHeight,
        });
      }
    }
  }, [collapsed, resizableRef.current]);

  useEffect(() => {
    if (execTimer === -1) {
      stopExecuteFlow();
      return
    }
    if (templateCode && workflowInstanceId) {
      if (execTimer) {
        if (execType === 'flow') {
          executeFlowEvent(templateCode, workflowInstanceId);
        } else if (execType === 'node' && nodeKey) {
          executeNodeEvent(templateCode, workflowInstanceId, nodeKey);
        }
      }
    }
  }, [templateCode, workflowInstanceId, execType, execTimer, nodeKey]);

  useEffect(() => {
    onResize && onResize(collapsed ? collapsedHeight : wrapperHeight);
  }, [wrapperHeight, collapsed]);

  const flowKey = useMemo(() => [templateCode, workflowInstanceId].join('_'), [templateCode, workflowInstanceId]);
  const flowNodeKey = useMemo(() => [flowKey, nodeKey].join('_'), [flowKey, nodeKey]);

  const executionData = useMemo(() => {
    if (['flow', 'node'].includes(execType) || nodeCode === 'START') {
      const data = workflowExecStreamData[execType === 'node' ? flowNodeKey : flowKey];
      if (nodeCode === 'START') {
        return data || null;
      } else {
        return data || {};
      }
    } else if (execType === 'note') {
      if (nodeExecutionId) {
        return nodeExecutions[nodeExecutionId] || {};
      }
    }
    return {};
  }, [nodeExecutionId, nodeExecutions, execType, nodeCode, flowNodeKey, flowKey, templateCode, workflowInstanceId, workflowExecStreamData]);

  const logData = useMemo(() => executionData?.logs || {}, [executionData?.logs]);
  const messageData = useMemo(() => executionData?.messages || [], [executionData?.messages]);
  const resultData = useMemo(() => {
    if (execType === 'note') {
      return executionData?.outputs?.[0]?.results?.list || [];
    } else {
      return executionData?.response || {};
    }
  }, [executionData?.response, executionData?.outputs, execType]);

  const loading = useMemo(() => {
    if (execType === 'note') {
      return nodeExecutionRequest.loading;
    } else {
      let data: any;
      if (tabKey === 'log') {
        data = logData;
      } else if (tabKey === 'output') {
        data = messageData;
      } else if (tabKey === 'result') {
        data = resultData;
      }
      return (_.isEmpty(data) && executeFlowLoading);
    }
  }, [execType, tabKey, logData, resultData, messageData, executeFlowLoading, nodeExecutionRequest.loading]);

  const tabList = useMemo(() => {
    const list = [
      {
        id: 'log',
      },
      {
        id: 'result',
      },
    ];

    if (execType !== 'note' || nodeCode === 'START') {
      list.unshift({
        id: 'output',
      });
    }

    return list;
  }, [execType, nodeCode]);

  useEffect(() => {
    setTabKey(tabList[0]?.id || '');
  }, [tabList]);

  const stopExecuteFlow = () => {
    setExecuteFlowLoading(false);
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
      fetchAbortRef.current = null
    }
  };

  const executeFlowEvent = (code: string, instanceId: string | number) => {
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }

    fetchAbortRef.current = new AbortController();

    setExecuteFlowLoading(true);
    fetchEventSourceRequest(`${code}/workflow/execute/stream/workflow-instance/${instanceId}`, {
      method: 'POST',
      signal: fetchAbortRef.current.signal,
      onmessage(evt: any) {
        try {
          updateFlowStreamData(flowKey, evt);
        } catch (error) {
          console.error(error);
          setExecuteFlowLoading(false);
        }
      },
      onerror(err: any) {
        console.error(err);
        setExecuteFlowLoading(false);
      },
      onclose() {
        setExecuteFlowLoading(false);
      },
    });
  };

  const executeNodeEvent = async (code: string, instanceId: string | number, nodeKey: string) => {
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }

    fetchAbortRef.current = new AbortController();

    onNodeExecute && onNodeExecute(node, true);

    setExecuteFlowLoading(true);
    fetchEventSourceRequest(`${code}/workflow/execute/stream/workflow-instance/${instanceId}/node-instance/${nodeKey}/data`, {
      method: 'POST',
      signal: fetchAbortRef.current.signal,
      onmessage(evt: any) {
        try {
          updateFlowStreamData(flowNodeKey, evt);
        } catch (error) {
          console.error(error);
          setExecuteFlowLoading(false);
        }
      },
      onerror(err: any) {
        console.error(err);
        setExecuteFlowLoading(false);
      },
      onclose() {
        setExecuteFlowLoading(false);
        onNodeExecute && onNodeExecute(node, false);
      },
    });
  };

  const toggleCollapsed = () => {
    const c = !collapsed;
    setCollapsed(c);

    const height = c ? collapsedHeight : defaultHeight;
    setWrapperHeight(height);
    currentHeight.current = height;

    onCollapsed && onCollapsed(c);
  };

  const renderOutputContent = () => {
    if (!loading && _.isEmpty(messageData)) {
      return <Empty />;
    }
    return <Message dataSource={messageData} />;
  };

  const renderLogContent = () => {
    if (!loading && _.isEmpty(logData)) {
      return <Empty />;
    }
    return <Logs type={execType} dataSource={logData} />;
  };

  const renderResultContent = () => {
    if (!loading && _.isEmpty(resultData)) {
      return <Empty />;
    }
    return <Result dataSource={resultData} />;
  };

  const renderTabContent = (type: string) => {
    switch (type) {
      case 'output':
        return renderOutputContent();
      case 'log':
        return renderLogContent();
      case 'result':
        return renderResultContent();
    }
  };

  const handleClose = () => {
    stopExecuteFlow();
    onClose && onClose();
  };

  const getTabNode = (
    <Tabs
      activeKey={tabKey}
      items={_.map(tabList, (item) => ({
        key: item.id,
        label: <span className={styles.tabBar}>{t(`workflow.builder.execution.${item.id}`)}</span>,
        children: (
          <div className={styles.content} style={{ height: contentHeight }}>
            {renderTabContent(item.id)}
          </div>
        ),
      }))}
      tabBarExtraContent={
        <Row>
          <Col>
            <span className={styles.exeBtn} onClick={toggleCollapsed}>
              {collapsed ? <BorderOutlined /> : <MinusOutlined />}
            </span>
          </Col>
          <Col>
            <span className={styles.exeBtn} onClick={handleClose}>
              <CloseOutlined />
            </span>
          </Col>
        </Row>
      }
      onChange={(key) => {
        setTabKey(key);
        if (collapsed) {
          toggleCollapsed();
        }
      }}
    />
  );

  const handleResize = (event: any, direction: any, ref: any, delta: any) => {
    // setWrapperHeight(currentHeight.current + delta.height);
  };

  const handleResizeStop = (event: any, direction: any, ref: any, delta: any) => {
    let height = currentHeight.current + delta.height;

    if (height <= collapsedHeight + 80) {
      height = collapsedHeight;
      setCollapsed(true);
    }

    setWrapperHeight(height);

    currentHeight.current = height;
  };

  if (!executionData && !executeFlowLoading) {
    return null;
  }

  return (
    <Resizable
      defaultSize={{
        height: collapsedHeight,
      }}
      ref={resizableRef}
      maxHeight={maxHeight}
      minHeight={collapsedHeight}
      style={{
        position: 'fixed',
      }}
      enable={{
        top: !collapsed,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
      }}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      className={cls(styles.wrapper, { [styles.collapsed]: collapsed }, 'execute-preview')}
    >
      <Spin spinning={loading} />
      {getTabNode}
    </Resizable>
  );
};

export default ExecuteMessage;

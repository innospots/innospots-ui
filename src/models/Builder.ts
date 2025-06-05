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

import {useState} from 'react';
import _ from 'lodash';
import {useRequest, useReactive} from 'ahooks';

import * as Service from '@/services/Builder';

import LS from '@/common/utils/LocalStorage';

const getStreamData = (streamData: any) => {
  const result: any = {};

  if (streamData.id && streamData.data) {
    const data = JSON.parse(streamData.data);
    switch (streamData.event) {
      case 'log':
        result.log = {
          id: streamData.id,
          ...data,
        };
        break

      case 'message':
        result.message = data;
        break

      case 'response':
        result.response = data;
        break
    }
  }
  return result;
};

const getExecuteMessageData = (streamData: any, currentData: any) => {
  const { log, message, response } = getStreamData(streamData);
  if (log) {
    if (!currentData.logs) {
      currentData.logs = [];
    }
    currentData.logs = [
      ...currentData.logs,
      {
        ...log,
      }
    ];
  }

  if (response) {
    currentData.response = response;
  }

  if (message) {
    if (!currentData.messages) {
      currentData.messages = [];
    }
    if (message.viewType === 'slice') {
      const index = _.findIndex(currentData.messages, (item: any) => item.viewId === message.viewId);
      if (index > -1) {
        const curItem = currentData.messages[index];
        curItem.data += message.data;
      } else {
        currentData.messages.push(message);
      }
    } else {
      currentData.messages.push(message);
    }
    currentData.messages = [
      ...currentData.messages,
    ]
  }

  return currentData;
};

export default () => {
  const flowData = useReactive({
    flowTemplate: null,
    httpApiList: [],
    webhookList: []
  });

  const [workflowType, setWorkflowType] = useState<string>('');
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeFlowLoading, setExecuteFlowLoading] = useState(false);
  const [nodeExecutions, setNodeExecutions] = useState({});
  const [executionPageData, setExecutionPageData] = useState({
    page: 1,
    size: LS.get('EXEC_PAGE_SIZE') || 20
  })

  const [workflowExecStreamData, setWorkflowExecStreamData] = useState({});

  const publishBuilderRequest = useRequest(Service.publishWorkFlowBuilder, {
    manual: true
  });

  const saveBuilderDraftRequest = useRequest(Service.saveWorkflowBuilderDraft, {
    manual: true
  });

  const executeBuilderRequest = useRequest(Service.executeWorkflowBuilder, {
    manual: true
  });

  const nodeExecutionRequest = useRequest(Service.nodeExecution, {
    manual: true,
    onSuccess: (result, [type, id]) => {
      if (result) {
        setNodeExecutions({
          ...nodeExecutions,
          [id]: result
        });
      }
    }
  });

  const updateTemplateStatus = useRequest(Service.updateTemplateStatus, {
    manual: true
  });

  const executeBuilderNodeRequest = useRequest(Service.executeBuilderNode, {
    manual: true
  });

  const executeWorkflowInstanceRequest = useRequest(Service.executeWorkflowInstance, {
    manual: true
  });

  const saveWebhook = useRequest(Service.saveWebhook, {
    manual: true,
    onSuccess: (resData, params) => {
      if (resData) {
        const [, type] = params;
        if (type === 'update') {
          const index = _.findIndex(
            flowData.webhookList,
            (item: any) => item.flowApiId === resData.flowApiId
          );
          if (index > -1) {
            // @ts-ignore
            flowData.webhookList[index] = resData;
          }
        } else {
          // @ts-ignore
          flowData.webhookList.push(resData);
        }
      }
    }
  });

  const getWebhookList = useRequest<any, any[]>(Service.fetchWebhooks, {
    manual: true,
    cacheKey: 'WebhookList',
    onSuccess: (result) => {
      flowData.webhookList = result;
    }
  });

  const getWebhookDetail = useRequest(Service.getWebhookDetail, {
    manual: true
  });

  const updateFlowStreamData = (key: string, streamData: any) => {
    const currentData = workflowExecStreamData[key] = workflowExecStreamData[key] || {};
    try {
      const data = getExecuteMessageData(streamData, currentData);
      setWorkflowExecStreamData({
        ...workflowExecStreamData,
        [key]: data
      });
    } finally {}
  };

  const fetchWorkflowBuilderRequest = useRequest(Service.fetchWorkflowBuilder, {
    manual: true,
  });

  return {
    flowData,
    nodeExecutions,
    setNodeExecutions,

    executeLoading,
    setExecuteLoading,

    executeFlowLoading,
    setExecuteFlowLoading,

    workflowType,
    setWorkflowType,

    saveWebhook,
    getWebhookList,
    getWebhookDetail,

    executionPageData,
    setExecutionPageData,

    workflowExecStreamData,
    updateFlowStreamData,

    updateTemplateStatus,
    nodeExecutionRequest,
    executeBuilderRequest,
    publishBuilderRequest,
    saveBuilderDraftRequest,
    executeBuilderNodeRequest,
    executeWorkflowInstanceRequest,
    fetchWorkflowBuilderRequest
  };
};

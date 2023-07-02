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

import { useState } from 'react';
import * as Service from '@/services/Builder';
import { useRequest, useReactive } from 'ahooks';
import _ from 'lodash';

export default () => {
    const flowData = useReactive({
        flowTemplate: null,
        httpApiList: [],
        webhookList: [],
    });

    const [executeLoading, setExecuteLoading] = useState(false);
    const [nodeExecutions, setNodeExecutions] = useState({});

    const publishBuilderRequest = useRequest(Service.publishWorkFlowBuilder, {
        manual: true,
    });

    const saveBuilderDraftRequest = useRequest(Service.saveWorkflowBuilderDraft, {
        manual: true,
    });

    const executeBuilderRequest = useRequest(Service.executeWorkflowBuilder, {
        manual: true,
    });

    const nodeExecutionRequest = useRequest(Service.nodeExecution, {
        manual: true,
        onSuccess: (result, [id]) => {
            nodeExecutions[id] = result;
            setNodeExecutions({
                ...nodeExecutions,
            });
        },
    });

    const updateTemplateStatus = useRequest(Service.updateTemplateStatus, {
        manual: true,
    });

    const executeBuilderNodeRequest = useRequest(Service.executeBuilderNode, {
        manual: true,
    });

    const executeWorkflowInstanceRequest = useRequest(Service.executeWorkflowInstance, {
        manual: true,
    });

    const saveWebhook = useRequest(Service.saveWebhook, {
        manual: true,
        onSuccess: (resData, params) => {
            if (resData) {
                const [, type] = params;
                if (type === 'update') {
                    const index = _.findIndex(
                        flowData.webhookList,
                        (item: any) => item.flowApiId === resData.flowApiId,
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
        },
    });

    const getWebhookList = useRequest<any, any[]>(Service.fetchWebhooks, {
        manual: true,
        cacheKey: 'WebhookList',
        onSuccess: (result) => {
            flowData.webhookList = result;
        },
    });

    const getWebhookDetail = useRequest(Service.getWebhookDetail, {
        manual: true,
    });

    return {
        flowData,
        nodeExecutions,

        executeLoading,
        setExecuteLoading,

        saveWebhook,
        getWebhookList,
        getWebhookDetail,

        updateTemplateStatus,
        nodeExecutionRequest,
        executeBuilderRequest,
        publishBuilderRequest,
        saveBuilderDraftRequest,
        executeBuilderNodeRequest,
        executeWorkflowInstanceRequest,
    };
};

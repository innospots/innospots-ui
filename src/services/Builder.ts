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

import {fetch, dataRequest} from '@/common/request';

export async function getHttpApiList({projectId}) {
  return dataRequest(`project/${projectId}/http/api/list`);
}

export async function fetchTemplate() {
  return fetch<any>(`apps/category/def-list`);
}

export async function updateTemplateStatus(payload) {
  return dataRequest(`flow/template/${payload.flowTplId}/${payload.status}`, {
    method: 'PUT',
    params: payload.params
  });
}

/**
 * 获取webhook列表
 * @returns {Promise<any>}
 */
export async function fetchWebhooks() {
  return fetch('flow/api');
}

/**
 * 保存webhook
 * @returns {Promise<any>}
 */
export async function saveWebhook(data: any, type: string = 'create') {
  return fetch('flow/api', {
    data,
    method: type === 'create' ? 'POST' : 'PUT'
  });
}

/**
 * 运行webhook
 * @param payload
 * @returns {Promise<any>}
 */
export async function postFlowApiPreview({projectId, workflowInstanceId, data}) {
  return dataRequest(`project/${projectId}/flow/api/preview/${workflowInstanceId}`, {
    method: 'POST',
    data: data
  });
}

export async function getWebhookDetail(flowApiId) {
  return dataRequest(`flow/api/${flowApiId}`);
}

export async function fetchInputFields<T>({nodeKey, workflowInstanceId}): Promise<any> {
  return fetch(`workflow/builder/${workflowInstanceId}/node-key/${nodeKey}/input-fields`);
  // return fetch(`workflow/builder/${workflowInstanceId}/node-key/${nodeKey}/output-field`);
}

export async function saveWorkflowBuilderCache(payload) {
  return fetch(`workflow/builder/cache`, {
    method: 'POST',
    data: payload.data
  });
}

export async function publishWorkFlowBuilder({workflowInstanceId}) {
  return fetch(`workflow/builder/publish/${workflowInstanceId}`, {
    method: 'POST'
  });
}

export async function saveWorkflowBuilderDraft<T>(payload): Promise<any> {
  return fetch(`workflow/builder/draft`, {
    method: 'PUT',
    data: payload.data
  });
}

export async function executeBuilderNode({workflowInstanceId, nodeKey, data}) {
  return fetch(
    `workflow/execute/workflow-instance/${workflowInstanceId}/node-instance/${nodeKey}/data`,
    {
      method: 'POST',
      data
    }
  );
}

export async function executeWorkflowInstance({workflowInstanceId, data}) {
  return fetch(`workflow/execute/workflow-instance/${workflowInstanceId}`, {
    method: 'POST',
    data: data || {}
  });
}

export async function executeWorkflowBuilder<T>({workflowInstanceId, params}): Promise<any> {
  return fetch(`workflow/flow-execution/latest/workflow-instance/${workflowInstanceId}`, {
    data: params?.nodeKeys?.split(',')
  });
}

export async function nodeExecution(nodeExecutionId: string) {
  return fetch(`workflow/node-execution/find/node-execution/${nodeExecutionId}`);
}

export async function saveFlowDraft(payload) {
  return dataRequest(`flow/instance/draft`, {
    data: payload.data,
    method: payload.method || 'POST'
  });
}

export async function fetchWorkflowBuilder<T>(payload: any): Promise<any> {
  return fetch(
    `workflow/builder/${payload.workflowInstanceId}/revision/${payload.revision || 0}`
  );
}

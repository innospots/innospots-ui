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

import {fetch, cancelAllRequest} from '@/common/request';
import type {HandleType, KeyValues} from '@/common/types/Types';
import {DEFAULT_LIST_QUERY} from '@/common/constants';

export async function fetchCategories(params?: any) {
  return fetch(`${params?.workflowType}/workflow/category`, {
    params
  });
}

export async function fetchWorkflows(workflowType: string, params?: any) {
  return fetch(`${workflowType}/workflow/instance/page`, {
    ...DEFAULT_LIST_QUERY,
    params
  });
}

export async function fetchWorkflowRecord(resourceId: number, params?: any) {
  return fetch(`operate-log/page?module=workflow&resourceId=${resourceId}`, {
    ...DEFAULT_LIST_QUERY,
    params
  });
}

export async function fetchWorkflow(workflowType: string, workflowId: number | string) {
  return fetch(`${workflowType}/workflow/instance/${workflowId}`);
}

export async function fetchWorkflowInstance(workflowType: string, registryId: number | string) {
  return fetch(`${workflowType}/workflow/instance/registry/${registryId}`);
}

export async function saveWorkflow(workflowType: string, type?: HandleType, data?: any) {
  return fetch(`${workflowType}/workflow/instance`, {
    method: type === 'edit' ? 'PUT' : 'POST',
    data
  });
}

export async function stopWorkflow(workflowType: string, flowKey: string) {
  cancelAllRequest()

  return fetch(`${workflowType}/workflow/execute/stop/workflow/${flowKey}`, {
    method: 'POST'
  });
}

export async function updateStatus(workflowType: string, workflowId: number, status: string) {
  return fetch(`${workflowType}/workflow/instance/${workflowId}/${status}`, {
    method: 'PUT'
  });
}

export async function deleteWorkflow(workflowType: string, workflowInstanceId: number, isReally?: boolean) {
  let method = 'PUT';
  let url = `${workflowType}/workflow/instance/${workflowInstanceId}/recycle`;

  if (isReally) {
    method = 'DELETE';
    url = `${workflowType}/workflow/instance/${workflowInstanceId}`;
  }

  return fetch(url, {
    method
  });
}

export async function deleteCategory(workflowType: string, categoryId: number) {
  return fetch(`${workflowType}/workflow/category/${categoryId}`, {
    method: 'DELETE'
  });
}

export async function fetchJobFlows(params?: any) {
  return fetch(`job/workflow/instance/page`, {
    params
  });
}

export async function saveCategory(
  type: HandleType,
  {
    categoryId,
    categoryName,
    workflowType
  }: {
    categoryId?: number;
    workflowType?: string;
    categoryName: string;
  }
) {
  if (type === 'add') {
    return fetch(`${workflowType}/workflow/category`, {
      params: {
        categoryName
      },
      method: 'post'
    });
  } else {
    return fetch(`${workflowType}/workflow/category/${categoryId}?categoryName=${categoryName}`, {
      method: 'put'
    });
  }
}

export async function fetchNodeList<T>(params?: any): Promise<T> {
  return fetch('apps/app-node-definition/list/online', {
    params
  });
};

export const updateNodeData = async (data: any) => {
  return fetch('apps/app-node-definition', {
    data,
    method: 'put'
  });
};

export const createNodeData = async (data: any) => {
  return fetch('apps/app-node-definition', {
    data,
    method: 'post'
  });
};

export const deleteNode = async (nodeId: number) => {
  return fetch(`apps/app-node-definition/${nodeId}`, {
    method: 'delete'
  });
};

export const fetchNode = async (nodeId: number) => {
  return fetch(`apps/app-node-definition/${nodeId}`);
};

export const fetchWebhookAddress = async (workflowType: string) => {
  return fetch(`${workflowType}/workflow/definition/webhook-address`);
};

export const fetchWorkflowTemplates = async (params?) => {
  // return fetch(`apps/workflow-template/list/online`);
  return fetch(`flow-node/definition/list/online`, { params });
};

export const fetchTemplatePage = async (params?: any): Promise<any> => {
  return fetch(`apps/workflow-template/page`, {
    params
  });
};

export const fetchTemplateDetail = async (flowTplId: number, params?: any): Promise<any> => {
  return fetch(`apps/workflow-template/${flowTplId}`, {
    params
  });
};

export const fetchWebhookRegistries = async (workflowType, params?: any): Promise<any> => {
  return fetch(`${workflowType}/workflow/trigger/webhook/registries`, {
    params
  });
};

export const changeTemplateStatus = async (flowTplId: number, status: string) => {
  return fetch(`apps/workflow-template/${flowTplId}/${status}`, {
    method: 'put'
  });
};

export const saveTemplateData = async (type: string, data: KeyValues) => {
  return fetch(`apps/workflow-template`, {
    data,
    method: type === 'add' ? 'post' : 'put'
  });
};

export const deleteTemplate = async (flowTplId: number) => {
  return fetch(`apps/workflow-template/${flowTplId}`, {
    method: 'delete'
  });
};

export const saveGroupNodes = async (flowTplId: number, nodeGroupId: number, params: KeyValues) => {
  return fetch(`apps/workflow-template/${flowTplId}/node-group/${nodeGroupId}/node-ids`, {
    params,
    method: 'post'
  });
};

export const saveTemplateGroup = async (type: string, flowTplId: number, params: KeyValues, nodeGroupId?: number) => {
  let path = `apps/workflow-template/${flowTplId}/node-group`;

  if (type === 'edit' && nodeGroupId) {
    path += `/${nodeGroupId}`
  }

  return fetch(path, {
    params,
    method: type === 'add' ? 'post' : 'put'
  });
};

export const fetchWorkflowRevisions = async (templateCode: string, workflowInstanceId: string) => {
  return fetch(`${templateCode}/workflow/builder/${workflowInstanceId}/revisions`);
};

export const saveToDraft = async (templateCode: string, workflowInstanceId: string, revision: number) => {
  return fetch(`${templateCode}/workflow/builder/${workflowInstanceId}/draft/${revision}`, {
    method: 'PUT'
  });
};

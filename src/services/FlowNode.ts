import { fetch } from '@/common/request';
import { ArrayType } from '@/common/types/Types';

export const changeNodeStatus = async (nodeId: number, status: string) => {
  return fetch(`flow-node/definition/${nodeId}/status/${status}`, {
    method: 'put',
  });
};

export function fetchPrimitives(): Promise<ArrayType> {
  return fetch(`flow-node/definition/primitives`);
}

export const fetchWorkflowTemplates = async (params?) => {
  // return fetch(`apps/workflow-template/list/online`);
  return fetch(`flow-node/definition/list/online`, { params });
};

export const fetchNodeTemplates = async () => {
  return fetch(`flow-node/template/list`);
};

export const fetchNodeGroups = async (templateCode: string, params: any = {
  includeAll: true
}) => {
  return fetch(`flow-node/group/list/${templateCode}`, { params });
};

export async function createNodeGroup(params: Record<string, any>) {
  return fetch(`flow-node/group`, {
    params,
    method: 'post',
  });
}

export async function editNodeGroup(params: Record<string, any>) {
  return fetch(`flow-node/group/re-name`, {
    params,
    method: 'put',
  });
}

export const deleteNodeGroup = async (nodeGroupId: number) => {
  return fetch(`flow-node/group/${nodeGroupId}`, {
    method: 'delete',
  });
};

export const fetchNodes = async (params?: any) => {
  return fetch('flow-node/definition/page', {
    params,
  });
};

export const createNode = async (data: any) => {
  return fetch('flow-node/definition/info', {
    data,
    method: 'post',
  });
};

export const updateNodeInfo = async (data: any) => {
  return fetch('flow-node/definition/info', {
    data,
    method: 'put',
  });
};

export const updateNodeConfig = async (data: any) => {
  return fetch('flow-node/definition', {
    data,
    method: 'put',
  });
};

export const deleteNode = async (nodeId: number) => {
  return fetch(`flow-node/definition/${nodeId}`, {
    method: 'delete',
  });
};

export const fetchNodeInfo = async (nodeId: number) => {
  return fetch(`flow-node/definition/${nodeId}`);
};

export const debugExecute = async (data: any) => {
  return fetch(`flow-node/debug/execute`, {
    data,
    method: 'post',
  });
};

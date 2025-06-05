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
import { useModel } from 'umi'
import { useState, useMemo } from 'react';
import { useRequest, useReactive } from 'ahooks';

import * as Service from '@/services/FlowNode';
import type { KeyValues } from '@/common/types/Types';

import { randomString } from '@/common/utils';

const defaultNodeSettings = {
  formWidth: 420,
  formMinWidth: 390,
  formMaxWidth: 700,
  isFixedWidth: false
}

export default () => {
  const {
    initAppResources,
  } = useModel('AppEditor', model => ({
    initAppResources: model.initAppResources
  }))
  const [nodeInfo, setNodeInfo] = useState<any>()
  const [primitives, setPrimitives] = useState<{
    value: string,
    label: string
  }[]>([]);
  const [nodeGroups, setNodeGroups] = useState<KeyValues>([]);
  const [nodePageData, setNodePageData] = useState<KeyValues>([]);
  const [nodeTemplates, setNodeTemplates] = useState<KeyValues[]>();
  const [resultVisible, setResultVisible] = useState(false);
  const [executeResult, setExecuteResult] = useState({});

  const flowNodeConfigState = useReactive<any>({
    data: {},
    formInstance: null
  })

  const flowNodeDebugState = useReactive<any>({
    data: {},
    result: {},
    inputs: [{
      data: '',
      resources: []
    }]
  })

  const fetchPrimitivesRequest = useRequest(Service.fetchPrimitives, {
    manual: true,
    onSuccess: (result) => {
      setPrimitives(result || []);
    },
  });

  const fetchNodeTemplatesRequest = useRequest(Service.fetchNodeTemplates, {
    manual: true,
    onSuccess: (result) => {
      setNodeTemplates(result || []);
    },
  });

  const fetchNodeGroupsRequest = useRequest(Service.fetchNodeGroups, {
    manual: true,
    onSuccess: (result) => {
      setNodeGroups(result || []);
    },
  });

  const updateNodeStatusRequest = useRequest(Service.changeNodeStatus, {
    manual: true,
    onSuccess: (result, [nodeId, status]) => {
      if (result) {
        const node = _.find(nodePageData.list, (item) => item.nodeId === nodeId);
        if (node) {
          node.status = status
          setNodePageData({
            ...nodePageData
          })
        }
      }
    },
  });

  const fetchNodesRequest = useRequest(Service.fetchNodes, {
    manual: true,
    onSuccess: (result) => {
      if (result) {
        setNodePageData(result);
      }
    },
  });

  const deleteNodeGroupRequest = useRequest(Service.deleteNodeGroup, {
    manual: true,
  });

  const createNodeGroupRequest = useRequest(Service.createNodeGroup, {
    manual: true,
  });

  const updateNodeGroupRequest = useRequest(Service.editNodeGroup, {
    manual: true,
  });

  const createNodeRequest = useRequest(Service.createNode, {
    manual: true,
  });

  const updateNodeInfoRequest = useRequest(Service.updateNodeInfo, {
    manual: true,
  });

  const updateNodeConfigRequest = useRequest(Service.updateNodeConfig, {
    manual: true,
  });

  const deleteNodeRequest = useRequest(Service.deleteNode, {
    manual: true,
  });

  const debugExecuteRequest = useRequest(Service.debugExecute, {
    manual: true,
  });

  const fetchNodeInfoRequest = useRequest(Service.fetchNodeInfo, {
    manual: true,
    onSuccess: (result: any) => {
      _.merge(result, {
        settings: defaultNodeSettings
      })
      setNodeInfo(result);
      if (result) {
        initAppResources(result.resources as any)
      }
    },
  });

  const saveNodeLoading = useMemo(() => (createNodeRequest.loading || updateNodeInfoRequest.loading), [ createNodeRequest.loading, updateNodeInfoRequest.loading ])

  const nodeDebugExecute = async () => {
    const postData = {
      ni: {},
      inputs: flowNodeDebugState.inputs
    }
    _.merge(postData.ni, nodeInfo, {
      data: flowNodeDebugState.data
    })
    const result = await debugExecuteRequest.runAsync(postData)

    setResultVisible(true)
    setExecuteResult(result || {})
    flowNodeDebugState.result = result || {}
  }

  const saveNodeInfo = async (data: any, type: string = 'add') => {
    let result
    if (type === 'add') {
      result = await createNodeRequest.runAsync(data)
    } else {
      result = await updateNodeInfoRequest.runAsync(data)
    }

    return Promise.resolve(result)
  }

  const updateNodeInfoData = (data: any) => {
    _.assign(nodeInfo, data)
    setNodeInfo({
      ...nodeInfo
    })
  }

  const getNodePorts = (type: string): any[] => {
    const ports = nodeInfo?.resources?.[type] || []
    return _.map(ports, port => ({
      id: port?.id || randomString(4),
      ...port
    }))
  }

  const updateNodePorts = (type: string, ports) => {
    if (nodeInfo?.resources) {
      const resources = {
        ...nodeInfo.resources
      }
      resources[type] = [].concat(ports)
      updateNodeInfoData({
        resources
      })
    }
  }

  return {
    nodeInfo,
    nodePageData,
    deleteNodeRequest,
    createNodeRequest,
    fetchNodesRequest,
    fetchNodeInfoRequest,
    updateNodeConfigRequest,

    setNodeInfo,
    saveNodeInfo,
    saveNodeLoading,

    getNodePorts,
    updateNodePorts,
    updateNodeInfoData,

    executeResult,
    resultVisible,
    setResultVisible,

    nodeDebugExecute,
    flowNodeDebugState,
    flowNodeConfigState,
    debugExecuteRequest,

    primitives,
    fetchPrimitivesRequest,

    nodeGroups,
    nodeTemplates,
    fetchNodeGroupsRequest,
    fetchNodeTemplatesRequest,
    updateNodeStatusRequest,

    updateNodeGroupRequest,
    createNodeGroupRequest,
    deleteNodeGroupRequest,
  };
};

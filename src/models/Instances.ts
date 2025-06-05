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
import {useRequest} from 'ahooks';

import * as Service from '@/services/Instances';

import {ITableData} from '@/common/types/Types';

export default () => {
  const [instanceData, setInstanceData] = useState<ITableData>({});
  const [instanceDetail, setInstanceDetail] = useState<any>({});
  const [flowDetail, setFlowDetail] = useState<any>({});

  /**
   * 任务实例列表数据
   */
  const taskInstanceRequest = useRequest<any, any[]>(Service.fetchTaskInstances, {
    manual: true,
    cacheKey: 'InstanceData',
    onSuccess: (result: ITableData) => {
      setInstanceData(result);
    },
  });

  /**
   * 任务实例详情数据
   */
  const instanceDetailRequest = useRequest<any, any[]>(Service.fetchInstanceDetail, {
    manual: true,
    cacheKey: 'InstanceDetail',
    onSuccess: (result: any) => {
      setInstanceDetail(result);
    },
  });

  /**
   * 任务实例流程图数据
   */
  const flowDetailRequest = useRequest<any, any[]>(Service.fetchFlowDetail, {
    manual: true,
    cacheKey: 'FlowDetail',
    onSuccess: (result: any) => {
      setFlowDetail(result);
    },
  });

  /**
   * 修改实例状态
   */
  const updateInstanceStatusRequest = useRequest(Service.updateInstanceStatus, {
    manual: true
  });

  return {
    instanceData,
    flowDetail,
    instanceDetail,

    instanceDetailRequest,
    flowDetailRequest,
    taskInstanceRequest,
    updateInstanceStatusRequest,
  };
};

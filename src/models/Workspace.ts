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
import { useRequest } from 'ahooks';

import * as Service from '@/services/Workspace';
import { getListData, extractResult } from '@/common/utils';

export default () => {
  const [appInfoList, setAppInfoList] = useState([]);
  const [machineInfoData, setMachineInfoData] = useState({});
  const [messageInfoList, setMessageInfoList] = useState([]);
  const [workspaceInfoNumber, setWorkspaceInfoNumber] = useState(0);

  /**
   * 获取工作台欢迎卡片信息
   */
  const getWorkspaceInfoNumber = useRequest(Service.getWorkspaceInfoNumber, {
    manual: true,
    cacheKey: 'WorkspaceInfoNumber',
    onSuccess: (result) => {
      setWorkspaceInfoNumber(extractResult(result) || {});
    },
  });

  // 机器信息
  const getMachineInfoData = useRequest(Service.getMachineInfoData, {
    manual: true,
    cacheKey: 'MachineInfoData',
    onSuccess: (result) => {
      setMachineInfoData(extractResult(result));
    },
  });

  // 最新信息
  const messageInfoRequest = useRequest(Service.fetchMessageInfo, {
    manual: true,
    cacheKey: 'MessageInfoList',
    onSuccess: (result) => {
      setMessageInfoList(extractResult(result)?.list || []);
    },
  });

  // 应用更新
  const getAppInfoList = useRequest(Service.getAppInfoList, {
    manual: true,
    cacheKey: 'AppInfoList',
    onSuccess: (result) => {
      setAppInfoList(extractResult(result));
    },
  });

  return {
    appInfoList,
    machineInfoData,
    messageInfoList,
    workspaceInfoNumber,

    getAppInfoList,
    getMachineInfoData,
    messageInfoRequest,
    getWorkspaceInfoNumber,
  };
};

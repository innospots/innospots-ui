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

import * as Service from '@/services/Applications';

export default () => {
  const [baseInfoData, setBaseInfoData] = useState<{
    list?: any[];
    pageData?: any;
  }>({
    list: [],
    pageData: {},
  });

  // 应用列表
  const [appList, setAppList] = useState<any[]>([]);
  // 已安装应用列表
  const [installedAppList, setInstalledAppList] = useState<any[]>([]);

  const fetchAppListRequest = useRequest<any[], any>(Service.fetchAppList, {
    manual: true,
    cacheKey: 'appList',
    onSuccess: (result) => {
      setAppList(result);
    },
  });

  const getInstalledAppList = useRequest(Service.getInstalledAppListData, {
    manual: true,
    cacheKey: 'installedAppList',
    onSuccess: (result: any[]) => {
      setInstalledAppList(result);
    },
  });

  const getBaseInfoList = useRequest(Service.installedAppBaseInfos, {
    manual: true,
    cacheKey: 'InstalledAppBaseInfos',
    onSuccess: (list: any[]) => {
      setBaseInfoData({
        list,
      });
    },
  });

  const applicationModulesRequest = useRequest(Service.fetchApplicationModules, {
    manual: true,
  });

  const applicationMenuItemsRequest = useRequest(Service.fetchApplicationMenuItems, {
    manual: true,
  });

  const changeAppStatus = useRequest(Service.changeAppStatus, {
    manual: true,
  });

  return {
    appList,
    baseInfoData,
    installedAppList,

    getBaseInfoList,
    changeAppStatus,
    getInstalledAppList,
    fetchAppListRequest,

    applicationModulesRequest,
    applicationMenuItemsRequest,
  };
};

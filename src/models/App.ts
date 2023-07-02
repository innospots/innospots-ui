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
import _ from 'lodash';

import * as Service from '@/services/App';

import { AppInfo, Categories, ITableData } from '@/common/types/Types';
import { addPageListData, deletePageListData, extractResult, updatePageListData } from '@/common/utils';

type CategoryItem = {
  code: string
  name: string
  nodeGroupId: number
  nodes: AppInfo[]
}

type NodeCategories = CategoryItem[]

export default () => {
  const [pageData, setPageData] = useState<ITableData>({});
  const [categories, setCategories] = useState<Categories>([]);
  const [formSchema, setFormSchema] = useState<Record<string, any>>({
    displayType: 'column'
  });
  const [executeResult, setExecuteResult] = useState<Record<string, any>>({});
  const [currentAppInfo, setCurrentAppInfo] = useState<AppInfo>();

  const categoryRequest = useRequest(Service.fetchCategories, {
    manual: true,
    onSuccess: (result: NodeCategories) => {
      setCategories(_.map(result, item => ({
        nodes: item.nodes,
        categoryId: item.nodeGroupId,
        categoryName: item.name,
        totalCount: item.nodes?.length || 0
      })));
    },
  });

  const appsRequest = useRequest(Service.fetchApps, {
    manual: true,
    onSuccess: (result: ITableData) => {
      setPageData(result);
    },
  });

  const appExecuteRequest = useRequest<AppInfo, any>(Service.appExecute, {
    manual: true,
    onSuccess: (result: any) => {
      setExecuteResult(extractResult(result))
    },
  });

  const appInfoRequest = useRequest<AppInfo, any>(Service.fetchAppInfo, {
    manual: true
  });

  const updateAppInfoRequest = useRequest<AppInfo, any>(Service.updateAppInfo, {
    manual: true
  });

  const saveAppRequest = useRequest(Service.postAppInfo, {
    manual: true,
    // onSuccess: (result: ITableData, [data, type]) => {
    //   if (result) {
    //     let newPageData;
    //     if (type === 'put') {
    //       newPageData = updatePageListData(pageData, result, 'nodeId');
    //     } else {
    //       newPageData = addPageListData(pageData, result);
    //     }
    //
    //     setPageData(newPageData as ITableData);
    //   }
    // },
  });

  const deleteAppRequest = useRequest(Service.deleteAppInfo, {
    manual: true,
    onSuccess: (result: ITableData, [nodeId]) => {
      if (result) {
        const newPageData = deletePageListData(pageData, 'nodeId', nodeId);
        if (newPageData) {
          setPageData(newPageData as ITableData);
        }
      }
    },
  });

  const updateStatusRequest = useRequest(Service.updateAppStatus, {
    manual: true,
    onSuccess: (result: boolean, [nodeId, status]) => {
      if (result) {
        const page = _.find(pageData.list, (item) => item.nodeId === nodeId);
        if (page) {
          page.status = status;
        }
        setPageData({
          ...pageData,
        });
      }
    },
  });

  return {
    categories,
    categoryRequest,

    pageData,
    appsRequest,

    formSchema,
    setFormSchema,

    saveAppRequest,
    appInfoRequest,
    deleteAppRequest,
    updateStatusRequest,

    executeResult,
    setExecuteResult,
    appExecuteRequest,

    currentAppInfo,
    setCurrentAppInfo,
    updateAppInfoRequest
  }
}
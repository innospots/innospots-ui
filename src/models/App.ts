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
import { useModel } from 'umi';
import { useRequest } from 'ahooks';
import { useMemo, useState } from 'react';

import * as Service from '@/services/App';

import { AppInfo, Categories, ICategoryItem, ITableData } from '@/common/types/Types';
import { addPageListData, deletePageListData, extractResult, updatePageListData } from '@/common/utils';

type CategoryItem = {
  categoryName: string
  categoryId: number
}

type AppCategories = CategoryItem[]

export default () => {
  const {
    initAppResources,
  } = useModel('AppEditor', model => ({
    initAppResources: model.initAppResources
  }))
  const [appData, setAppData] = useState<ITableData>({});
  const [categories, setCategories] = useState<Categories>([]);
  const [formSchema, setFormSchema] = useState<Record<string, any>>({
    displayType: 'column'
  });
  const [executeResult, setExecuteResult] = useState<Record<string, any>>({});
  const [currentAppInfo, setCurrentAppInfo] = useState<AppInfo>();
  const [appDataset, setAppDataset] = useState<any[]>([]);
  const [registryListPage, setRegistryListPage] = useState<ITableData>();
  
  const [isAudited, setIsAudited] = useState(false);
  const [widgetProcessing, setWidgetProcessing] = useState<Record<string, boolean>>({});

  const hasWidgetProcessing = useMemo(() => {
    return Object.values(widgetProcessing).some((processing) => processing);
  }, [widgetProcessing]);

  const currentAppType = useMemo(() => (currentAppInfo?.appType || 'FORM'), [ currentAppInfo?.appType ])

  const categoryRequest = useRequest(Service.fetchCategories, {
    manual: true,
    onSuccess: (result: AppCategories) => {
      setCategories(result);
    },
  });
  const createCategoryRequest = useRequest<ICategoryItem, any[]>(Service.createCategory, {
    manual: true,
    onSuccess: (result) => {
      if (result) {
        categories.push(result);
        setCategories([...categories]);
      }
    },
  });

  const updateCategoryRequest = useRequest(Service.updateCategory, {
    manual: true,
    onSuccess: (result, [categoryId, categoryName]) => {
      if (result) {
        const index = _.findIndex(categories, (item) => item.categoryId === categoryId);
        if (index > -1) {
          categories[index].categoryName = categoryName;
        }
        setCategories([...categories]);
      }
    },
  });
  const deleteCategoryRequest = useRequest(Service.deleteCategory, {
    manual: true,
    onSuccess: (result, [categoryId]) => {
      if (result) {
        setCategories(_.filter(categories, (item) => item.categoryId !== categoryId));
      }
    },
  })
  const appsRequest = useRequest(Service.fetchApps, {
    manual: true,
    onSuccess: (result: ITableData) => {
      setAppData(result);
    },
  });

  const appInfoRequest = useRequest<AppInfo, any>(Service.fetchAppInfo, {
    manual: true,
    onSuccess: (result: AppInfo) => {
      setCurrentAppInfo(result);
      if (result) {
        initAppResources(result.resources as any)
      }
    }
  });

  const appDatasetRequest = useRequest<any, any[]>(Service.fetchAppDatasetList, {
    manual: true,
    onSuccess: (result) => {
      setAppDataset(result);
    }
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
    //       newPageData = updatePageListData(appData, result, 'nodeId');
    //     } else {
    //       newPageData = addPageListData(appData, result);
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
        const newPageData = deletePageListData(appData, 'nodeId', nodeId);
        if (newPageData) {
          setAppData(newPageData as ITableData);
        }
      }
    },
  });

  const updateStatusRequest = useRequest(Service.updateAppStatus, {
    manual: true,
    onSuccess: (result: boolean, [nodeId, status]) => {
      if (result) {
        const page = _.find(appData.list, (item) => item.nodeId === nodeId);
        if (page) {
          page.status = status;
        }
        setAppData({
          ...appData,
        });
      }
    },
  });

  const fetchAppInfo = (appKey: string) => {
    if (appKey) {
      appInfoRequest.run(appKey)
    }
  }

  const updateWidgetProcessing = (widgetId: string, processing: boolean) => {
    setWidgetProcessing((prev) => ({ ...prev, [widgetId]: processing }));
  }

  const registryListRequest = useRequest(Service.fetchRegistryList, {
    manual: true,
    onSuccess: (result: ITableData) => {
      setRegistryListPage(result);
    }
  });

  const registryFieldsRequest = useRequest<any, any>(Service.fetchRegistryFields, {
    manual: true,
  });

  return {
    categories,
    categoryRequest,
    deleteCategoryRequest,
    updateCategoryRequest,
    createCategoryRequest,

    isAudited,
    setIsAudited,
    appData,
    appsRequest,

    appDataset,
    appDatasetRequest,

    formSchema,
    setFormSchema,

    saveAppRequest,
    appInfoRequest,
    deleteAppRequest,
    updateStatusRequest,

    widgetProcessing,
    hasWidgetProcessing,
    setWidgetProcessing,
    updateWidgetProcessing,

    fetchAppInfo,
    currentAppType,
    currentAppInfo,
    setCurrentAppInfo,
    updateAppInfoRequest,

    registryListPage,
    registryListRequest,
    registryFieldsRequest,
  }
}

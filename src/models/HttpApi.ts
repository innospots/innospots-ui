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

import * as Service from '@/services/HttpApi';
import { ArrayType } from '@/common/types/Types';

import { deletePageListData, updatePageListData, addPageListData } from '@/common/utils';

export default () => {
  const [httpApis, setHttpApis] = useState<ArrayType>([]);

  /**
   * 获取列表数据
   */
  const httpApisRequest = useRequest(Service.fetchHttpApis, {
    manual: true,
    cacheKey: 'HttpApiList',
    onSuccess: (result: ArrayType) => {
      setHttpApis(result);
    },
  });

  const testExecuteRequest = useRequest(Service.testExecute, {
    manual: true,
  });

  const httpApiDetailRequest = useRequest(Service.fetchHttpApiDetail, {
    manual: true,
  });

  const saveHttpApiRequest = useRequest(Service.saveHttpApi, {
    manual: true,
    onSuccess(result, [data, type]) {
      if (result) {
        updateHttpApi(type, type === 'add' ? result : data);
      }
    },
  });

  const deleteHttpApiRequest = useRequest(Service.deleteHttpApi, {
    manual: true,
    onSuccess(result, [datasourceId]) {
      if (result) {
        updateHttpApi('delete', datasourceId);
      }
    },
  });

  /**
   * 更新数据源
   * @param type
   * @param data
   */
  const updateHttpApi = (type: string, data: any) => {
    let list: ArrayType = [];
    if (type === 'add') {
      list = addPageListData(httpApis, data) as ArrayType;
    } else if (type === 'edit') {
      list = updatePageListData(httpApis, data, 'registryId') as ArrayType;
    } else if (type === 'delete') {
      list = deletePageListData(httpApis, 'registryId', data) as ArrayType;
    }

    setHttpApis(list);
  };

  return {
    httpApis,

    httpApisRequest,
    saveHttpApiRequest,
    testExecuteRequest,
    deleteHttpApiRequest,
    httpApiDetailRequest,
  };
};

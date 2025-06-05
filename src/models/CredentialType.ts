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

import * as Service from '@/services/CredentialType';
import {ArrayType, ITableData, KeyValues} from '@/common/types/Types';
import {addPageListData, deletePageListData, updatePageListData} from '@/common/utils';

export default () => {

  const [connector, setConnector] = useState<KeyValues>({});
  const [appCategories, setAppCategories] = useState<ArrayType>([]);
  const [credentialTypeData, setCredentialTypeData] = useState<ITableData>({});
  const [simpleCredentials, setSimpleCredentials] = useState<ArrayType>([]);

  const appCategoriesRequest = useRequest<ArrayType, any>(Service.fetchAppsCategoryApp, {
    manual: true,
    onSuccess: (result: ArrayType) => {
      setAppCategories(result);
    },
  });

  /**
   * 获取分页凭据类型列表
   */
  const credentialTypePageRequest = useRequest<ITableData, KeyValues[]>(Service.fetchCredentialTypePageData, {
    manual: true,
    onSuccess: (result: ITableData) => {
      setCredentialTypeData(result);
    },
  });

  /**
   * 更新凭据类型
   * @param type
   * @param data
   */
  const updateCredentialType = (type: string, data: any) => {
    let pageData: ITableData = {};

    if (type === 'add') {
      pageData = addPageListData(credentialTypeData, data) as ITableData;
    } else if (type === 'edit') {
      pageData = updatePageListData(credentialTypeData, data, 'typeCode') as ITableData;
    } else if (type === 'delete') {
      pageData = deletePageListData(credentialTypeData, 'typeCode', data?.typeCode) as ITableData;
    }

    setCredentialTypeData(pageData);
  };

  /**
   * 删除凭据
   */
  const deleteCredentialTypeRequest = useRequest(Service.deleteCredentialType, {
    manual: true,
    onSuccess: (result, [typeCode]) => {
      updateCredentialType('delete', {
        typeCode,
      });
    },
  });

  /**
   * 创建、修改凭据
   */
  const saveCredentialTypeRequest = useRequest(Service.saveCredentialType, {
    manual: true,
    onSuccess: (result, [data, type]) => {
      if (type === 'edit') {
        updateCredentialType('edit', data);
      } else {
        updateCredentialType('add', result);
      }
    },
  });

  /**
   * 连接测试
   */
  const connectionTestRequest = useRequest(Service.connectionTest, {
    manual: true,
  });

  return {
    credentialTypeData,
    credentialTypePageRequest,

    simpleCredentials,
    setSimpleCredentials,

    connector,
    setConnector,

    appCategories,

    appCategoriesRequest,
    connectionTestRequest,
    saveCredentialTypeRequest,
    deleteCredentialTypeRequest
  }
}

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

import * as Service from '@/services/Credential';
import { ITableData, KeyValues, ArrayType } from '@/common/types/Types';
import {addPageListData, deletePageListData, updatePageListData} from '@/common/utils';

export default () => {

  const [schemaFields, setSchemaFields] = useState<any[]>([]);
  const [connector, setConnector] = useState<KeyValues>({});
  const [credentials, setCredentials] = useState<ArrayType>([]);
  const [credentialTypes, setCredentialTypes] = useState<ArrayType>([]);
  const [credentialData, setCredentialData] = useState<ITableData>({});
  const [credentialConfigs, setCredentialConfigs] = useState<ArrayType>([]);
  const [simpleCredentials, setSimpleCredentials] = useState<ArrayType>([]);

  const [appCategories, setAppCategories] = useState<ArrayType>([]);
  const [schemaRegistries, setSchemaRegistries] = useState<ArrayType>([]);

  /**
   * 更新凭据
   * @param type
   * @param data
   */
  const updateCredential = (type: string, data: any) => {
    let pageData: ITableData = {};
    let simpleList: ArrayType = [];

    if (type === 'add') {
      pageData = addPageListData(credentialData, data) as ITableData;
      simpleList = addPageListData(credentials, data) as ArrayType;
    } else if (type === 'edit') {
      pageData = updatePageListData(credentialData, data, 'credentialKey') as ITableData;
      simpleList = updatePageListData(credentials, data, 'credentialKey') as ArrayType;
    } else if (type === 'delete') {
      pageData = deletePageListData(credentialData, 'credentialKey', data?.credentialKey) as ITableData;
      simpleList = deletePageListData(credentials, 'credentialKey', data?.credentialKey) as ArrayType;
    }

    setCredentialData(pageData);
    setCredentials(simpleList);
  };

  const appCategoriesRequest = useRequest<ArrayType, any>(Service.fetchAppsCategoryApp, {
    manual: true,
    onSuccess: (result: ArrayType) => {
      setAppCategories(result);
    },
  });

  /**
   * 获取凭证列表
   */
  const credentialsRequest = useRequest<ArrayType, KeyValues[]>(Service.fetchCredentials, {
    manual: true,
    onSuccess: (result: ArrayType) => {
      setCredentials(result);
    },
  });

  /**
   * 获取凭证列表
   */
  const simpleCredentialsRequest = useRequest<any, any>(Service.fetchCredentialSimpleList, {
    manual: true,
    onSuccess: (result: ArrayType) => {
      setSimpleCredentials(result);
    },
  });

  /**
   * 获取分页凭证列表
   */
  const credentialPageRequest = useRequest<ITableData, KeyValues[]>(Service.fetchCredentialPageData, {
    manual: true,
    onSuccess: (result: ITableData) => {
      setCredentialData(result);
    },
  });

  const credentialTypesRequest = useRequest<ArrayType, any>(Service.fetchCredentialTypes, {
    manual: true,
    onSuccess: (result: ArrayType) => {
      setCredentialTypes(result);
    },
  });

  const nodeConfigsRequest = useRequest<any, any>(Service.fetchNodeConfigs, {
    manual: true
  });

  const credentialConfigsRequest = useRequest<ArrayType, any>(Service.fetchCredentialConfigs, {
    manual: true,
    onSuccess: (result: ArrayType) => {
      setCredentialConfigs(result);
    },
  });

  /**
   * 删除凭据
   */
  const deleteCredentialRequest = useRequest(Service.deleteCredential, {
    manual: true,
    onSuccess: (result, [credentialKey]) => {
      updateCredential('delete', {
        credentialKey,
      });
    },
  });

  /**
   * 创建、修改凭据
   */
  const saveCredentialRequest = useRequest(Service.saveCredential, {
    manual: true,
    onSuccess: (result, [data, type]) => {
      if (type === 'edit') {
        updateCredential('edit', data);
      } else {
        updateCredential('add', result);
      }
    },
  });

  /**
   * 连接测试
   */
  const connectionTestRequest = useRequest(Service.connectionTest, {
    manual: true,
  });

  const schemaRegistryRequest = useRequest<any, any[]>(Service.fetchSchemaRegistries, {
    manual: true,
    onSuccess: (result) => {
      setSchemaRegistries(result);
    },
  });

  const detailRequest = useRequest<any, any[]>(Service.getCredentialDetail, {
    manual: true,
  });

  const fetchSchemaRegistryTopicsRequest = useRequest(Service.fetchSchemaRegistryTopics, {
    manual: true,
  });

  const fetchSchemaRegistryTopicRequest = useRequest(Service.fetchSchemaRegistryTopic, {
    manual: true,
  });

  const saveSchemaRegistryRequest = useRequest<any, any[]>(Service.saveSchemaRegistry, {
    manual: true,
    onSuccess: (result, params) => {
      if (params[1] === 'add') {
        schemaRegistries.push(result);
      } else {
        const index = _.findIndex(
          schemaRegistries,
          (item) => item.registryId === result.registryId,
        );
        if (index > -1) {
          schemaRegistries[index] = result;
        }
      }
      setSchemaRegistries([...schemaRegistries]);
    },
  });

  const schemaFieldsParseRequest = useRequest(Service.schemaFieldsParse, {
    manual: true,
  });

  const fetchSchemaFieldsRequest = useRequest<any, any[]>(Service.fetchSchemaFields, {
    manual: true,
    onSuccess: (result) => {
      if (result) {
        setSchemaFields(result)
      }
    },
  });

  const saveSchemaFieldRequest = useRequest(Service.saveSchemaField, {
    manual: true,
  });

  const deleteSchemaFieldRequest = useRequest(Service.deleteSchemaField, {
    manual: true,
  });

  const checkSchemaRegistryRequest = useRequest(Service.checkSchemaRegistry, {
    manual: true,
  });

  const fetchSchemaRegistryRequest = useRequest(Service.fetchSchemaRegistry, {
    manual: true,
  });

  const deleteSchemaRegistryRequest = useRequest(Service.deleteSchemaRegistry, {
    manual: true,
    onSuccess: (result, params) => {
      if (result) {
        const list = _.filter(schemaRegistries, (item) => item.registryId !== params[0]);
        setSchemaRegistries(list);
      }
    },
  });

  const datasetPreviewRequest = useRequest(Service.fetchDatasetPreview, {
    manual: true,
  });

  return {
    credentials,
    credentialData,
    credentialsRequest,
    credentialPageRequest,
    appCategories,
    appCategoriesRequest,
    simpleCredentials,
    setSimpleCredentials,
    simpleCredentialsRequest,

    connector,
    setConnector,

    credentialTypes,
    credentialTypesRequest,

    credentialConfigs,
    credentialConfigsRequest,
    connectionTestRequest,
    saveCredentialRequest,
    deleteCredentialRequest,

    detailRequest,
    nodeConfigsRequest,

    schemaFields,
    schemaRegistries,
    schemaRegistryRequest,
    schemaFieldsParseRequest,
    saveSchemaRegistryRequest,
    fetchSchemaRegistryTopicRequest,
    fetchSchemaRegistryTopicsRequest,

    saveSchemaFieldRequest,
    deleteSchemaFieldRequest,
    fetchSchemaFieldsRequest,
    checkSchemaRegistryRequest,
    deleteSchemaRegistryRequest,
    fetchSchemaRegistryRequest,

    datasetPreviewRequest
  }
}

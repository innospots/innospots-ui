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

import * as Service from '@/services/DataSource';
import { deletePageListData, updatePageListData, addPageListData } from '@/common/utils';

import { ArrayType } from '@/common/types/Types';

export default () => {
  const [dataSources, setDataSources] = useState<ArrayType>([]);
  const [dataSourcesData, setDataSourcesData] = useState<any>({});
  const [metaSources, setMetaSources] = useState<ArrayType>([]);
  const [schemaRegistries, setSchemaRegistries] = useState<ArrayType>([]);

  /**
   * 删除数据源
   * @param id
   */
  const deleteDataSourceById = (id: string) => {
    const list = _.filter(dataSources, (item) => item.datasourceId !== id);
    setDataSources(_.cloneDeep(list));
  };

  /**
   * 添加数据源
   * @param data
   */
  const addDataSource = (data: any) => {
    dataSources.push(data);
    setDataSources(_.cloneDeep(dataSources));
  };

  /**
   * 更新数据源
   * @param type
   * @param data
   */
  const updateDataSource = (type: string, data: any) => {
    let list: ArrayType = [];

    if (type === 'add') {
      list = addPageListData(dataSourcesData, data) as ArrayType;
    } else if (type === 'edit') {
      list = updatePageListData(dataSourcesData, data, 'datasourceId') as ArrayType;
    } else if (type === 'delete') {
      list = deletePageListData(dataSourcesData, 'datasourceId', data?.datasourceId) as ArrayType;
    }

    setDataSources(list);
  };

  /**
   * 获取数据源列表
   */
  const dataSourceRequest = useRequest<any, any[]>(Service.fetchDataSources, {
    manual: true,
    cacheKey: 'DataSourceList',
    onSuccess: (result: ArrayType) => {
      setDataSources(result);
    },
  });

  /**
   * 获取分页数据源列表
   */
  const dataSourceWithPageRequest = useRequest<any, any[]>(Service.fetchDataSourcesWithPage, {
    manual: true,
    cacheKey: 'DataSourceList',
    onSuccess: (result: any) => {
      setDataSourcesData(result);
    },
  });

  /**
   * 删除数据源
   */
  const deleteDataSourceRequest = useRequest(Service.deleteDataSource, {
    manual: true,
    onSuccess: (result, [datasourceId]) => {
      updateDataSource('delete', {
        datasourceId,
      });
    },
  });

  /**
   * 创建、修改数据源
   */
  const saveDataSourceRequest = useRequest(Service.saveDataSource, {
    manual: true,
    onSuccess: (result, [data, type]) => {
      if (type === 'edit') {
        updateDataSource('edit', data);
      } else {
        updateDataSource('add', result);
      }
    },
  });

  /**
   * 创建、修改数据源
   */
  const metaSourcesRequest = useRequest<any, any[]>(Service.fetchMetaSources, {
    manual: true,
    onSuccess: (result) => {
      setMetaSources(result);
    },
  });

  /**
   * 数据源连接测试
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

  const detailRequest = useRequest<any, any[]>(Service.getDatasourceDetail, {
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

  const deleteSchemaRegistryRequest = useRequest(Service.deleteSchemaRegistry, {
    manual: true,
    onSuccess: (result, params) => {
      if (result) {
        const list = _.filter(schemaRegistries, (item) => item.registryId !== params[0]);
        setSchemaRegistries(list);
      }
    },
  });

  return {
    metaSources,
    dataSources,
    dataSourcesData,
    schemaRegistries,

    addDataSource,
    updateDataSource,
    deleteDataSourceById,

    connectionTestRequest,

    saveSchemaFieldRequest,
    deleteSchemaFieldRequest,
    fetchSchemaFieldsRequest,
    checkSchemaRegistryRequest,
    deleteSchemaRegistryRequest,

    detailRequest,
    dataSourceRequest,
    dataSourceWithPageRequest,
    metaSourcesRequest,
    saveDataSourceRequest,
    deleteDataSourceRequest,

    schemaRegistryRequest,
    schemaFieldsParseRequest,
    saveSchemaRegistryRequest,
    fetchSchemaRegistryTopicRequest,
    fetchSchemaRegistryTopicsRequest,
  };
};

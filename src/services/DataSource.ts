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

import { fetch } from '@/common/request';
import { HandleType } from '@/common/types/Types';

export const fetchDataSources = (queryCode?: string) => {
  return fetch(`schema/datasource/list`, {
    params: {
      queryCode,
    },
  });
};

export const fetchDataSourcesWithPage = (params?: any) => {
  return fetch(`schema/datasource/page`, {
    params
  });
};

export const saveDataSource = (data: any, type: HandleType = 'add') => {
  return fetch(`schema/datasource`, {
    data,
    method: type === 'add' ? 'POST' : 'PUT',
  });
};

export const saveSchemaRegistry = (data: any, type: HandleType = 'add') => {
  return fetch(`schema/registry`, {
    data,
    method: type === 'add' ? 'POST' : 'PUT',
  });
};

export const deleteDataSource = (dataSourceId: number) => {
  return fetch(`schema/datasource/${dataSourceId}`, {
    method: 'delete',
  });
};

export const fetchMetaSources = () => {
  return fetch(`schema/datasource/config/list`);
};

export const connectionTest = (data: any) => {
  return fetch(`schema/datasource/connection/test`, {
    data,
    method: 'post',
  });
};

export const saveSchemaField = (data: any) => {
  return fetch(`schema/fields/upsert`, {
    data,
    method: 'post',
  });
};

export const deleteSchemaField = (fieldId: number) => {
  return fetch(`schema/fields/${fieldId}`, {
    method: 'delete',
  });
};

export const schemaFieldsParse = (sourceType: string, data: any) => {
  return fetch(`schema/fields/parse`, {
    data,
    params: {
      sourceType,
    },
    method: 'post',
  });
};

export const fetchSchemaRegistries = (
  datasourceId: number,
  params?: {
    [key: string]: string | number;
  },
) => {
  return fetch(`schema/registry/list`, {
    params: {
      ...params,
      datasourceId,
    },
  });
};

export const fetchSchemaRegistryTopics = (credentialId: number, params?: any) => {
  return fetch(`apps/schema/registry/catalog/list`, {
    params: {
      credentialId,
      ...params
    },
  });
};

export const fetchSchemaRegistryTopic = (datasourceId: number, tableName: string) => {
  return fetch(`schema/registry/fetch-sample`, {
    params: {
      tableName,
      datasourceId,
    },
  });
};

export const deleteSchemaRegistry = (id: number) => {
  return fetch(`schema/registry/${id}`, {
    method: 'delete',
  });
};

export const getDatasourceDetail = (datasourceId: number) => {
  return fetch(`schema/datasource/${datasourceId}`);
};

export const fetchSchemaFields = (params) => {
  return fetch(`schema/fields/list`, {
    params,
  });
};

export const checkSchemaRegistry = (name: string) => {
  return fetch(`schema/registries/check/${name}`);
};

export function fetchSecretKey<T> ():Promise<string> {
  return fetch(`secret-key`);
};

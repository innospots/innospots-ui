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
import {HandleType, ITableData, KeyValues, ArrayType} from '@/common/types/Types';
import {DEFAULT_PAGINATION_SETTINGS} from '@/common/constants';

export function fetchCredentials<T> (params?: KeyValues): Promise<ArrayType> {
  return fetch(`apps/credential/simple/list`, {
    params
  });
}

export function fetchCredentialSimpleList<T> (appNodeCode: string, params?: KeyValues): Promise<ArrayType> {
  return fetch(`apps/credential/simple/list/${appNodeCode}`, {
    params
  });
}

export function fetchCredentialPageData<T> (params?: KeyValues): Promise<ITableData> {
  return fetch(`apps/credential/page`, {
    params
  });
}

export function fetchAppsCategoryApp(): Promise<ArrayType> {
  return fetch(`apps/category/list`);
}

export function fetchNodeConfigs(nodeId: number): Promise<ArrayType> {
  return fetch(`apps/connector/form/${nodeId}`);
}

export function fetchCredentialConfigs(): Promise<ArrayType> {
  return fetch(`apps/schema/connector/config/list`);
  // return fetch(`apps/credential/config/list`);
}

export const deleteCredential = (credentialId: number) => {
  return fetch(`apps/credential/${credentialId}`, {
    method: 'delete',
  });
};

export const saveCredential = (data: any, type: HandleType = 'add') => {
  return fetch(`apps/credential`, {
    data,
    method: type === 'add' ? 'POST' : 'PUT',
  });
};

export const connectionTest = (data: any) => {
  return fetch(`apps/credential/connection/test`, {
    data,
    method: 'post',
  });
};

export const fetchSchemaRegistries = (
  credentialId: number,
  params?: {
    [key: string]: string | number;
  },
) => {
  return fetch(`apps/schema/registry/list`, {
    params: {
      ...params,
      credentialId,
    },
  });
};

export const saveSchemaRegistry = (data: any, type: HandleType = 'add') => {
  return fetch(`apps/schema/registry`, {
    data,
    method: type === 'add' ? 'POST' : 'PUT',
  });
};

export const fetchSchemaRegistryTopics = (credentialId: number, params?: any) => {
  return fetch(`apps/schema/registry/catalog/list`, {
    params: {
      credentialId,
    },
  });
};

export const fetchSchemaRegistryTopic = (credentialId: number, tableName: string) => {
  return fetch(`apps/schema/registry/fetch-sample`, {
    params: {
      tableName,
      credentialId,
    },
  });
};

export const deleteSchemaRegistry = (id: number) => {
  return fetch(`apps/schema/registry/${id}`, {
    method: 'delete',
  });
};

export const getCredentialDetail = (credentialId: number) => {
  return fetch(`apps/credential/${credentialId}`);
};

export const saveSchemaField = (data: any) => {
  return fetch(`apps/schema/fields/upsert`, {
    data,
    method: 'post',
  });
};

export const deleteSchemaField = (fieldId: number) => {
  return fetch(`apps/schema/fields/${fieldId}`, {
    method: 'delete',
  });
};

export const schemaFieldsParse = (sourceType: string, data: any) => {
  return fetch(`apps/schema/fields/parse`, {
    data,
    params: {
      sourceType,
    },
    method: 'post',
  });
};

export const fetchSchemaFields = (params) => {
  return fetch(`apps/schema/fields/list`, {
    params,
  });
};

export const fetchDatasetPreview = (params: any) => {
  return fetch(`apps/schema/registry/fetch-samples`, {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...params,
    },
    // method: 'post',
  });
};

export const checkSchemaRegistry = (name: string) => {
  return fetch(`apps/schema/registries/check/${name}`);
};
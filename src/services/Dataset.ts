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

import { fetch, dataRequest } from '@/common/request';
import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';
import { HandleType, Categories } from '@/common/types/Types';

export const fetchDataFields = (
  datasourceId: number,
  params: {
    tableName?: string;
    dataSetId?: number;
    queryCode?: string;
  },
) => {
  return fetch(`schema/fields/${datasourceId}`, {
    params,
  });
};

export const getSchemaTable = (datasourceId: number) => {
  return dataRequest(`schema/registries/${datasourceId}`);
};

export const fetchSchemaRegistries = (params: {
  datasourceId: number;
  tableName?: string;
  dataSetId: number;
}) => {
  return fetch(`schema/registries`, {
    params,
  });
};

export const fetchDatasetPreview = (params: any) => {
  return fetch(`apps/schema/registry/fetch-samples`, {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...params,
    },
    method: 'post',
  });
};

export const createCategory = (categoryName: string): any => {
  return fetch(`apps/schema/category?categoryName=${categoryName}`, {
    method: 'post',
  });
};

export const updateCategory = (categoryId: number, categoryName: string) => {
  return fetch(`apps/schema/category/${categoryId}?categoryName=${categoryName}`, {
    method: 'put',
  });
};

export const saveDataset = (data: any, type: HandleType = 'add') => {
  return fetch('apps/schema/data-set', {
    data,
    method: type === 'add' ? 'POST' : 'PUT',
  });
};

export const deleteDataset = (id: number) => {
  return fetch(`apps/schema/data-set/${id}`, {
    method: 'delete',
  });
};

export const deleteCategory = (categoryId: number) => {
  return fetch(`apps/schema/category/${categoryId}`, {
    method: 'delete',
  });
};

export const fetchCategories = () => {
  return fetch(`apps/schema/category/list`);
};

export const fetchDataset = (data) => {
  return fetch(`apps/schema/data-set/page`, {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  });
};

export const fetchDatasetList = (params) => {
  return fetch(`apps/schema/data-set/list`, {
    params,
  });
};

export function datasetExecute<T> (
  data: any,
  params?: {
    page: number;
    size: number;
    credentialId: number;
  },
): Promise<{
  rows: any[]
  columns: any[]
  pageBody: any
}> {
  return fetch(`apps/schema/data/execute`, {
    data,
    params,
    method: 'post',
  });
};

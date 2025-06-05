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

export function fetchCategories<T> (): Promise<T> {
  return fetch<T>('app/definition/category');
};
export const createCategory = (categoryName: string): any => {
  return fetch(`app/definition/category?categoryName=${categoryName}`, {
    method: 'post',
  });
};

export const updateCategory = (categoryId: number, categoryName: string) => {
  return fetch(`app/definition/category/${categoryId}?categoryName=${categoryName}`, {
    method: 'put',
  });
};
export const deleteCategory = (categoryId: number) => {
  return fetch(`app/definition/category/${categoryId}`, {
    method: 'delete',
  });
};

export function checkPermission<T> (approvelnstancekey: string, params?: any): Promise<T> {
  return fetch<T>(`approve/permission/check/${approvelnstancekey}`, {
    params,
  });
};

export function fetchAppInfo<T> (appKey: string): Promise<T> {
  return fetch<T>(`app/show/${appKey}`);
  // return fetch<T>(`app/definition/${appKey}`);
};

export const fetchAppDatasetList = (appKey: string) => {
  return fetch(`schema/registry/list-app/`+appKey);
};

export function fetchApps<T> (data?: any): Promise<T> {
  return fetch(`app/definition/page`, {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  });
};

export function fetchShowApps<T> (data?: any): Promise<T> {
  return fetch(`app/show/page`, {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  });
};

export function updateAppStatus<T> (appKey: string, status: string): Promise<T> {
  return fetch(`app/definition/${appKey}/status/${status}`, {
    method: 'put',
  });
};

export function postAppInfo<T> (data: any, method: 'put' | 'post' = 'post'): Promise<T> {
  return fetch(`app/definition`, {
    data,
    method,
  });
};

export function deleteAppInfo<T> (appKey: string): Promise<T> {
  return fetch(`app/definition/${appKey}`, {
    method: 'delete'
  });
};

export function updateAppInfo<T> (data: any): Promise<T> {
  return fetch(`app/definition`, {
    data,
    method: 'put'
  });
};

export function fetchRegistryList<T> (registryType: string, params?: any): Promise<T> {
  return fetch(`app/schema-registry/page/${registryType}`, {
    params,
  });
};

export function fetchRegistryFields<T> (registryType: string, registryCode: string): Promise<T> {
  return fetch(`app/schema-registry/type/${registryType}/${registryCode}`);
};

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
  return fetch<T>('apps/category/list');
};

export function fetchAppInfo<T> (nodeId: number): Promise<T> {
  return fetch<T>(`apps/definition/${nodeId}`);
};

export function appExecute<T> (data: any): Promise<T> {
  return dataRequest.post(`apps/definition/debug/execute`, {
    data
  });
};

export function fetchApps<T> (data?: any): Promise<T> {
  return fetch(`apps/definition/page`, {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  });
};

export function updateAppStatus<T> (nodeId: number, status: string): Promise<T> {
  return fetch(`apps/definition/${nodeId}/status/${status}`, {
    method: 'put',
  });
};

export function postAppInfo<T> (data: any, method: 'put' | 'post' = 'post'): Promise<T> {
  return fetch(`apps/definition/info`, {
    data,
    method,
  });
};

export function deleteAppInfo<T> (nodeId: number): Promise<T> {
  return fetch(`apps/definition/${nodeId}`, {
    method: 'delete'
  });
};

export function updateAppInfo<T> (data: any): Promise<T> {
  return fetch(`apps/definition`, {
    data,
    method: 'put'
  });
};
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

export function fetchPages<T> (data?: any): Promise<T> {
  return fetch(`page/page`, {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  });
};

export const getWorkspaceInfo = (data?: any) => {
  return dataRequest(`workspace`);
};
export const savePage = (data: any) => {
  return dataRequest('page', {
    data,
    method: 'post',
  });
};

export function fetchPageDetail<T> (pageId: number): Promise<T> {
  return fetch(`page/${pageId}`);
};

export function deletePage<T> (pageId: number): Promise<T> {
  return fetch(`page/${pageId}`, {
    method: 'delete',
  });
};

export function updatePageStatus<T> (pageId: number, status: string): Promise<T> {
  return fetch(`page/${pageId}/status/${status}`, {
    method: 'put',
  });
};

export const pageRecycle = (pageId: number) => {
  return fetch(`page/${pageId}/recycle`, {
    method: 'put',
  });
};

export function fetchPageCategories<T> (): Promise<T> {
  return fetch(`page/category/page`);
};

export function createPageCategory<T> (categoryName: string): Promise<T> {
  return fetch('page/category', {
    params: {
      categoryName,
    },
    method: 'post',
  });
};

export function updatePageCategory<T> (categoryId: number, categoryName: string): Promise<T> {
  return fetch(`page/category/${categoryId}`, {
    params: {
      categoryName,
    },
    method: 'put',
  });
};

export const deleteCategory = (categoryId: number | string) => {
  return fetch(`/page/category/${categoryId}`, {
    method: 'delete',
  });
};

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

export type KeyValues = Record<string, any>;

export type HandleType = 'add' | 'edit';

export const DEFAULT_TABLE_DATA = {
  list: [],
  pagination: {
    total: 0,
    current: 0,
    pageSize: 0,
    totalPage: 0,
  },
};

export interface ITableData {
  list?: any[];
  pagination?: {
    total: number;
    current: number;
    pageSize: number;
    totalPage: number;
  };
}

export type ArrayType = any[];

export interface ICategoryItem {
  categoryId: number;
  categoryName: string;
  totalCount: number;
}

export type Categories = ICategoryItem[] | Record<string, any>[];

export interface ILanguageItem {
  name: string;
  locale: string;
  status: string;
  languageId: number;
}

export type Languages = ILanguageItem[];

export interface IListQueryParams {
  page?: number;
  size?: number;
  asc?: boolean;
  sort?: string;
  paging?: boolean;
}

export type AppInfo = {
  status: string;
  outPorts: any;
  inPorts: any;
  icon: string
  code: string
  name: string
  used: boolean
  nodeId: number
  primitive: string
  appSource: string
  description: string
  nodeGroupId: number
}

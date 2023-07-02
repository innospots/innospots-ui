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
import {MenuItemType} from '@/pages/Config/Menus/components/MenuModal';

export function fetchAppList<T> (data?: any): Promise<T> {
  return fetch('extension-store/list', {
    params: {
      ...data,
    },
  });
};
export function getInstalledAppListData<T> (data?: any): Promise<T> {
  return fetch('extension/installed/list', {
    params: {
      ...data,
    },
  });
};

export function installedAppBaseInfos<T> (): Promise<T> {
  return fetch('extension/installed/list/base-info');
};

export const appMenu = (appKey: string) => {
  return fetch(`extension/${appKey}/menu`);
};

export function fetchApplicationModules<T> (appKey: string): Promise<MenuItemType[]> {
  return fetch(`extension-store/${appKey}/modules`);
};

export const fetchApplicationMenuItems = (parentMenuKey: string) => {
  return fetch(`extension-store/items/${parentMenuKey}`);
};

export const appSubMenu = (appKey: string, parentMenuKey: string) => {
  return fetch(`extension/${appKey}/menu/${parentMenuKey}`);
};

// 应用停启用
export const changeAppStatus = (data?: any) => {
  let url = `extension/${data.operateState}/${data.appKey}`;

  return dataRequest(url, {
    method: 'post',
  });
};

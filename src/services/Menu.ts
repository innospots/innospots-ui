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
import {MenuItemType} from '@/pages/Config/Menus/components/MenuModal';

export function fetchMenus<T> (data?): Promise<T> {
  return fetch(`menu/list`, {
    params: {
      ...data,
    },
  });
};

export function fetchMenuItems<T> (): Promise<T> {
  return fetch(`menu/items`);
};

export function fetchMenuTypes<T> (type: string = 'CATEGORY'): Promise<MenuItemType> {
  return fetch(`menu/list/${type}`);
};

export function createMenuItem<T> (data: any): Promise<MenuItemType> {
  return fetch(`menu/menu-item`, {
    data,
    method: 'post',
  });
};

export function updateMenuItem<T> (data: any): Promise<MenuItemType> {
  return fetch(`menu/menu-item`, {
    data,
    method: 'put',
  });
};

export const deleteMenuItem = (resourceId: number) => {
  return fetch(`menu/menu-item/${resourceId}`, {
    method: 'delete',
  });
};

export const updateMenuOrder = (data: any) => {
  return fetch(`menu/menu-item/order`, {
    data,
    method: 'put',
  });
};

export function updateMenuStatus<T> (resourceId: number, status: boolean): Promise<T> {
  return fetch(`menu/menu-item/${resourceId}/status/${status}`, {
    method: 'put',
  });
};

export function fetchNavigations<T> (): Promise<T> {
  return fetch(`navigation/items`, {
    ignoreToken: true,
  });
};

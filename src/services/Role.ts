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

import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

export function fetchRoles<T> (data?: any): Promise<T> {
  return fetch('role/page', {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ignoreAdmin: true,
      ...data,
    },
  });
};

export function fetchRoleUserList<T> (roleId: number, data?: any):Promise<T> {
  return fetch(`role/${roleId}/users`, {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ignoreAdmin: true,
      ...data,
    },
  });
};

export const saveRole = (type: string, data: any) => {
  return fetch('role', {
    data,
    method: type === 'edit' ? 'put' : 'post',
  });
};

/**
 * 将成员移出此角色
 * @param roleId
 * @param userId
 */
export const removeUserFromRole = (roleId: number, userId: string) => {
  return fetch(`role/${roleId}/user/${userId}`, {
    method: 'delete',
  });
};

export function deleteRole<T> (roleId: number):Promise<T> {
  return fetch(`role/${roleId}`, {
    method: 'delete',
  });
};

/**
 * 更新角色中的成员
 * @param roleId
 * @param data
 */
export const updateMemberOfRole = (roleId: number, data: any) => {
  return fetch(`role/${roleId}/user`, {
    data,
    method: 'post',
  });
};

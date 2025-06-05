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
import { HandleType } from '@/common/types/Types';

export function fetchMember<T> (data?: any): Promise<{
  list: any[]
}> {
  return fetch('user/page', {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  });
};
export const fetchMemberDetail = (id: number) => {
  return fetch(`user/${id}`);
};

export const saveMember = (type: HandleType, data?: any) => {
  return fetch('user', {
    data,
    method: type === 'edit' ? 'put' : 'post',
  });
};

export const deleteMember = (id: number) => {
  return fetch(`user/${id}`, {
    method: 'delete',
  });
};

export const changeStatus = (id: string, status: string) => {
  return fetch(`user/${id}/status/${status}`, {
    method: 'put',
  });
};

export const changePassword = (data: any) => {
  return fetch(`user/password`, {
    data,
    method: 'put',
  });
};

export const fetchUserGroups = () => {
  return fetch('user-group/list');
};

export const saveUserGroup = (type: HandleType, data?: any) => {
  return fetch('user-group', {
    data,
    method: type === 'edit' ? 'put' : 'post',
  });
};

export const deleteUserGroup = (groupId: number | string) => {
  return fetch(`user-group/${groupId}`, {
    method: 'delete',
  });
};

export const fetchGroupUsers = (groupId: number | string, params?: any) => {
  return fetch(`user-group/${groupId}/users?includeSubGroup=false`, {
    params,
  });
};

export const updateGroupUsers = (groupId: number | string, userIds: any[]) => {
  return fetch(`user-group/${groupId}/users`, {
    method: 'put',
    params: {
      userIds,
    },
  });
};

export const updateGroupHeadUser = (groupId: number | string, headerUserId: number | string) => {
  return fetch(`user-group/${groupId}/header`, {
    method: 'put',
    params: {
      headerUserId,
    },
  });
};

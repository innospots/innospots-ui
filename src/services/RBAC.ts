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

export function fetchMenuAuths<T> ():Promise<T> {
  // return dataRequest(`rbac/menu-auth`);
  return fetch(`rbac/menu-permissions`);
};

export const saveMenuAuth = (menuItemRoles: { [key: string]: number[] }) => {
  return fetch('rbac/menu-permissions', {
    data: {
      menuItemRoles,
      roleResourceType: 'MENU',
    },
    method: 'post',
  });
};

export const fetchRoleAuthData = (roleId?: number) => {
  const url = 'rbac/operate-permissions';

  return fetch(roleId ? [url, roleId].join('/') : url);
};

export const saveRoleAuth = (menuItemRoles: { [key: string]: number[] }) => {
  return fetch('rbac/operate-permissions', {
    data: {
      menuItemRoles,
      roleResourceType: 'OPERATION',
    },
    method: 'post',
  });
};

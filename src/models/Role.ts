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

import { useState } from 'react';
import { useRequest } from 'ahooks';

import * as Service from '@/services/Role';

import { ArrayType, ITableData } from '@/common/types/Types';
import { updatePageListData, addPageListData, deletePageListData } from '@/common/utils';

export default () => {
  const [roleData, setRoleData] = useState<ITableData>({});
  const [roleUsers, setRoleUsers] = useState<ArrayType>([]);

  /**
   * 获取列表
   */
  const fetchRolesRequest = useRequest(Service.fetchRoles, {
    manual: true,
    cacheKey: 'RoleList',
    onSuccess: (result: ITableData) => {
      setRoleData(result);
    },
  });

  /**
   * 获取此角色下的用户列表
   */
  const roleUserListRequest = useRequest(Service.fetchRoleUserList, {
    manual: true,
    onSuccess: (result: ArrayType) => {
      setRoleUsers(result);
    },
  });

  /**
   * 添加角色
   */
  const saveRoleRequest = useRequest(Service.saveRole, {
    manual: true,
    onSuccess: (result, [type, data]) => {
      if (result) {
        let listData;
        if (type === 'add') {
          listData = addPageListData(roleData, result);
        } else {
          listData = updatePageListData(roleData, data, 'roleId');
        }

        listData && setRoleData(listData);
      }
    },
  });

  /**
   * 删除角色
   */
  const deleteRoleRequest = useRequest(Service.deleteRole, {
    manual: true,
    onSuccess: (result, [roleId]) => {
      if (result) {
        const listData = deletePageListData(roleData, 'roleId', roleId);
        listData && setRoleData(listData as ITableData);
      }
    },
  });

  /**
   * 将成员移出此角色
   */
  const removeUserFromRole = useRequest(Service.removeUserFromRole, {
    manual: true,
  });

  /**
   * 将成员移出此角色
   */
  const updateMemberOfRoleRequest = useRequest(Service.updateMemberOfRole, {
    manual: true,
  });

  return {
    roleData,
    roleUsers,

    deleteRoleRequest,
    roleUserListRequest,
    removeUserFromRole,

    saveRoleRequest,
    fetchRolesRequest,
    updateMemberOfRoleRequest,
  };
};

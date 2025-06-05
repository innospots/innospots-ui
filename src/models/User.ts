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

import { useState, useMemo } from 'react';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import * as UserService from '@/services/User';
import * as AccountService from '@/services/Account';

import { ITableData } from '@/common/types/Types';
import { updatePageListData, addPageListData, deletePageListData } from '@/common/utils';

function buildTree(data) {
  // 创建一个以 groupId 为键的对象映射，方便查找
  const map = {};
  data.forEach((item) => {
    // 先复制对象并初始化 children 数组
    map[item.groupId] = { ...item, groupId: item.groupId + '', children: [] };
    // 移除 parentGroup 属性以避免重复信息
    delete map[item.groupId].parentGroup;
  });

  // 构建树形结构
  const tree: any[] = [];
  data.forEach((item) => {
    if (!item.parentGroupId) {
      // 如果是根节点，添加到树中
      tree.push(map[item.groupId]);
    } else {
      // 否则找到它的父节点并添加到其 children 数组中
      const parent = map[item.parentGroupId];
      if (parent) {
        parent.children.push(map[item.groupId]);
      }
    }
  });

  return tree;
}

export default () => {
  const [publicKey, setPublicKey] = useState<string>('');
  const [userData, setUserData] = useState<ITableData>({});
  const [userDetail, setUserDetail] = useState<any>({});

  const [userGroups, setUserGroups] = useState<any>([]);
  const [groupUsers, setGroupUsers] = useState<any>([]);
  /**
   * 获取成员列表
   */
  const userRequest = useRequest(UserService.fetchMember, {
    manual: true,
    cacheKey: 'UserList',
    onSuccess: (result) => {
      setUserData(result as ITableData);
    },
  });
  /**
   * 获取成员详情
   */
  const userDetailRequest = useRequest(UserService.fetchMemberDetail, {
    manual: true,
  });

  /**
   * 添加/编辑成员
   */
  const saveUserRequest = useRequest(UserService.saveMember, {
    manual: true,
    onSuccess: (result, [type, postData]) => {
      if (result) {
        let listData;
        if (type === 'add') {
          listData = addPageListData(userData, result);
        } else {
          listData = updatePageListData(userData, postData, 'userId');
        }

        setUserData(listData);
      }
    },
  });

  /**
   * 删除成员
   */
  const deleteUserRequest = useRequest(UserService.deleteMember, {
    manual: true,
    onSuccess: (result, [userId]) => {
      if (result) {
        const listData = deletePageListData(userData, 'userId', userId);
        setUserData(listData as ITableData);
      }
    },
  });

  /**
   * 删除成员
   */
  const changeStatusRequest = useRequest(UserService.changeStatus, {
    manual: true,
    onSuccess: (result, params) => {
      if (result) {
        const index = _.findIndex(userData.list, (item) => item.userId === params[0]);
        if (index > -1) {
          // @ts-ignore
          userData.list[index].status = params[1];
        }

        setUserData({
          ...userData,
        });
      }
    },
  });

  /**
   * 更新密码
   */
  const changePasswordRequest = useRequest(UserService.changePassword, {
    manual: true,
  });

  const groupUsersRequest = useRequest(UserService.fetchGroupUsers, {
    manual: true,
    onSuccess: (result, [groupId]) => {
      if (result) {
        setGroupUsers(result);
      }
    },
  });

  const publicKeyRequest = async () => {
    try {
      const key = await AccountService.fetchPublicKey();
      setPublicKey(key as string);
    } catch (e) {
      console.error(e);
    }
  };

  const userGroupsRequest = useRequest(UserService.fetchUserGroups, {
    manual: true,
    onSuccess: (result) => {
      if (result) {
        setUserGroups(result);
      }
    },
  });

  const saveUserGroupRequest = useRequest(UserService.saveUserGroup, {
    manual: true,
  });

  const deleteUserGroupRequest = useRequest(UserService.deleteUserGroup, {
    manual: true,
  });

  const updateGroupUsersRequest = useRequest(UserService.updateGroupUsers, {
    manual: true,
  });

  const updateGroupHeadUserRequest = useRequest(UserService.updateGroupHeadUser, {
    manual: true,
  });

  const userGroupOptions = useMemo(() => {
    return buildTree(userGroups);
  }, [userGroups]);

  return {
    userData,
    publicKey,
    userDetail,

    userRequest,
    userDetailRequest,
    saveUserRequest,
    publicKeyRequest,
    deleteUserRequest,
    changeStatusRequest,
    changePasswordRequest,

    userGroups,
    groupUsers,
    userGroupOptions,
    groupUsersRequest,
    userGroupsRequest,
    saveUserGroupRequest,
    deleteUserGroupRequest,
    updateGroupUsersRequest,
    updateGroupHeadUserRequest,
  };
};

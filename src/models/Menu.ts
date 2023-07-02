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

import * as Service from '@/services/Menu';
import Module from '@/common/utils/module';

import { ArrayType } from '@/common/types/Types';

export default () => {
  const [menus, setMenus] = useState<ArrayType>([]);
  const [menuItems, setMenuItems] = useState<ArrayType>([]);
  const [allMenuOpts, setAllMenuOpts] = useState<ArrayType>([]);

  const [navigations, setNavigations] = useState<ArrayType>([]);

  const fetchMenuItemsRequest = useRequest(Service.fetchMenuItems, {
    manual: true,
    cacheKey: 'MenuItems',
    onSuccess: (result: ArrayType) => {
      setMenuItems(result);
    },
  });

  /**
   * 获取菜单列表
   */
  const fetchMenusRequest = useRequest(Service.fetchMenus, {
    manual: true,
    cacheKey: 'MenuList',
    onSuccess: (result: ArrayType) => {
      setMenus(result);
    },
  });

  /**
   * 获取左侧导航列表
   */
  const navigationsRequest = useRequest(Service.fetchNavigations, {
    manual: true,
    cacheKey: 'Navigation',
    onSuccess: (result: ArrayType) => {
      setNavigations(result);
    },
  });

  const updateNavigations = (navs: ArrayType) => {
    setNavigations([...navs]);
  };

  const updateAllMenuOpts = (opts: ArrayType) => {
    setAllMenuOpts(opts);
    Module.updateModuleData('permissions', opts);
  };

  const fetchMenuTypesRequest = useRequest(Service.fetchMenuTypes, {
    manual: true,
  });

  const createMenuItemRequest = useRequest(Service.createMenuItem, {
    manual: true,
  });

  const updateMenuItemRequest = useRequest(Service.updateMenuItem, {
    manual: true,
  });

  const deleteMenuRequest = useRequest(Service.deleteMenuItem, {
    manual: true,
  });

  const updateMenuStatusRequest = useRequest(Service.updateMenuStatus, {
    manual: true,
    onSuccess: (result: boolean, [resourceId, status]) => {
      // const index = menus.findIndex((item) => item.resourceId === resourceId);
      // if (index > -1) {
      //   menus[index].status = status;
      //   setMenus([...menus]);
      // }
    },
  });

  return {
    menus,
    menuItems,
    navigations,

    allMenuOpts,
    updateAllMenuOpts,
    updateNavigations,

    fetchMenusRequest,
    deleteMenuRequest,
    navigationsRequest,
    fetchMenuTypesRequest,
    updateMenuItemRequest,
    createMenuItemRequest,
    fetchMenuItemsRequest,
    updateMenuStatusRequest,
  };
};

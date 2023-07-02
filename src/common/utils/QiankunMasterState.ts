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

import _ from 'lodash';

import Module from '@/common/utils/module';
import useModal from '@/common/hooks/useModal';

import { logout, getSessionData } from '@/common/utils';

Module.registerModule('useModal', useModal);

/**
 * 存放所有需要共享的组件
 * 供子应用使用
 */
const COMPONENT_DATA = {};

export const shareComponent = (name: string, component: any) => {
  COMPONENT_DATA[name] = component;
};

const getMasterComponent = (name: string): any => {
  const COMP = COMPONENT_DATA[name];
  if (COMP) {
    return COMP.default || COMP;
  }
  return null;
};

const masterNavigateTo = (page: string, fn: string = 'push') => {
  if (_.isFunction(history[fn])) {
    history[fn](page);
  }
};

const getQiankunMasterState = () => {
  const state = {
    logout,
    Module,
    useModal,
    getSessionData,
    masterNavigateTo,
    getMasterComponent,
  };
  return state;
};

export default getQiankunMasterState;

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

import { HandleType } from '@/common/types/Types';

export function fetchHttpApis<T> (queryCode?: string): Promise<T> {
  return fetch('apps/schema/api', {
    params: {
      queryCode,
    },
  });
};

export const testExecute = (data: any) => {
  return fetch('apps/schema/api/fetch-sample', {
    data,
    method: 'post',
  });
};

export const saveHttpApi = (data: any, type: HandleType) => {
  return fetch('apps/schema/api', {
    data,
    method: type === 'add' ? 'POST' : 'PUT',
  });
};

export const fetchHttpApiDetail = (registryId: number) => {
  return fetch(`apps/schema/api/${registryId}`);
};

export const deleteHttpApi = (registryId: number) => {
  return fetch(`apps/schema/api/${registryId}`, {
    method: 'delete',
  });
};

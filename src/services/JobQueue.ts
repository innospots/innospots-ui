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
import { ITableData, KeyValues } from '@/common/types/Types';

// 分页查询任务队列
export const fetchJobQueuePage = (params?: KeyValues): Promise<ITableData> => {
  return fetch(`schedule/queue/page`, {
    params
  });
};

// 更新任务队列状态
export const updateJobQueueStatus = (jobReadyKey: string, status: string) => {
  return fetch(`schedule/queue/${jobReadyKey}/status`, {
    params: { status },
    method: 'put'
  });
};

// 根据主键查询任务队列
export const fetchJobQueueInfo = (jobReadyKey: string) => {
  return fetch(`schedule/queue/${jobReadyKey}`);
};
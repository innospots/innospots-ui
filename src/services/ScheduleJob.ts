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

// 分页获取调度任务列表
export const fetchScheduleJobPage = (params?: KeyValues): Promise<ITableData> => {
  return fetch(`schedule/job-info/page`, {
    params
  });
};

// 获取调度任务详情
export const fetchScheduleJobInfo = (jobKey: string) => {
  return fetch(`schedule/job-info/${jobKey}`);
};

// 创建调度任务
export const createScheduleJob = (data: any) => {
  return fetch(`schedule/job-info`, {
    data,
    method: 'post'
  });
};

// 更新调度任务
export const updateScheduleJob = (data: any) => {
  return fetch(`schedule/job-info`, {
    data,
    method: 'put'
  });
};

// 更新调度任务状态
export const updateScheduleJobStatus = (jobKey: string, jobStatus: string) => {
  return fetch(`schedule/job-info/${jobKey}/status/${jobStatus}`, {
    method: 'put'
  });
};

// 删除调度任务
export const deleteScheduleJob = (jobKey: string) => {
  return fetch(`schedule/job-info/${jobKey}`, {
    method: 'delete'
  });
};

// 获取调度任务执行详情
export const fetchScheduleJobExecutionDetail = (executionId: string) => {
  return fetch(`schedule/job-execution/${executionId}`);
};

// 执行任务
export const executeJob = (scheduleKey: string, jobParams: Record<string, string>) => {
  return fetch(`schedule/job/execute/${scheduleKey}`, {
    method: 'POST',
    data: {
      ...jobParams
    }
  });
};

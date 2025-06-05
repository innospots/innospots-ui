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

import {fetch} from "@/common/request";

export const fetchTaskInstances = (params?: any) => {
  return fetch(`task-execution/page/task-execution`, {
    params: {
      ...params,
    },
  });
};

export const fetchFlowDetail = (flowExecutionId?: any) => {
  return fetch(`workflow/flow-execution/id/${flowExecutionId}`);
};

export const fetchInstanceDetail = (taskExecutionId?: any) => {
  return fetch(`task-execution/${taskExecutionId}`);
};

export const fetchTaskCode = () => {
  return fetch(`task-execution/task-code`);
};

export const fetchTaskApp = () => {
  return fetch(`task-execution/apps`);
};

export function updateInstanceStatus<T> (taskExecutionId: number, operateType: string): Promise<T> {
  return fetch(`task-execution/${taskExecutionId}/${operateType}`, {
    method: 'put',
  });
};

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

export const fetchTasks = (params?: any) => {
  return fetch(`todo-task/page`, {
    params: {
      ...params,
    },
  });
};

export const fetchTagOptions = () => {
  return fetch(`todo-task/tag`);
};

export const fetchPriorityOptions = () => {
  return fetch(`todo-task/priority`);
};

export function saveTask<T> (type: string, data?: any): Promise<T> {
  return fetch('todo-task', {
    data,
    method: type === 'edit' ? 'put' : 'post',
  });
};

export function deleteTask<T> (taskId: number): Promise<T> {
  return fetch(`todo-task/${taskId}`, {
    method: 'delete',
  });
};

export const fetchTaskDetail = (taskId: number) => {
  return fetch(`todo-task/${taskId}`);
};

export const fetchTaskComment = (taskId: number) => {
  return fetch(`todo-task/comment/${taskId}`);
};

export function saveTaskComment<T> (data?: any): Promise<T> {
  return fetch('todo-task/comment', {
    data,
    method: 'post',
  });
};

export function deleteTaskComment<T> (commentId: number): Promise<T> {
  return fetch(`todo-task/comment/${commentId}`, {
    method: 'delete',
  });
};

export function updateTaskStatus<T> (taskId: number, taskStatus: string): Promise<T> {
  return fetch(`todo-task/${taskId}/status/${taskStatus}`, {
    method: 'put',
  });
};

export function uploadCommentImage<T> (data: any): Promise<T> {
  return fetch(`todo-task/comment/image`, {
    data,
    method: 'post'
  });
};

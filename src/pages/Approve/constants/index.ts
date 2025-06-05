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

export type Status = 'Pending' | 'Canceled' | 'InProgress' | 'Finished';

export const PRIORITY_TYPES = {
  'Severe': {
    text: 'task.main.priority.severe',
    color: '#D9001B',
    bgColor: '#fbe6e9'
  },
  'High': {
    text: 'task.main.priority.high',
    color: '#F59A23',
    bgColor: '#fef5e9'
  },
  'Medium': {
    text: 'task.main.priority.medium',
    color: '#70B603',
    bgColor: '#f1f8e6'
  },
  'Low': {
    text: 'task.main.priority.low',
    color: '#0064D0',
    bgColor: '#e7f0fa'
  },
}

export const STATUS_TYPES = {
  'Pending': {
    text: 'task.main.status.pending',
    color: '#c3c3c3'
  },
  'InProgress': {
    text: 'task.main.status.progress',
    color: '#00b1ff'
  },
  'Finished': {
    text: 'task.main.status.finished',
    color: '#78ba12'
  },
  'Canceled': {
    text: 'task.main.status.canceled',
    color: '#de1f37'
  },
};

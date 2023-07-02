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

import { fetch, dataRequest } from '@/common/request';

export function fetchChannels<T> (): Promise<T> {
  return fetch('notification/channel');
};

export const fetchHttpApiList = () => {
  return dataRequest('http/api');
};

export const fetchMappingList = () => {
  return dataRequest('notification/channel/mapping');
};

export const fetchSettingEvents = () => {
  return dataRequest('notification/setting/events');
};

export const fetchMessageSettingList = () => {
  return dataRequest('notification/setting/list');
};

// 应用停启用
export const changeChannelStatus = (data?: any) => {
  let dataStatus = data.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';

  return fetch(`notification/channel/${data.channelId}/${dataStatus}`, {
    method: 'put',
  });
};

export const saveReceivingSetting = (data?: any) => {
  return fetch('notification/setting', {
    data,
    method: 'post',
  });
};

export const saveChannel = (type: string, data?: any) => {
  return fetch('notification/channel', {
    data,
    method: type === 'edit' ? 'put' : 'post',
  });
};

export const deleteChannel = (id: string) => {
  return fetch(`notification/channel/${id}`, {
    method: 'delete',
  });
};

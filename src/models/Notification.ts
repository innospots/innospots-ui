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

import * as Service from '@/services/Notification';

import { ArrayType } from '@/common/types/Types';
import { updatePageListData, addPageListData, deletePageListData, PageListData } from '@/common/utils';

export default () => {
  // 消息渠道设置
  const [channels, setChannels] = useState<ArrayType>([]);
  const [mappingList, setMappingList] = useState<ArrayType>([]);
  const [httpApiListData, setHttpApiListData] = useState<ArrayType>([]);

  // 消息接收设置
  const [moduleEventList, setModuleEventListData] = useState({});
  const [messageSettingList, setMessageSettingList] = useState<ArrayType>([]);

  const channelsRequest = useRequest(Service.fetchChannels, {
    manual: true,
    cacheKey: 'channelData',
    onSuccess: (result: ArrayType) => {
      setChannels(result);
    },
  });

  const httpApiListRequest = useRequest(Service.fetchHttpApiList, {
    manual: true,
    cacheKey: 'httpApiList',
    onSuccess: (result) => {
      setHttpApiListData(result.body);
    },
  });

  // 获取映射字段下拉数据
  const mappingListRequest = useRequest(Service.fetchMappingList, {
    manual: true,
    cacheKey: 'mappingList',
    onSuccess: (result) => {
      setMappingList(result.body);
    },
  });

  // 获取消息接收设置的事件项
  const settingEventsRequest = useRequest(Service.fetchSettingEvents, {
    manual: true,
    cacheKey: 'moduleEventList',
    onSuccess: (result) => {
      setModuleEventListData(result.body);
    },
  });

  // 获取消息接收设置事件项对应的操作权限
  const messageSettingListRequest = useRequest(Service.fetchMessageSettingList, {
    manual: true,
    cacheKey: 'messageSettingList',
    onSuccess: (result) => {
      setMessageSettingList(result.body);
    },
  });

  const changeChannelStatusRequest = useRequest(Service.changeChannelStatus, {
    manual: true,
    onSuccess: (result, [postData]) => {
      if (result) {
        postData.status = postData.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
        const list = updatePageListData(channels, postData, 'channelId');
        list && setChannels(list as ArrayType);
      }
    },
  });

  /**
   * 保存渠道
   */
  const saveChannelRequest = useRequest(Service.saveChannel, {
    manual: true,
    onSuccess: (result, [type, postData]) => {
      if (result) {
        let list;
        if (type === 'add') {
          list = addPageListData(channels, result);
        } else {
          list = updatePageListData(channels, postData, 'messageChannelId');
        }

        list && setChannels(list);
      }
    },
  });

  /**
   * 修改消息接收设置
   */
  const saveReceivingSettingRequest = useRequest(Service.saveReceivingSetting, {
    manual: true,
  });

  /**
   * 删除渠道
   */
  const deleteChannelRequest = useRequest(Service.deleteChannel, {
    manual: true,
    onSuccess: (result, [messageChannelId]) => {
      if (result) {
        let list = deletePageListData(channels, 'messageChannelId', messageChannelId);
        list && setChannels(list as ArrayType);
      }
    },
  });

  return {
    channels,
    mappingList,
    httpApiListData,
    moduleEventList,
    messageSettingList,

    channelsRequest,
    mappingListRequest,
    saveChannelRequest,
    httpApiListRequest,
    deleteChannelRequest,
    settingEventsRequest,
    messageSettingListRequest,
    changeChannelStatusRequest,
    saveReceivingSettingRequest,
  };
};

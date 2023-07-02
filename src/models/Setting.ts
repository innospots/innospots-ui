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

import { useRequest } from 'ahooks';

import * as Service from '@/services/Setting';
import JSEncrypt from 'jsencrypt';

import { fetchPublicKey } from '@/services/Account';

export default () => {
  const encrypt = (key: string, content: string) => {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(key);
    return encrypt.encrypt(content);
  };

  /**
   * 获取组织信息设置
   */
  const infoConfigsRequest = useRequest(Service.fetchInfoConfigs, {
    manual: true,
  });

  /**
   * 保存组织信息设置
   */
  const saveInfoConfigRequest = useRequest(Service.saveInfoConfig, {
    manual: true,
  });

  /**
   * 获取邮件服务器设置
   */
  const emailConfigsRequest = useRequest(Service.fetchEmailConfigs, {
    manual: true,
  });

  /**
   * 保存邮件服务器设置
   */
  const saveEmailConfig = async (
    data: {
      userName: string;
      password: string;
    },
    onSuccess,
    onFail,
  ) => {
    try {
      const publicKey = (await fetchPublicKey()) as string;
      if (publicKey) {
        const result = await Service.saveEmailConfig({
          ...data,
          userName: data.userName,
          password: encrypt(publicKey, data.password),
        });

        if (result) {
          onSuccess && onSuccess();
        } else {
          onFail && onFail();
        }
      }
    } catch (e) {
      onFail && onFail();
      console.error(e);
    }
  };

  return {
    saveEmailConfig,

    infoConfigsRequest,
    emailConfigsRequest,
    saveInfoConfigRequest,
  };
};

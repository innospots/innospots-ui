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

import { useMemo, useState, useEffect } from 'react';
import { useSetState } from 'ahooks';
import { history } from 'umi';
import * as Base64 from 'js-base64';

import * as Service from '@/services/Account';

import LS from '@/common/utils/LocalStorage';
import { INDEX_PATHNAME } from '@/common/constants';
import { logout as utilLogout, encrypt, setLoginPath, saveSessionData, isRequestSuccess, getQueryParams } from '@/common/utils';

export default () => {
  const [sessionData, setSessionData] = useSetState<any>({});
  const [publicKey, setPublicKey] = useState<string>('');
  const [oauthList, setOauthList] = useState<any[]>([]);

  const queryParams = useMemo(() => getQueryParams(), [window.location.search]);

  const [serverInfo, setServerInfo] = useState<any>({});

  const getServerInfo = async () => {
    try {
      const result: any = await Service.serverInfo();
      if (result && isRequestSuccess(result.code)) {
        const data = result.body || {}
        setServerInfo(data);

        if (data.loginPage) {
          setLoginPath(data.loginPage);
        }

        return Promise.resolve(data)
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loginSuccess = async (data: any) => {
    setSessionData(data);
    saveSessionData(data);

    const signinRedirect = LS.get('signinRedirect');

    if (signinRedirect) {
      LS.remove('signinRedirect');
    }

    let redirect = queryParams?.redirect || signinRedirect || serverInfo.successPage

    if (!redirect) {
      const sd = await getServerInfo()
      redirect = sd.successPage || INDEX_PATHNAME
    }

    history.push(redirect);
  };

  const postLogin = async (data: { username: string; password: string }) => {
    try {
      if (publicKey) {
        const headers = {
          Authorization: ['Basic', Base64.encode([data.username, data.password].join(':'))].join(
            ' ',
          ),
        };
        const result = await Service.postLoginData({
          headers,
          data: {
            ts: new Date().getTime(),
            orgId: 0,
            username: encrypt(publicKey, data.username),
            password: encrypt(publicKey, data.password),
          },
        });

        if (isRequestSuccess(result.code)) {
          loginSuccess(result.body);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getOauthList = async () => {
    try {
      const result: any[] = await Service.fetchOauthList();
      setOauthList(result);
    } catch (e) {
      console.error(e);
    }
  };

  const publicKeyRequest = async () => {
    try {
      const result: string = await Service.fetchPublicKey();
      result && setPublicKey(result);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async (isRedirect: boolean = false) => {
    setSessionData(null);
    saveSessionData({});
    utilLogout(isRedirect, serverInfo.loginPage);
  };

  const oauthLoginRequest = async (data: any) => {
    try {
      const result = await Service.loginByOauth(data);
      if (result && isRequestSuccess(result.code)) {
        loginSuccess(result.body);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return {
    sessionData,
    setSessionData,

    logout,
    postLogin,
    publicKeyRequest,

    oauthList,
    getOauthList,

    serverInfo,
    getServerInfo,

    oauthLoginRequest,
  };
};

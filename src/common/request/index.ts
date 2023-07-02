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

/**
 * https://github.com/umijs/umi-request/blob/master/README_zh-CN.md
 */

import request, { extend, RequestOptionsInit } from 'umi-request';
import { notification } from 'antd';
import _ from 'lodash';
import { history } from 'umi';

import { AJAX_PREFIX } from '@/common/constants';
import { logout } from '@/common/utils';
import { getAuthHeader } from './header';

export const errorMassage = (res: any) => {
  notification.error({
    message: res?.message || '服务端异常, 请联系管理员!',
  });
};

let cancelRequestSourceList: {
  [key: string]: any;
}[] = [];

export const cancelAllRequest = () => {
  _.each(cancelRequestSourceList, (source) => {
    const key = Object.keys(source)[0];
    const controller = cancelRequestSourceList[key];
    try {
      controller.abort();
    } catch (e) {}
  });

  cancelRequestSourceList = [];
};

request.interceptors.request.use((url: string, options: RequestOptionsInit) => {
  // console.log('url', url, options)
  options.headers = {
    ...options.headers,
    ...getAuthHeader(),
  };

  const controller = new AbortController(); // 创建一个控制器
  const { signal } = controller; // 返回一个 AbortSignal 对象实例，它可以用来 with/abort 一个 DOM 请求。
  cancelRequestSourceList.push({
    [url]: controller,
  });

  options.signal = signal;

  return {
    url,
    options,
  };
});

let authTokenError;
request.interceptors.response.use(async (response: any, options: any) => {
  const data = await response.clone().json();
  const dataCode = data.code;
  const isConfig = options.__type === 'config';
  const isSuccess = ['10000'].includes(dataCode);

  if (!isSuccess && !isConfig) {
    if (['60003', '60004'].includes(dataCode)) {
      cancelAllRequest();

      if (!options.ignoreToken) {
        logout(true);
      }
    } else if (dataCode === '70000') {
      cancelAllRequest();
      history.replace('/403');
    } else {
      errorMassage(data);
    }
  } else if (isSuccess && !isConfig) {
    authTokenError = false;
  }

  const fullUrl = options.prefix ? [options.prefix, options.url].join('') : options.url;
  const index = _.findIndex(cancelRequestSourceList, (source) => !!source[fullUrl]);
  if (index > -1) {
    cancelRequestSourceList.splice(index, 1);
  }

  return response;
});

export const dataRequest = extend({
  prefix: `${AJAX_PREFIX}`,
  __type: 'data',
});

export const configRequest = extend({
  prefix: '/data/',
  suffix: '.json',
  __type: 'config',
});

export function fetch<T>(url: string, options?: RequestOptionsInit): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await dataRequest(url, options);
      if (result && result.code === '10000') {
        resolve(result.body);
      } else {
        reject(result?.message);
      }
    } catch (e) {
      reject(e);
    }
  });
};

export default request;

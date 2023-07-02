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

import { history, getLocale } from 'umi';
import _ from 'lodash';
import JSEncrypt from 'jsencrypt';

import LS from './LocalStorage';

import { ITableData, ArrayType } from '@/common/types/Types';
import {SESSION_DATA, RSA_PUBLIC_KEY, AJAX_PREFIX, IS_DEV} from '@/common/constants';

export const formatImagePath = (path: string): string => {
  if (/^data:image\//.test(path)) return path;

  return [AJAX_PREFIX, path.replace(/^\//, '')].join('')
}

export const formatResourcePath = (path: string): string => {
  if (IS_DEV) {
    return ['/resources', path].join('')
  } else {
    return path
  }
}

export const encrypt = (key: string, content: string) => {
  const _encrypt = new JSEncrypt();
  _encrypt.setPublicKey(key);
  return _encrypt.encrypt(content);
};

export const saveRsaPublicKey = (key: string) => {
  LS.set(RSA_PUBLIC_KEY, key);
};

export const getRsaPublicKey = (): string => LS.get(RSA_PUBLIC_KEY);

export const saveSessionData = (sessionData: any) => {
  LS.set(SESSION_DATA, sessionData);
};

export const getSessionData = (): any => {
  return LS.get(SESSION_DATA);
};

export const logout = (isRedirect?) => {
  LS.remove(SESSION_DATA);

  const query = {
    redirect: ''
  };
  if (isRedirect) {
    const { pathname, search } = history.location;
    query.redirect = [ pathname, search ].join('');
  }

  history.replace({
    pathname: '/login',
    query
  });
};

export const getListData = (result: any) => {
  const listData: {
    list?: any[];
    pageData?: any;
  } = {
    list: [],
    pageData: {},
  };
  const data = extractResult(result);
  if (data) {
    if (data instanceof Object && data['body']) {
      listData.list = data['body'];
      listData.pageData = extractPaginationOptions(data);
    } else {
      listData.list = data;
    }
  }
  return listData;
};

export const extractResult = (result: any) => {
  if (result && result.code === '10000') {
    return result.body;
  }
  return null;
};

/**
 * 获取表格分页数据对象
 * @param data
 */
export const extractPaginationOptions = (data: {
  size: number;
  page: number;
  total: number;
  totalPages: number;
}) => {
  if (!data || data.total === null) return null;

  return {
    current: data.page,
    pageSize: data.size,
    total: data.total,
    totalPage: data.totalPages,
  };
};

export const extractIconCode = (code: string) => code?.replace(/^libra\-/, '');

export const formatAntClassName = (className: string) => {
  // if (className) {
  //     const cls = className.split(' ').map((c: string) => c.replace(/^ant/i, ANT_PREFIX));
  //     return cls.join(' ');
  // }
  // return '';
  return className;
};

export const randomString = (len: number = 8): string => {
  let $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const maxPos = $chars.length;
  const result: string[] = [];
  for (let i = 0; i < len; i++) {
    result.push($chars.charAt(Math.floor(Math.random() * maxPos)));
  }

  return result.join('');
};

export const getFormattedLocale = (locale: string = getLocale()) => {
  const ls = locale.split(/\-|\_/);
  return [locale.replace(/-/g, '_'), locale.replace(/_/g, '-'), ls[0], ls[1]];
};

export const formatListData = (dataSource: any[]) =>
  _.map(dataSource, (item) => ({
    __key: randomString(4),
    ...item,
  }));

export type PageListData = ITableData | ArrayType;

export const addPageListData = (dataSource: PageListData, newData: any): boolean | PageListData => {
  if (newData && dataSource) {
    if (_.isArray(dataSource)) {
      dataSource.unshift(newData);
      return [...dataSource];
    } else {
      // if (dataSource?.pagination?.current === dataSource?.pagination?.totalPage) {
        dataSource?.list?.unshift(newData);
      // }

      // @ts-ignore
      dataSource.pagination.total += 1;

      return {
        list: [...(dataSource?.list || [])],
        pagination: {
          ...dataSource.pagination,
        },
      } as PageListData;
    }
  }
  return false;
};

export const updatePageListData = (
  dataSource: PageListData,
  newData: any,
  primaryKey: string,
): PageListData | boolean => {
  if (newData) {
    if (_.isArray(dataSource)) {
      const index = _.findIndex(
        dataSource,
        (item) => _.get(item, primaryKey) == _.get(newData, primaryKey),
      );
      if (index > -1) {
        dataSource[index] = newData;
        return [...dataSource];
      }
    } else if (dataSource) {
      if (!dataSource.list) {
        dataSource.list = [];
      }

      const index = dataSource.list.findIndex(
        (item) => _.get(item, primaryKey) == _.get(newData, primaryKey),
      ) || 0;

      if (index > -1) {
        dataSource.list[index] = newData;
      }

      return {
        list: [...dataSource.list],
        pagination: {
          ...dataSource.pagination,
        },
      } as PageListData;
    }
  }
  return false;
};

export const deletePageListData = (
  dataSource: PageListData,
  primaryKey: string,
  value: string | number,
): PageListData | boolean => {
  if (_.isArray(dataSource)) {
    return _.filter(dataSource, (item) => _.get(item, primaryKey) !== value);
  } else if (dataSource) {
    if (!dataSource.list) {
      dataSource.list = [];
    }

    const index = dataSource.list.findIndex((item) => item[primaryKey] == value);

    if (index > -1) {
      dataSource.list.splice(index, 1);
      if (dataSource.pagination) {
        dataSource.pagination.total -= 1;
      }
    }

    return {
      list: [...dataSource.list],
      pagination: {
        ...dataSource.pagination,
      },
    } as PageListData;
  }
  return false;
};

let utilCanvas;
export const getTextWidth = (
  text: string,
  fontWeight: string = 'normal',
  fontSize: string = '12',
  fontFamily: string = 'SF Pro SC, SF Pro Display, SF Pro Icons, AOS Icons, PingFang SC, Helvetica Neue, Helvetica, Arial, sans-serif',
): number => {
  const canvas = utilCanvas || (utilCanvas = document.createElement('canvas'));
  const measureLayer = canvas.getContext('2d');
  measureLayer.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = measureLayer.measureText(text);
  return Math.ceil(metrics.width);
};

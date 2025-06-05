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
import {SESSION_DATA, RSA_PUBLIC_KEY, AJAX_PREFIX, IS_DEV, LOGIN_PATH} from '@/common/constants';

let loginPath = LOGIN_PATH;

export const isRequestSuccess = (code: string) => {
  return code === '10000' || /0{5}$/.test(code)
}

export const isTokenExpired = (code: string) => {
  return ['60003', '60004'].includes(code) || /(04006|04007)$/.test(code)
}

export const isInvalidUser = (code: string) => {
  return code === '60002' || /04005$/.test(code)
}

export const isPermissionDenied = (code: string) => {
  return code ==='70000' || /04012$/.test(code)
}

export const setLoginPath = (path: string = LOGIN_PATH) => {
  loginPath = path;
}

export const formatImagePath = (path: string, baseUrl?: string): string => {
  if (/^data:image\//.test(path)) return path;

  return [baseUrl || AJAX_PREFIX, (path || '').replace(/^\//, '')].join('')
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

let logoutFlag = false;

export const getSessionData = (): any => {
  return LS.get(SESSION_DATA);
};

export const setLogoutFlag = (flag: boolean): void => {
  logoutFlag = flag;
}

export const logout = (isRedirect: boolean = false, path: string = loginPath) => {
  if (logoutFlag) return;

  logoutFlag = true;

  LS.remove(SESSION_DATA);

  const hash = window.location.hash.replace(/^#/, '');

  if (isRedirect && hash && !['/', '/403'].includes(hash)) {
    const pathname = hash.split('?')[0];
    if (pathname === path) return;
    
    path = path + (path.includes('?') ? '&' : '?') + 'redirect=' + encodeURIComponent(hash);
  }

  history.push(path);
};

export const extractResult = (result: any) => {
  if (result && isRequestSuccess(result.code)) {
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

const getCurrentLocale = () => {
  try {
    return getLocale()
  } catch (error) {
    return localStorage.getItem('umi_locale') || 'zh_CN'
  }
}

export const getFormattedLocale = (locale: string = getCurrentLocale()) => {
  const ls = locale.split(/\-|\_/);
  return [locale.replace(/-/g, '_'), locale.replace(/_/g, '-'), ls[0], ls[1]];
};

export const formatListData = (dataSource: any[]) =>
  _.map(dataSource, (item) => (item.__key ? item : {
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
        dataSource.list[index] = {
          ...dataSource.list[index],
          ...newData
        };
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
  fontFamily: string = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'",
): number => {
  const canvas = utilCanvas || (utilCanvas = document.createElement('canvas'));
  const measureLayer = canvas.getContext('2d');
  measureLayer.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = measureLayer.measureText(text);
  return Math.ceil(metrics.width);
};

// 代替eval的函数
export const parseString = (string, formData) => {
  const func = new Function('formData', '"use strict";return (' + string + ')')
  return func(formData)
}

export const getExpression = ({ source, opt, value }) => {
  const key = `formData.${source.value}`;
  const optValue = opt.value
  const formatValue = (v) => {
    if (_.isString(v)) {
      return `'${v}'`
    } else if (!_.isNil(v) && _.isFunction(v.toString)) {
      return v.toString()
    }

    return v + ''
  };
  const getEqualsExpr = (s = key, v = value) => [s, '==', formatValue(v)];

  let es: any[] = [];
  if (optValue === 'IN') {
    if (_.isArray(value)) {
      return ['(', _.map(value, (v) => getEqualsExpr(key, v).join(' ')).join(' || '), ')'].join('');
    } else {
      es = getEqualsExpr();
    }
  } else if (optValue === 'HASVAL') {
    es = [key, '!= undefined', '&&', key, "!= ''"];
  } else if (optValue === 'NULL') {
    es = [key, '== undefined', '||', key, "== ''"];
  } else if (optValue === 'UNEQUAL') {
    es = [key, '!=', formatValue(value)];
  } else if (optValue === 'true') {
    es = [key, '== true'];
  } else if (optValue === 'false') {
    es = [key, '== false', '||', key, '== undefined'];
  } else {
    es = getEqualsExpr();
  }

  return es.join(' ');
};

export const getRuleExpData = (conditions: any): any => {
  const result = {}
  _.each(conditions, (list, key) => {
    const expr = _.map(list, ({ children, relation }) => {
      const ll: any[] = []
      _.map(children, item => {
        let ci = item
        if (_.isArray(ci)) {
          ci = ci[ci.length - 1]
        }
        if (ci?.source?.value) {
          ll.push(`${getExpression(ci)}`)
        }
      })
      return ll.join(relation === 'OR' ? ' || ' : ' && ')
    })
    if (expr.length && !!expr[0]) {
      result[key] = `(${expr.join(') || (')})`
    }
  })

  return result
}

export const jsonToUrlParams = (json: Record<string, any>): string => {
  const params: string[] = [];

  Object.entries(json).forEach(([key, value]) => {
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(value);
    params.push(`${encodedKey}=${encodedValue}`);
  });

  return params.join('&');
}

export const getQueryParams = (): Record<string, any> => {
  const searchParams = new URLSearchParams(window.location.search);
  const queryParams: Record<string, any> = {};

  for (const [key, value] of searchParams.entries()) {
    queryParams[decodeURIComponent(key)] = decodeURIComponent(value);
  }

  return queryParams;
};


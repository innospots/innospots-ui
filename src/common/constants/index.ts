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

import { IListQueryParams } from '@/common/types/Types';

export const BASE_URL = '/';
export const AJAX_PREFIX = BASE_URL + 'innospots/api/';

export const SESSION_DATA = 'SESSION_DATA';
export const RSA_PUBLIC_KEY = 'RSA_PUBLIC_KEY';

export const UPLOAD_IMAGE_PATH = AJAX_PREFIX + 'sys-config/image';
export const UPLOAD_AVATAR_PATH = AJAX_PREFIX + 'user/avatar';

export const IS_DEV = process.env.NODE_ENV !== 'production';

// export const INDEX_PATHNAME = '/apps/visualization/workspace';
export const INDEX_PATHNAME = '/app';

export const DEFAULT_PAGINATION_SETTINGS: IListQueryParams = {
  page: 1,
  size: 20,
  asc: false,
  sort: 'createdTime',
  paging: true,
};

/**
 * 匹配中英文及数字
 */
export const NAME_PATTERN = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;

export const DEFAULT_LIST_QUERY = DEFAULT_PAGINATION_SETTINGS;

/**
 * 菜单类型
 */
export const MENU_TYPES = [
  {
    value: 'MENU',
    label: '应用',
    icon: 'grid',
  },
  {
    value: 'CATEGORY',
    label: '目录',
    icon: 'list',
  },
  {
    value: 'LINK',
    label: '链接',
    icon: 'shujulianjie',
  },
];

/**
 * 页面打开方式
 */
export const HREF_TARGET = [
  {
    value: 'INTERNAL',
    label: '内页',
  },
  {
    value: 'NEW_PAGE',
    label: '新窗口',
  },
];

export const VARIABLE_TYPES = [
  {
    value: 'STRING',
    label: '字符',
  },
  {
    value: 'NUMERIC',
    label: '数值',
  },
  {
    value: 'DATE',
    label: '日期',
  },
  {
    value: 'FRAGMENT',
    label: '表达式',
  },
];

export const VARIABLE_TYPES2 = ['STRING', 'INTEGER', 'BOOLEAN', 'LONG', 'DATE', 'DATE_TIME', 'DOUBLE', 'CURRENCY'];

/**
 * 数据类型
 * @type {string[]}
 */
export const DATA_TYPES = ['INTEGER', 'LONG', 'STRING', 'TIMESTAMP', 'DATE'];

/**
 * 不需要值的操作类型
 * @type {[*]}
 */
export const EMPTY_VALUE_TYPES = ['NULL', 'NOTNULL', 'HASVAL', 'NOHASVAL'];

/**
 * 操作符列表
 * GREATER(">",">","greater than"),
 GREATER_EQUAL(">=",">=","greater than or equal to"),
 LESS_EQUAL("<=","<=","less than or equal to"),
 LESS("<","<","less than"),
 EQUAL("=","==","equal"),
 IN("in","in","match in set"),
 UNEQUAL("!=","!=","not equal"),
 LIKE("like","like","wildcard match"),
 BETWEEN("between","between","two value range scope");
 * @type {[*]}
 */
export const OPERATORS = [
  {
    label: '等于',
    value: 'EQUAL',
    statement: '${field} == ${value}',
    valueTypes: [
      'NUMBER',
      'INTEGER',
      'CURRENCY',
      'LONG',
      'INTEGER',
      'DOUBLE',
      'STRING',
      'TIME',
      'DATE',
      'DATE_TIME',
      'TIMESTAMP',
    ],
  },
  {
    label: '大于',
    value: 'GREATER',
    statement: '${field} > ${value}',
    valueTypes: ['NUMBER', 'INTEGER', 'CURRENCY', 'LONG', 'INTEGER', 'DOUBLE', 'TIME', 'DATE_TIME', 'DATE', 'TIMESTAMP'],
  },
  {
    label: '大于等于',
    value: 'GREATER_EQUAL',
    statement: '${field} >= ${value}',
    valueTypes: ['NUMBER', 'INTEGER', 'CURRENCY', 'LONG', 'INTEGER', 'DOUBLE', 'TIME', 'DATE_TIME', 'DATE', 'TIMESTAMP'],
  },
  {
    label: '小于',
    value: 'LESS',
    statement: '${field} < ${value}',
    valueTypes: ['NUMBER', 'INTEGER', 'CURRENCY', 'LONG', 'INTEGER', 'DOUBLE', 'TIME', 'DATE_TIME', 'DATE', 'TIMESTAMP'],
  },
  {
    label: '小于等于',
    value: 'LESS_EQUAL',
    statement: '${field} <= ${value}',
    valueTypes: ['NUMBER', 'INTEGER', 'CURRENCY', 'LONG', 'INTEGER', 'DOUBLE', 'TIME', 'DATE_TIME', 'DATE', 'TIMESTAMP'],
  },
  {
    label: '不等于',
    value: 'UNEQUAL',
    statement: '${field} != ${value}',
    valueTypes: [
      'NUMBER',
      'INTEGER',
      'CURRENCY',
      'LONG',
      'INTEGER',
      'DOUBLE',
      'STRING',
      'DATE',
      'TIME', 'DATE_TIME',
      'TIMESTAMP',
    ],
  },
  {
    label: '介于',
    value: 'BETWEEN',
    statement: 'between ${v1} and ${v2}',
    valueTypes: ['NUMBER', 'INTEGER', 'CURRENCY', 'LONG', 'INTEGER', 'DOUBLE', 'TIME', 'DATE_TIME', 'DATE', 'TIMESTAMP'],
  },
  {
    label: '有值',
    value: 'HASVAL',
    statement: '${field} HASVAL',
    valueTypes: 'ALL',
  },
  {
    label: '没值',
    value: 'NOHASVAL',
    statement: '${field} NOHASVAL',
    valueTypes: 'ALL',
  },
  // {
  //     label: '空',
  //     value: 'NULL',
  //     statement: '${field} is NULL',
  //     valueTypes: 'ALL',
  // },
  // {
  //     label: '不为空',
  //     value: 'NOTNULL',
  //     statement: '${field} is NOTNULL',
  //     valueTypes: 'ALL',
  // },
  {
    label: '包含',
    value: 'IN',
    statement: '${field} IN ${value}',
    valueTypes: ['NUMBER', 'LONG', 'INTEGER', 'DOUBLE', 'STRING', 'TAG', 'TIME', 'DATE_TIME', 'DATE', 'TIMESTAMP'],
  },
  {
    label: '不包含',
    value: 'NOT_IN',
    statement: '${field} NOT IN ${value}',
    valueTypes: ['NUMBER', 'LONG', 'INTEGER', 'DOUBLE', 'STRING', 'TAG', 'TIME', 'DATE_TIME', 'DATE', 'TIMESTAMP'],
  },
];

export const WEEKDAY = {
  zh: ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  en: ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

/**
 * 匹配中英文及数字
 */
export const NAME_VALID_REGEX = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;

export const LOCAL_DATA_KEY = 'INNOSPOT_DATA';

export const PAGE_TITLE_SUFFIX = 'Innospots';

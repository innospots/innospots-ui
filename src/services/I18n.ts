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
import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

export function fetchLocales<T> (): Promise<T> {
  return fetch('i18n/locale/list');
};

export function fetchLanguageList<T> (data?: any): Promise<T> {
  return fetch('i18n/language/list', {
    params: {
      ...data,
    },
  });
};

export function localeSwitch<T> (locale?: any): Promise<T> {
  return fetch('i18n/locale/switch', {
    params: {
      locale,
    },
  });
};

export const fetchLocaleModule = (localeCode: string, module: string) => {
  return fetch(`i18n/locale/${localeCode}/${module}.json`);
};

export function fetchLanguages<T> (data?: any): Promise<T> {
  return fetch('i18n/language/page', {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  });
};

export const saveLanguage = (type: string, data?: any) => {
  return fetch('i18n/language', {
    data,
    method: type === 'edit' ? 'put' : 'post',
  });
};

export function deleteLanguage<T> (id: number): Promise<T> {
  return fetch(`i18n/language/${id}`, {
    method: 'delete',
  });
};

export const getAppList = () => {
  return dataRequest('i18n/dictionary/list-app');
};

export const getAppModuleList = (app?: string) => {
  return dataRequest(`i18n/dictionary/list-module/app/${app}`);
};

export const getTransHeaderColumn = () => {
  return dataRequest('i18n/translation/header-column');
};

export function fetchTranslation<T> (data?: any): Promise<T> {
  return fetch('i18n/translation/page', {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  });
};

export function saveTrans<T> (data?: any): Promise<T> {
  return fetch('i18n/translation/message', {
    data,
    method: 'put',
  });
};

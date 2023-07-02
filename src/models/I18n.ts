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

import * as Service from '@/services/I18n';

import {
  extractResult,
  updatePageListData,
  addPageListData,
  deletePageListData,
} from '@/common/utils';

import { ArrayType, ITableData } from '@/common/types/Types';

export default () => {
  const [appList, setAppList] = useState([]);
  const [locales, setLocales] = useState<any[]>([]);
  const [languageList, setLanguageList] = useState<any[]>([]);
  const [appModuleList, setAppModuleList] = useState([]);
  const [translationHeaderColumn, setTranslationHeaderColumn] = useState([]);

  // 翻译列表数据
  const [translationData, setTranslationData] = useState<ITableData>({
    list: [],
    pagination: {
      total: 0,
      current: 0,
      pageSize: 0,
      totalPage: 0,
      },
  });

  // 语言列表数据
  const [languageData, setLanguageData] = useState<ITableData>({});

  /**
   * 获取应用字典
   */
  const appListRequest = useRequest(Service.getAppList, {
    manual: true,
    cacheKey: 'AppList',
    onSuccess: (result) => {
      setAppList(extractResult(result));
    },
  });

  /**
   * 获取模块字典
   */
  const appModuleListRequest = useRequest(Service.getAppModuleList, {
    manual: true,
    cacheKey: 'AppModuleList',
    onSuccess: (result) => {
      setAppModuleList(extractResult(result));
    },
  });

  /**
   * 获取翻译列表表头
   */
  const translationHeaderColumnRequest = useRequest(Service.getTransHeaderColumn, {
    manual: true,
    cacheKey: 'TransHeaderColumn',
    onSuccess: (result) => {
      setTranslationHeaderColumn(extractResult(result));
    },
  });

  /**
   * 翻译列表数据
   */
  const translationRequest = useRequest(Service.fetchTranslation, {
    manual: true,
    cacheKey: 'TranslationData',
    onSuccess: (result: ITableData) => {
      setTranslationData(result);
    },
  });

  /**
   * 编辑翻译
   */
  const saveTransRequest = useRequest(Service.saveTrans, {
    manual: true,
    onSuccess: (result: boolean, [data]) => {
      if (result) {
        const listData = updatePageListData(translationData, data, 'dictionary.dictionaryId');
        if (listData) {
          setTranslationData(listData as ITableData);
        }
      }
    },
  });

  const fetchLocalesRequest = useRequest(Service.fetchLocales, {
    manual: true,
    onSuccess: (result: any[]) => {
      setLocales(result);
    },
  });

  const getLanguageList = useRequest(Service.fetchLanguageList, {
    manual: true,
    onSuccess: (result: any[]) => {
      setLanguageList(result);
    },
  });

  /**
   * 获取语言列表
   */
  const fetchLanguagesRequest = useRequest(Service.fetchLanguages, {
    manual: true,
    cacheKey: 'LanguageList',
    onSuccess: (result: ITableData) => {
      setLanguageData(result);
    },
  });

  /**
   * 添加/编辑语言
   */
  const saveLanguageRequest = useRequest(Service.saveLanguage, {
    manual: true,
    onSuccess: (result, [type, data]) => {
      if (result) {
        let listData;

        if (type === 'add') {
          listData = addPageListData(languageData, result);
        } else {
          listData = updatePageListData(languageData, data, 'languageId');
        }

        if (listData) {
          setLanguageData(listData);
        }
      }
    },
  });

  /**
   * 删除语言
   */
  const deleteLanguageRequest = useRequest(Service.deleteLanguage, {
    manual: true,
    onSuccess: (result: boolean, [languageId]) => {
      if (result) {
        const listData = deletePageListData(languageData, 'languageId', languageId);
        if (listData) {
          setLanguageData(listData as ITableData);
        }
      }
    },
  });

  return {
    locales,

    appList,
    languageList,
    languageData,
    appModuleList,
    translationData,
    translationHeaderColumn,

    appListRequest,
    getLanguageList,
    translationRequest,
    appModuleListRequest,
    translationHeaderColumnRequest,

    saveTransRequest,
    saveLanguageRequest,
    fetchLocalesRequest,
    deleteLanguageRequest,
    fetchLanguagesRequest,
  };
};

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

import * as Service from '@/services/Currency';

import { addPageListData, updatePageListData, deletePageListData } from '@/common/utils';
import { ArrayType, ITableData } from '@/common/types/Types';

export default () => {
  const [currencies, setCurrencies] = useState<ArrayType>([]);
  const [currencyData, setCurrencyData] = useState<ITableData>({});

  /**
   * 获取货币集合
   */
  const fetchCurrenciesRequest = useRequest(Service.fetchCurrencies, {
    manual: true,
    onSuccess: (result: ArrayType) => {
      setCurrencies(result);
    },
  });

  /**
   * 获取货币列表
   */
  const fetchCurrencyDataRequest = useRequest(Service.fetchCurrencyData, {
    manual: true,
    cacheKey: 'CurrencyList',
    onSuccess: (result: ITableData) => {
      setCurrencyData(result);
    },
  });

  /**
   * 添加/编辑货币
   */
  const saveCurrencyRequest = useRequest(Service.saveCurrency, {
    manual: true,
    onSuccess: (result, [type, data]) => {
      let newCurrencyData;

      if (result) {
        if (type === 'edit') {
          newCurrencyData = updatePageListData(currencyData, data, 'currencyId');
        } else {
          newCurrencyData = addPageListData(currencyData, result);
        }

        if (newCurrencyData) {
          setCurrencyData(newCurrencyData);
        }
      }
    },
  });

  /**
   * 删除货币
   */
  const deleteCurrencyRequest = useRequest(Service.deleteCurrency, {
    manual: true,
    onSuccess: (result, [currencyId]) => {
      let newCurrencyData;

      if (result) {
        newCurrencyData = deletePageListData(currencyData, 'currencyId', currencyId);

        if (newCurrencyData) {
          setCurrencyData(newCurrencyData);
        }
      }
    },
  });

  return {
    currencies,
    currencyData,

    saveCurrencyRequest,
    deleteCurrencyRequest,
    fetchCurrenciesRequest,
    fetchCurrencyDataRequest,
  };
};

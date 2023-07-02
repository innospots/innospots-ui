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

import _ from 'lodash';

import * as Service from '@/services/Preview';

export default () => {
    const [strategyDetail, setStrategyDetail] = useState<any>({});
    const [changeRecordList, setChangeRecordList] = useState<any>([]);
    const [resultCodeList, setResultCodeList] = useState<any>([]);
    const [executionRecordData, setExecutionRecordData] = useState<any>({});
    const [strategyStatisticData, setStrategyStatisticData] = useState<any>({});

    /**
     * 获取详情码数据
     */
    const fetchResultCodeRequest = useRequest(Service.fetchResultCode, {
        manual: true,
        cacheKey: 'ResultCodeList',
        onSuccess: (result) => {
            if (result && result.code === '10000') {
                setResultCodeList(result.body);
            } else {
                setResultCodeList([]);
            }
        },
    });

    /**
     * 获取策略详情
     */
    const fetchStrategyDetailRequest = useRequest(Service.fetchStrategyDetail, {
        manual: true,
        cacheKey: 'StrategyDetailData',
        onSuccess: (result) => {
            if (result && result.code === '10000') {
                setStrategyDetail(result.body);
            } else {
                setStrategyDetail({});
            }
        },
    });

    /**
     * 获取策略统计数据
     */
    const fetchStrategyStatisticRequest = useRequest(Service.fetchStrategyStatisticData, {
        manual: true,
        cacheKey: 'StrategyStatisticData',
        onSuccess: (result) => {
            if (result && result.code === '10000') {
                setStrategyStatisticData(result.body);
            } else {
                setStrategyStatisticData({});
            }
        },
    });

    /**
     * 获取策略统计数据
     */
    const fetchChangeRecordRequest = useRequest(Service.fetchChangeRecordList, {
        manual: true,
        cacheKey: 'ChangeRecordList',
        onSuccess: (result) => {
            if (result && result.code === '10000') {
                setChangeRecordList(result.body?.list);
            } else {
                setChangeRecordList([]);
            }
        },
    });

    /**
     * 获取执行记录数据
     */
    const fetchExecutionRecordRequest = useRequest(Service.fetchExecutionRecord, {
        manual: true,
        cacheKey: 'ExecutionRecordData',
        onSuccess: (result) => {
            if (result && result.code === '10000') {
                setExecutionRecordData(result.body);
            } else {
                setExecutionRecordData({});
            }
        },
    });

    return {
        strategyDetail,
        resultCodeList,
        changeRecordList,
        executionRecordData,
        strategyStatisticData,

        fetchResultCodeRequest,
        fetchStrategyDetailRequest,
        fetchChangeRecordRequest,
        fetchExecutionRecordRequest,
        fetchStrategyStatisticRequest,
    };
};

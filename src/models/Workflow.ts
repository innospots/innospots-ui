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

import { useState, useMemo } from 'react';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import * as Service from '@/services/Workflow';
import type { Categories, ITableData, KeyValues } from '@/common/types/Types';
import { addPageListData, updatePageListData, deletePageListData } from '@/common/utils';

export default () => {
    const [workflow, setWorkflow] = useState<KeyValues>({});
    const [categories, setCategories] = useState<Categories>([]);
    const [webhookAddress, setWebhookAddress] = useState<KeyValues>({});
    const [workflowTemplates, setWorkflowTemplates] = useState<KeyValues>([]);

    const [workflows, setWorkflows] = useState<ITableData>({
        list: [],
        pagination: {},
    });

    const categoryOptions = useMemo(
        () =>
            _.map(categories, (item) => ({
                value: item.categoryId,
                label: item.categoryName,
            })),
        [categories],
    );

    const fetchWorkflowTemplatesRequest = useRequest(Service.fetchWorkflowTemplates, {
        manual: true,
        onSuccess: (result) => {
            setWorkflowTemplates(result);
        },
    });

    /**
     * 获取分类列表
     */
    const fetchCategoriesRequest = useRequest(Service.fetchCategories, {
        manual: true,
        cacheKey: 'StrategyCategoryList',
        onSuccess: (result) => {
            setCategories(result);
        },
    });

    /**
     * 获取策略列表
     */
    const fetchWorkflowsRequest = useRequest(Service.fetchWorkflows, {
        manual: true,
        debounceWait: 300,
        onSuccess: (result) => {
            setWorkflows(result);
        },
    });

    /**
     * 获取策略列表
     */
    const fetchWorkflowRequest = useRequest(Service.fetchWorkflow, {
        manual: true,
        onSuccess: (result) => {
            setWorkflow(result || {});
        },
    });

    const saveCategoryRequest = useRequest(Service.saveCategory, {
        manual: true,
        onSuccess: (result, [type, data]) => {
            if (result) {
                let list;
                if (type === 'add') {
                    list = addPageListData(categories, result);
                } else {
                    list = updatePageListData(categories, data, 'categoryId');
                }

                if (list) {
                    setCategories(list);
                }
            }
        },
    });

    const updateStatusRequest = useRequest(Service.updateStatus, {
        manual: true,
    });

    const saveWorkflowRequest = useRequest(Service.saveWorkflow, {
        manual: true,
        onSuccess: (result, [type, data]) => {
            if (result) {
            }
        },
    });

    const fetchWebhookAddressRequest = useRequest(Service.fetchWebhookAddress, {
        manual: true,
        onSuccess: (result) => {
            if (result) {
                setWebhookAddress(result);
            }
        },
    });

    const deleteWorkflowRequest = useRequest(Service.deleteWorkflow, {
        manual: true,
    });

    const deleteCategoryRequest = useRequest(Service.deleteCategory, {
        manual: true,
        onSuccess: (result, [categoryId]) => {
            if (result) {
                const list = deletePageListData(categories, 'categoryId', categoryId);
                if (list) {
                    setCategories(list);
                }
            }
        },
    });

    return {
        workflow,
        workflows,
        categories,
        categoryOptions,
        workflowTemplates,

        webhookAddress,

        setWorkflow,
        updateStatusRequest,

        fetchWorkflowRequest,
        deleteWorkflowRequest,
        fetchWorkflowsRequest,

        saveCategoryRequest,
        saveWorkflowRequest,
        deleteCategoryRequest,
        fetchCategoriesRequest,

        fetchWebhookAddressRequest,
        fetchWorkflowTemplatesRequest,
    };
};

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

import * as Service from '@/services/Dataset';

import { Categories, ICategoryItem, ITableData } from '@/common/types/Types';
import { addPageListData, deletePageListData, updatePageListData } from '@/common/utils';

export default () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [categories, setCategories] = useState<Categories>([]);
  const [dataset, setDataset] = useState<ITableData>({
    list: [],
    pagination: {
      total: 0,
      current: 0,
      pageSize: 0,
      totalPage: 0,
    },
  });

  const dataFieldsRequest = useRequest(Service.fetchDataFields, {
    manual: true,
  });

  const datasetPreviewRequest = useRequest(Service.fetchDatasetPreview, {
    manual: true,
  });

  const fetchSchemaRegistriesRequest = useRequest(Service.fetchSchemaRegistries, {
    manual: true,
  });

  const updateCategoryCount = (categoryId: number, count: number) => {
    const category = _.find(categories, (item) => item.categoryId == categoryId);
    if (category) {
      category.totalCount += count;
      setCategories([...categories]);
    }
  };

  const categoryRequest = useRequest<any, Categories>(Service.fetchCategories, {
    manual: true,
    cacheKey: 'CategoryList',
    onSuccess: (result) => {
      setCategories(result);
    },
  });

  const datasetRequest = useRequest<any, any[]>(Service.fetchDataset, {
    manual: true,
    cacheKey: 'DatasetPage',
    onSuccess: (result: ITableData, []) => {
      setDataset(result);
    },
  });

  const datasetListRequest = useRequest<any, any[]>(Service.fetchDatasetList, {
    manual: true,
    cacheKey: 'DatasetList',
  });

  const createCategoryRequest = useRequest<ICategoryItem, any[]>(Service.createCategory, {
    manual: true,
    onSuccess: (result) => {
      if (result) {
        categories.push(result);
        setCategories([...categories]);
      }
    },
  });

  const updateCategoryRequest = useRequest(Service.updateCategory, {
    manual: true,
    onSuccess: (result, [categoryId, categoryName]) => {
      if (result) {
        const index = _.findIndex(categories, (item) => item.categoryId === categoryId);
        if (index > -1) {
          categories[index].categoryName = categoryName;
        }
        setCategories([...categories]);
      }
    },
  });

  const saveDatasetRequest = useRequest<any, any[]>(Service.saveDataset, {
    manual: true,
    onSuccess: (result: ICategoryItem, [data, type]) => {
      if (result) {
        let newData;
        if (type === 'add') {
          if (selectedCategoryId === result.categoryId || result.categoryId === 0) {
            newData = addPageListData(dataset, result);
          }
          updateCategoryCount(result.categoryId, 1);
        } else {
          newData = updatePageListData(dataset, data, 'id');
        }
        if (newData) {
          setDataset(newData as ITableData);
        }
      }
    },
  });

  const deleteCategoryRequest = useRequest(Service.deleteCategory, {
    manual: true,
    onSuccess: (result, [categoryId]) => {
      if (result) {
        setCategories(_.filter(categories, (item) => item.categoryId !== categoryId));
      }
    },
  });

  const deleteDatasetRequest = useRequest(Service.deleteDataset, {
    manual: true,
    onSuccess: (result, [id]) => {
      if (result) {
        const index = dataset.list?.findIndex((item) => item.id === id) as number;

        if (index > -1) {
          const dataView = dataset.list?.[index];
          const newData = deletePageListData(dataset, 'id', id);

          newData && setDataset(newData as ITableData);

          updateCategoryCount(dataView.categoryId, -1);
        }
      }
    },
  });

  const datasetExecuteRequest = useRequest(Service.datasetExecute, {
    manual: true,
  });

  return {
    dataset,
    categories,

    selectedCategoryId,
    setSelectedCategoryId,

    datasetRequest,
    datasetListRequest,
    saveDatasetRequest,
    deleteDatasetRequest,

    categoryRequest,
    deleteCategoryRequest,
    updateCategoryRequest,
    createCategoryRequest,

    dataFieldsRequest,
    datasetPreviewRequest,

    datasetExecuteRequest,
    fetchSchemaRegistriesRequest,
  };
};

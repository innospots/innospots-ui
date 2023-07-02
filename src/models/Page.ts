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
import _ from 'lodash';

import { useRequest } from 'ahooks';

import * as Service from '@/services/Page';
import { deletePageListData } from '@/common/utils';

import { ICategoryItem, Categories, ITableData } from '@/common/types/Types';

export default () => {
  const [pageData, setPageData] = useState<ITableData>({});
  const [pageDetailData, setPageDetailData] = useState<any>({});
  const [categories, setCategories] = useState<Categories>([]);

  const loadWorkspace = useRequest(Service.getWorkspaceInfo, {
    manual: true,
  });
  /**
   * 添加页面
   */
  const savePage = useRequest(Service.savePage, {
    manual: true,
    onSuccess: (result, params) => {
      console.log(result, params, 'savePage,result,params');
    },
  });

  const categoryRequest = useRequest(Service.fetchPageCategories, {
    manual: true,
    onSuccess: (result: Categories) => {
      setCategories(result);
    },
  });

  const pageDetailRequest = useRequest(Service.fetchPageDetail, {
    manual: true,
    onSuccess: (result: Categories) => {
      setPageDetailData(result);
    },
  });

  const pagesRequest = useRequest(Service.fetchPages, {
    manual: true,
    onSuccess: (result: ITableData) => {
      setPageData(result);
    },
  });

  const pageRecycleRequest = useRequest(Service.pageRecycle, {
    manual: true,
  });

  const updateStatusRequest = useRequest(Service.updatePageStatus, {
    manual: true,
    onSuccess: (result: boolean, [pageId, status]) => {
      if (result) {
        const page = _.find(pageData.list, (item) => item.id === pageId);
        if (page) {
          page.status = status;
        }
        setPageData({
          ...pageData,
        });
      }
    },
  });

  const deletePageRequest = useRequest(Service.deletePage, {
    manual: true,
    onSuccess: (result: boolean, [pageId]) => {
      if (result) {
        const index = pageData.list?.findIndex((item) => item.id === pageId) as number;

        if (index > -1) {
          const page = pageData.list?.[index];
          const listData = deletePageListData(pageData, 'id', pageId);
          setPageData(listData as ITableData);

          updateCategoryCount(page?.categoryId, -1);
        }
      }
    },
  });

  const createCategoryRequest = useRequest(Service.createPageCategory, {
    manual: true,
    onSuccess: (result: ICategoryItem) => {
      if (result) {
        categories.splice(categories.length-1,0, result);
        setCategories([...categories]);
      }
    },
  });

  const updateCategoryRequest = useRequest(Service.updatePageCategory, {
    manual: true,
    onSuccess: (result: boolean, [categoryId, categoryName]) => {
      if (result) {
        const index = _.findIndex(categories, (item) => item.categoryId === categoryId);
        if (index > -1) {
          categories[index].categoryName = categoryName;
        }
        setCategories([...categories]);
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

  const updateCategoryCount = (categoryId: number, count: number) => {
    const category = _.find(categories, (item) => item.categoryId == categoryId);
    if (category) {
      category.totalCount += count;
      setCategories([...categories]);
    }
  };

  return {
    pageData,
    categories,
    pageDetailData,

    loadWorkspace,
    savePage,

    pagesRequest,
    categoryRequest,
    pageDetailRequest,
    deletePageRequest,
    pageRecycleRequest,
    updateStatusRequest,
    deleteCategoryRequest,
    createCategoryRequest,
    updateCategoryRequest,
  };
};

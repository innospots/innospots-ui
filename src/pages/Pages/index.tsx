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

import React, { useState, useEffect, useMemo } from 'react';

import { useModel } from 'umi';

import { useSetState } from 'ahooks';

import _ from 'lodash';
import { useHistory } from 'react-router';
import { Row, Col, message, TableColumnsType } from 'antd';
import { RedoOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import IconButton from '@/components/IconButton';
import PageHelmet from '@/components/PageHelmet';
import PageLoading from '@/components/PageLoading';
import StatusTag, { Status } from '@/components/StatusTag';
import CategoriesPane, { CategorySelector } from '@/components/CategoriesPane';

import PageCategoryModal, { MODAL_NAME } from './components/PageCategoryModal';

import styles from './style.less';

const DEFAULT_PAGE_DATA = {
  page: 1,
  size: 20,
};

const Page: React.FC<any> = ({ location }) => {
  const history = useHistory();

  const { t, loading } = useI18n(['page', 'common']);

  const categoryPermissions = useMemo(
    () => ({
      create: 'PageCategory-createCategory',
      update: 'PageCategory-updateCategory',
      delete: 'PageCategory-deleteCategory',
    }),
    [],
  );

  const {
    pageData,
    categories,
    pagesRequest,
    categoryRequest,
    deletePageRequest,
    pageRecycleRequest,
    updateStatusRequest,
    deleteCategoryRequest,
  } = useModel('Page');

  const [categoryCollapsed, setCategoryCollapsed] = useState(false);

  const [categoryModal] = useModal(MODAL_NAME);

  const [queryData, setQueryData] = useSetState({
    queryCode: '',
    ...DEFAULT_PAGE_DATA,
  });

  const {
    page: curPage = 1,
    size: curSize = 20,
    queryCode = '',
    category: curCategoryId = 0
  } = {
    ...DEFAULT_PAGE_DATA,
    ...location.query
  };

  useEffect(() => {
    categoryRequest.run();
  }, []);

  useEffect(() => {
    setQueryData({
      ...queryData,
      queryCode,
      page: curPage,
      size: curSize,
    })
  }, [ curPage, curSize, queryCode ]);


  useEffect(() => {
    getPageList();
  }, [curCategoryId, queryData]);

  const getPageList = () => {
    pagesRequest.run({
      ...queryData,
      categoryId: curCategoryId,
    });
  };

  const deletePage = async (id: number) => {
    const result = await deletePageRequest.runAsync(id);

    if (result) {
      message.success(t('common.error_message.delete.success'));
    }
  };

  const deleteCategory = async (categoryId: number) => {
    const result = await deleteCategoryRequest.runAsync(categoryId);

    if (result) {
      message.success(t('common.error_message.delete.success'));
    }
  };

  const onCategoryClicked = (categoryId) => {
    setQueryData({
      queryCode: '',
      ...DEFAULT_PAGE_DATA,
    });
    history.push(`/pages?category=${categoryId}`);
  };

  const changeStatus = async (id: number, status: string) => {
    const result = await updateStatusRequest.runAsync(id, status);
    if (result) {
      message.success(t('common.error_message.save.success'));
    }
  };

  const pageRecycle = async (id: number) => {
    const result = await pageRecycleRequest.runAsync(id);
    if (result) {
      message.success(t('common.error_message.save.success'));
      categoryRequest.run();
      getPageList()
    }
  };

  const onListPageChange = (page: number, size: number) => {
    /*setQueryData({
      ...queryData,
      page,
      size
    })*/
    history.push(`/pages?category=${curCategoryId}&page=${page}&size=${size}`);
  };

  const onPageSearch = (queryCode: string) => {
    /*setQueryData({
      ...queryData,
      queryCode
    })*/
    history.push(`/pages?category=${curCategoryId}&queryCode=${queryCode}`);
  };

  const renderCategoriesPanel = () => {
    return (
      <CategoriesPane
        title={t('page.category.title')}
        categories={categories}
        categoryId={curCategoryId}
        loading={categoryRequest.loading}
        permissions={categoryPermissions}
        onToggle={setCategoryCollapsed}
        onSelected={onCategoryClicked}
        onCreate={() => categoryModal.show()}
        onUpdate={(category) => categoryModal.show(category)}
        onDelete={(category) => deleteCategory(category.categoryId)}
      />
    );
  };

  const renderPageTitle = () => {
    return (
      <PageTitle
        leftContent={
          <Row gutter={40} align="middle">
            <Col>
              <span className="page-header-title">{t('page.main.heading_title')}</span>
            </Col>
            {categoryCollapsed && (
              <Col>
                <CategorySelector
                  title={`${t('page.category.title')}:`}
                  categories={categories}
                  onToggle={setCategoryCollapsed}
                  categoryId={curCategoryId}
                  onSelected={onCategoryClicked}
                />
              </Col>
            )}
          </Row>
        }
        rightContent={{
          search: {
            placeholder: t('page.main.input.search.placeholder'),
            onSearch: (value: string) => {
              onPageSearch(value);
            },
          },
          button: {
            label: t('page.main.button.add'),
            itemKey: 'Page-createOrUpdate',
            onClick: () => {
              history.push(`/apps/visualization/page/form/create`);
            },
            // onClick: () => {
            //     history.push(`/page/create?categoryId=${curCategoryId && curCategoryId > 0 ? curCategoryId : 0}`);
            // }
          },
        }}
      />
    );
  };

  const renderPageList = () => {
    const columns:TableColumnsType<any> = [
      {
        title: t('page.main.column.title'),
        dataIndex: 'boardExtConfig',
        ellipsis: true,
        render(config) {
          if (!config) {
            return '';
          }
          return JSON.parse(config).name;
        },
      },
      {
        title: t('page.main.column.category'),
        width: 148,
        dataIndex: 'categoryId',
        render(categoryId) {
          const categoryItem = _.find(categories, (item) => item.categoryId === categoryId);

          return categoryItem?.categoryName || '-';
        },
      },
      {
        title: t('page.main.column.author'),
        width: 148,
        dataIndex: 'createdBy',
      },
      {
        title: t('page.main.column.updated_date'),
        width: 148,
        dataIndex: 'updatedTime',
      },
      {
        title: t('common.text.status'),
        width: 112,
        align: 'center',
        dataIndex: 'status',
        render: (status: Status) => (<StatusTag status={status}/>),
      },
      {
        title: t('common.table.column.action'),
        width: 192,
        align: 'center',
        dataIndex: 'operate',
        render: (operate: any, record: any) => {
          const statusBtn = (
            record.status === 'OFFLINE' ? (
              <IconButton
                icon={<PlayCircleOutlined />}
                tooltip={t('common.text.activate')}
                permissions="Page-updateStatus"
                onClick={() => changeStatus(record.id, 'ONLINE')}
              />
            ) : (
              <IconButton
                icon={<PauseCircleOutlined />}
                tooltip={t('common.text.deactivate')}
                permissions="Page-updateStatus"
                onClick={() => changeStatus(record.id, 'OFFLINE')}
              />
            )
          )
          return (
            <>
              { curCategoryId != -1 && statusBtn }
              <IconButton
                icon="eye"
                tooltip={t('common.text.preview')}
                href={`/apps/visualization/page/${record.id}?router=page`}
              />
              {curCategoryId != -1 && (
                <IconButton
                  icon="edit"
                  tooltip={t('common.button.edit')}
                  permissions="Page-createOrUpdate"
                  href={`/apps/visualization/page/form/edit/${record.id}`}
                />
              )}
              {curCategoryId == -1 && (
                <IconButton
                  icon={<RedoOutlined />}
                  tooltip={t('common.text.undo')}
                  popConfirm={{
                    placement: 'topRight',
                    title: t('common.text.recover_confirmation'),
                    onConfirm: () => pageRecycle(record.id),
                    okText: t('common.button.confirm'),
                    cancelText: t('common.button.cancel'),
                    okButtonProps: {
                      loading: updateStatusRequest.loading,
                    },
                  }}
                />
              )}

              <IconButton
                icon="delete"
                disabled={record.status === 'ONLINE'}
                tooltip={t('common.button.delete')}
                popConfirm={{
                  placement: 'topRight',
                  title: t('page.category.delete_confirmation'),
                  onConfirm: () => deletePage(record.id),
                  okText: t('common.button.confirm'),
                  cancelText: t('common.button.cancel'),
                  okButtonProps: {
                    loading: deletePageRequest.loading,
                  },
                }}
                permissions="Page-deletePage"
              />
            </>
          );
        },
      },
    ];
    return (
      <ListTable
        rowKey="id"
        columns={columns}
        loading={pagesRequest.loading}
        dataSource={pageData.list}
        pagination={pageData.pagination}
        onPageChange={onListPageChange}
      />
    );
  };

  const renderPageContent = () => {
    let colProps = categoryCollapsed
      ? {
          span: 0,
        }
      : {
          flex: '256px',
        };

    return (
      <div className={styles.pageContainer}>
        <Row gutter={16}>
          <Col {...colProps}>{renderCategoriesPanel()}</Col>
          <Col flex="1">{renderPageList()}</Col>
        </Row>
      </div>
    );
  };

  const renderPageCategoryModal = () => {
    return <PageCategoryModal />;
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <>
      <PageHelmet title={t('page.main.heading_title')} />
      {renderPageTitle()}
      {renderPageContent()}
      {renderPageCategoryModal()}
    </>
  );
};

export default Page;

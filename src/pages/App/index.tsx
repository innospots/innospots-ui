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

import { useSetState, useUpdateEffect } from 'ahooks';

import { useHistory } from 'react-router';
import {Row, Col, message, TableColumnsType, Input, Button} from 'antd';
import {PlayCircleOutlined, PauseCircleOutlined, SearchOutlined, PlusOutlined, FilterOutlined, VerticalAlignBottomOutlined} from '@ant-design/icons';

import { renderNodeIcon } from '@/pages/Workflow/Builder/components/NodeIcon';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import IconButton from '@/components/IconButton';
import PageHelmet from '@/components/PageHelmet';
import PageLoading from '@/components/PageLoading';
import StatusTag, { Status } from '@/components/StatusTag';
import CategoriesPane, { CategorySelector } from '@/components/CategoriesPane';

import AppModal, { MODAL_NAME as APP_MODAL_NAME } from './components/AppModal';

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
    appsRequest,
    categoryRequest,
    deleteAppRequest,
    updateStatusRequest,
  } = useModel('App');

  const {
    pageRecycleRequest
  } = useModel('Page');

  const [categoryCollapsed, setCategoryCollapsed] = useState(false);

  const [appModal] = useModal(APP_MODAL_NAME);

  const [queryData, setQueryData] = useSetState({
    queryInput: '',
    ...DEFAULT_PAGE_DATA,
  });

  const {
    page: curPage = 1,
    size: curSize = 20,
    queryInput = '',
    category: curCategoryId = 1
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
      queryInput,
      page: curPage,
      size: curSize,
    })
  }, [ curPage, curSize, queryInput ]);


  useUpdateEffect(() => {
    getPageList();
  }, [curCategoryId, queryData]);

  const getPageList = () => {
    appsRequest.run({
      ...queryData,
      categoryId: curCategoryId,
    });
  };

  const handleAppSaved = () => {
    getPageList();
  }

  const deletePage = async (id: number) => {
    const result = await deleteAppRequest.runAsync(id);

    if (result) {
      message.success(t('common.error_message.delete.success'));
    }
  };

  const onCategoryClicked = (categoryId) => {
    setQueryData({
      queryInput: '',
      ...DEFAULT_PAGE_DATA,
    });
    history.push(`/app?category=${categoryId}`);
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
    history.push(`/app?category=${curCategoryId}&queryInput=${queryInput}&page=${page}&size=${size}`);
  };

  const onPageSearch = (queryInput: string) => {
    /*setQueryData({
      ...queryData,
      queryInput
    })*/
    history.push(`/app?category=${curCategoryId}&queryInput=${queryInput}`);
  };

  const renderCategoriesPanel = () => {
    return (
      <CategoriesPane
        title={'应用分类'}
        showCount={false}
        createDisabled
        dropdownDisabled
        categories={categories}
        categoryId={curCategoryId}
        loading={categoryRequest.loading}
        permissions={categoryPermissions}
        onToggle={setCategoryCollapsed}
        onSelected={onCategoryClicked}
      />
    );
  };

  const renderTitleRightContent = () => {

    return (
      <Row gutter={[16, 0]}>
        <Col>
          <Input
            prefix={<SearchOutlined/>}
            placeholder={t('common.input.placeholder')}
            style={{width: 280, backgroundColor: '#fff', borderColor: '#fff'}}
            // @ts-ignore
            onPressEnter={(event) => onPageSearch(event.target?.value)}
          />
        </Col>
        <Col>
          <Button
            icon={<FilterOutlined />}
            onClick={() => {}}
          >
            筛选
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined/>}
            onClick={() => appModal.show()}
          >
            {t('common.button.create')}
          </Button>
        </Col>
      </Row>
    )
  }

  const renderPageTitle = () => {
    return (
      <PageTitle
        leftContent={
          <Row gutter={40} align="middle">
            <Col>
              <span className="page-header-title">应用管理</span>
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
        rightContent={renderTitleRightContent()}
      />
    );
  };

  const renderPageList = () => {
    const columns:TableColumnsType<any> = [
      {
        width: 80,
        dataIndex: 'icon',
        render(icon, record) {
          return (
            <div className={styles.nodeIcon}>
              { renderNodeIcon(record) }
            </div>
          )
        },
      },
      {
        title: '应用名称',
        dataIndex: 'name',
        ellipsis: true,
        render(name, record) {
          return (
            <>
            <p className={styles.nodeTitle}>{ name }</p>
            <p className={styles.nodeDesc}>{ record.description }</p>
            </>
          )
        },
      },
      {
        title: t('common.text.status'),
        width: 112,
        align: 'center',
        dataIndex: 'status',
        render: (status: Status) => (<StatusTag status={status || 'OFFLINE'}/>),
      },
      {
        title: '应用类型',
        width: 148,
        dataIndex: 'primitive',
      },
      {
        title: t('common.table.column.action'),
        width: 152,
        align: 'center',
        dataIndex: 'nodeId',
        render: (nodeId: number, record: any) => {
          const isUsed = record.used;
          const isSystem = record.appSource === 'system';
          const statusBtn = (
            record.status !== 'ONLINE' ? (
              <IconButton
                disabled={isSystem}
                icon={<PlayCircleOutlined />}
                tooltip="上线"
                permissions="Page-updateStatus"
                onClick={() => changeStatus(nodeId, 'ONLINE')}
              />
            ) : (
              <IconButton
                icon={<PauseCircleOutlined />}
                tooltip="下线"
                permissions="Page-updateStatus"
                onClick={() => {
                  if (isUsed) {
                    message.warn('此应用已经被工作流引用，不能下线！')
                  } else {
                    changeStatus(nodeId, 'OFFLINE')
                  }
                }}
              />
            )
          )
          return (
            <>
              { curCategoryId != -1 && statusBtn }
              <IconButton
                icon="edit"
                disabled={isSystem}
                tooltip={t('common.button.edit')}
                permissions="Page-createOrUpdate"
                onClick={() => {
                  // if (isUsed) {
                  //   message.warn('此应用已经被工作流引用，不能编辑！')
                  // } else {
                    history.push(`/app/builder/${nodeId}`)
                  // }
                }}
              />
              {/*{curCategoryId == -1 && (*/}
              {/*  <IconButton*/}
              {/*    icon={<RedoOutlined />}*/}
              {/*    tooltip={t('common.text.undo')}*/}
              {/*    popConfirm={{*/}
              {/*      placement: 'topRight',*/}
              {/*      title: t('common.text.recover_confirmation'),*/}
              {/*      onConfirm: () => pageRecycle(record.id),*/}
              {/*      okText: t('common.button.confirm'),*/}
              {/*      cancelText: t('common.button.cancel'),*/}
              {/*      okButtonProps: {*/}
              {/*        loading: updateStatusRequest.loading,*/}
              {/*      },*/}
              {/*    }}*/}
              {/*  />*/}
              {/*)}*/}
              {/*<IconButton*/}
              {/*  disabled={isSystem}*/}
              {/*  icon={<VerticalAlignBottomOutlined />}*/}
              {/*  tooltip="下载"*/}
              {/*  href={`/apps/visualization/page/${record.id}?router=page`}*/}
              {/*/>*/}

              {
                isUsed ? (
                  <IconButton
                    icon="delete"
                    disabled={isSystem}
                    onClick={() => {
                      message.warn('此应用已经被工作流引用，不能删除！')
                    }}
                  />
                ) : (
                  <IconButton
                    icon="delete"
                    disabled={isSystem}
                    tooltip={t('common.button.delete')}
                    popConfirm={{
                      placement: 'topRight',
                      title: '是否删除此项？',
                      onConfirm: () => deletePage(nodeId),
                      okText: t('common.button.confirm'),
                      cancelText: t('common.button.cancel'),
                      okButtonProps: {
                        loading: deleteAppRequest.loading,
                      },
                    }}
                    permissions="Page-deletePage"
                  />
                )
              }
            </>
          );
        },
      },
    ];
    return (
      <ListTable
        rowKey="nodeId"
        columns={columns}
        loading={appsRequest.loading}
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

  const renderAppModal = () => <AppModal onSuccess={handleAppSaved} />;

  if (loading) {
    return <PageLoading />;
  }

  return (
    <>
      <PageHelmet title={'应用管理'} />
      {renderPageTitle()}
      {renderPageContent()}
      {renderAppModal()}
    </>
  );
};

export default Page;

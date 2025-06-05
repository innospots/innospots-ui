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
import { useModel, history, useLocation, useSearchParams } from 'umi';
import { useSetState, useUpdateEffect } from 'ahooks';
import {Row, Col, message, TableColumnsType, Input, Button} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

import { renderNodeIcon } from '@/pages/Workflow/Builder/components/NodeIcon';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import IconButton from '@/components/IconButton';
import PageHelmet from '@/components/PageHelmet';
import PageLoading from '@/components/PageLoading';
import NiceSwitch from '@/components/Nice/NiceSwitch';
import StatusTag, { Status } from '@/components/StatusTag';
import CategoriesPane, { CategorySelector } from '@/components/CategoriesPane';

import AppModal, { MODAL_NAME as APP_MODAL_NAME, typeOptions } from './components/AppModal';
import AppCategoryModal, { MODAL_NAME  as APP_CATEGORY_MODAL_NAME } from './components/AppCategoryModal';

import styles from './style.less';

const DEFAULT_PAGE_DATA = {
  page: 1,
  size: 20,
};

const typeMap = typeOptions.reduce((result, item) => {
  result[item.value] = item.label;
  return result;
}, {});

const Page: React.FC<any> = () => {
  const [searchParams] = useSearchParams();
  const { t, loading } = useI18n(['page', 'common', 'app']);
  const [pageType, setPageType] = useState('list')

  const categoryPermissions = useMemo(
    () => ({
      create: 'AppDefinitionCategory-createCategory',
      update: 'AppDefinitionCategory-updateCategory',
      delete: 'AppDefinitionCategory-deleteCategory',
    }),
    [],
  );

  const {
    appData,
    categories,
    appsRequest,
    categoryRequest,
    deleteCategoryRequest,
    deleteAppRequest,
    updateStatusRequest,
  } = useModel('App', model => ({
    appData: model.appData,
    categories: model.categories,
    appsRequest: model.appsRequest,
    categoryRequest: model.categoryRequest,
    deleteCategoryRequest: model.deleteCategoryRequest,
    deleteAppRequest: model.deleteAppRequest,
    updateStatusRequest: model.updateStatusRequest,
  }));

  const {
    pageRecycleRequest
  } = useModel('Page', model => ({
    pageRecycleRequest: model.pageRecycleRequest,
  }));

  const [categoryCollapsed, setCategoryCollapsed] = useState(false);

  const [appModal] = useModal(APP_MODAL_NAME);
  const [categoryModal] = useModal(APP_CATEGORY_MODAL_NAME);

  const [queryData, setQueryData] = useSetState({
    queryInput: '',
    ...DEFAULT_PAGE_DATA,
  });

  const {
    page: curPage = 1,
    size: curSize = 20,
    queryInput = '',
    category: curCategoryId = 0
  } = {
    ...DEFAULT_PAGE_DATA,
    ...Object.fromEntries(searchParams.entries()),
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
    getAppList();
  }, [curCategoryId, queryData]);

  const getAppList = () => {
    appsRequest.run({
      ...queryData,
      categoryId: curCategoryId,
    });
  };

  const handleAppSaved = () => {
    getAppList();
    categoryRequest.run();
  }
  const deleteCategoryById = async (categoryId: number) => {
    const result = await deleteCategoryRequest.runAsync(categoryId);

    if (result) {
      message.success(t('common.error_message.delete.success'));
    } else {
      message.error(t('common.error_message.delete.fail'));
    }
  };
  const deleteApp = async (id: number) => {
    const result = await deleteAppRequest.runAsync(id);

    if (result) {
      getAppList();
      categoryRequest.run();
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
      getAppList();
      message.success(t('common.error_message.save.success'));
    }
  };

  const pageRecycle = async (id: number) => {
    const result = await pageRecycleRequest.runAsync(id);
    if (result) {
      message.success(t('common.error_message.save.success'));
      categoryRequest.run();
      getAppList()
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
        title={t('app.category.title')}
        showCount={true}
        folderIcon={""}
        categories={categories}
        categoryId={curCategoryId}
        loading={categoryRequest.loading}
        permissions={categoryPermissions}
        onToggle={setCategoryCollapsed}
        onSelected={onCategoryClicked}
        onCreate={() => categoryModal.show()}
        onUpdate={(category) => categoryModal.show(category)}
        onDelete={(category) => deleteCategoryById(category.categoryId)}
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
              <span className="page-header-title">{t('app.main.title')}</span>
            </Col>
            <Col>
              <NiceSwitch value={pageType} dataSource={[{
                value: 'list',
                label: t('app.list.title')
              }, {
                value: 'template',
                label: t('app.template.title')
              }]} onChange={setPageType} />
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
        width: 60,
        dataIndex: 'icon',
        render(icon, record) {
          return (
            <div className={styles.appIcon}>
              { renderNodeIcon(record) }
            </div>
          )
        },
      },
      {
        title: t('app.column.name'),
        dataIndex: 'name',
        width: 188,
      },
      {
        title: t('app.column.type'),
        dataIndex: 'appType',
        width: 148,
        render: (appType: string) => t(typeMap[appType]),
      },
      {
        title: t('app.column.creator'),
        width: 148,
        dataIndex: 'createdBy',
      },
      {
        title: t('app.column.updateTime'),
        width: 148,
        dataIndex: 'updatedTime',
      },
      {
        title: t('common.text.status'),
        width: 112,
        align: 'center',
        dataIndex: 'status',
        render: (status: Status) => (<StatusTag status={status || 'OFFLINE'}/>),
      },
      {
        title: t('common.table.column.action'),
        width: 182,
        align: 'center',
        dataIndex: 'appKey',
        render: (appKey: string, record: any) => {
          const isUsed = record.used;
          const isSystem = record.appSource === 'system';
          const statusBtn = (
            record.status !== 'ONLINE' ? (
              <IconButton
                disabled={isSystem}
                icon={<PlayCircleOutlined />}
                tooltip={t('app.button.online')}
                permissions="AppDefinition-updateStatus"
                onClick={() => changeStatus(appKey, 'ONLINE')}
              />
            ) : (
              <IconButton
                icon={<PauseCircleOutlined />}
                tooltip={t('app.button.offline')}
                permissions="AppDefinition-updateStatus"
                onClick={() => {
                  if (isUsed) {
                    message.warning(t('app.message.cannotOffline'))
                  } else {
                    changeStatus(appKey, 'OFFLINE')
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
                permissions="AppDefinition-updateAppDefinition"
                onClick={() => {
                  appModal.show(record)
                }}
              />
              <IconButton
                icon={<AppstoreOutlined />}
                disabled={isSystem}
                tooltip="应用编辑"
                permissions="AppDefinition-updateAppDefinition"
                onClick={() => {
                  history.push(`/app/editor/${appKey}/key`)
                }}
              />
              {
                isUsed ? (
                  <IconButton
                    icon="delete"
                    disabled={isSystem}
                    onClick={() => {
                      message.warning('此应用已经被引用，不能删除！')
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
                      onConfirm: () => deleteApp(appKey),
                      okText: t('common.button.confirm'),
                      cancelText: t('common.button.cancel'),
                      okButtonProps: {
                        loading: deleteAppRequest.loading,
                      },
                    }}
                    permissions="AppDefinition-deleteAppDefinition"
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
        rowKey="appKey"
        columns={columns}
        loading={appsRequest.loading}
        dataSource={appData.list}
        pagination={appData.pagination}
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
  const renderAppCategoryModal = () => <AppCategoryModal />;

  if (loading) {
    return <PageLoading />;
  }

  return (
    <>
      <PageHelmet title={t('app.main.title')} />
      {renderPageTitle()}
      {renderPageContent()}
      {renderAppModal()}
      {renderAppCategoryModal()}
    </>
  );
};

export default Page;

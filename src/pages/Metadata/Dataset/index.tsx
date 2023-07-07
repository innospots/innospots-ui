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
import _ from 'lodash';
import { useModel } from 'umi';

import { Row, Col, message } from 'antd';
import { useReactive } from 'ahooks';

import {formatResourcePath} from '@/common/utils';

import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import IconButton from '@/components/IconButton';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import { usePermission } from '@/components/PermissionSection';
import PageLoading from '@/components/PageLoading';
import CategoriesPane, { CategorySelector } from '@/components/CategoriesPane';

import CategoryModal, { MODAL_NAME } from './components/CategoryModal';
import DatasetModal, { MODAL_NAME as DATASET_MODAL_NAME } from './components/DatasetModal';

import styles from './style.less';

const Index: React.FC = () => {
  const queryData = useReactive<{
    page?: number;
    size?: number;
    queryCode?: string;
  }>({});

  const { t, loading: i18nLoading } = useI18n(['dataset', 'common']);

  const [deleteAuth] = usePermission('Dataset-deleteDataset');
  const [updateAuth] = usePermission('Dataset-updateDataset');

  const categoryPermissions = useMemo(
    () => ({
      create: 'SchemaCategory-createDatasetCategory',
      update: 'SchemaCategory-updateDatasetCategory',
      delete: 'SchemaCategory-deleteDatasetCategory',
    }),
    [],
  );

  const [categoryModal] = useModal(MODAL_NAME);
  const [datasetModal] = useModal(DATASET_MODAL_NAME);

  const {
    dataset,
    categories,
    datasetRequest,
    categoryRequest,
    selectedCategoryId,
    setSelectedCategoryId,
    deleteDatasetRequest,
    deleteCategoryRequest,
  } = useModel('Dataset');

  const { credentials, credentialsRequest, credentialConfigsRequest } = useModel(
    'Credential',
    (model) => ({
      credentials: model.credentials,
      credentialsRequest: model.credentialsRequest,
      credentialConfigsRequest: model.credentialConfigsRequest
    }),
  );

  const curCategoryId = selectedCategoryId < 0 ? 0 : selectedCategoryId;
  const [categoryCollapsed, setCategoryCollapsed] = useState(false);

  useEffect(() => {
    categoryRequest.run();
    credentialsRequest.run();
    credentialConfigsRequest.run();
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [queryData.queryCode, queryData.page, queryData.size, curCategoryId]);

  const fetchDatasets = async () => {
    const postData: any = {
      ...queryData,
      categoryId: curCategoryId,
    };

    await datasetRequest.runAsync(postData);
  };

  const handleSuccess = () => {
    fetchDatasets();
    categoryRequest.run();
  };

  const onCategoryClicked = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  const deleteCategoryById = async (categoryId: number) => {
    const result = await deleteCategoryRequest.runAsync(categoryId);

    if (result) {
      message.success(t('common.error_message.delete.success'));
    } else {
      message.error(t('common.error_message.delete.fail'));
    }
  };

  const removeCurItem = (id: number) => () => {
    return new Promise<void>(async (resolve) => {
      const result = await deleteDatasetRequest.runAsync(id);
      if (result) {
        resolve();
        message.success(t('common.error_message.delete.success'));
      } else {
        message.error(t('common.error_message.delete.fail'));
      }
    });
  };

  const renderPageTitle = () => {
    return (
      <PageTitle
        leftContent={
          <Row gutter={40} align="middle">
            <Col>
              <span className="page-header-title">{t('dataset.main.heading_title')}</span>
            </Col>
            {categoryCollapsed && (
              <Col>
                <CategorySelector
                  title={t('common.category.title')}
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
            placeholder: t('dataset.main.input.search.placeholder'),
            onSearch: (value: string) => {
              queryData.page = 1;
              queryData.queryCode = value;
            },
          },
          button: {
            label: t('dataset.main.button.add'),
            itemKey: 'Dataset-createDataset',
            onClick: () => datasetModal.show(),
          },
        }}
      />
    );
  };

  const renderCategoriesPanel = () => {
    return (
      <CategoriesPane
        title={t('dataset.category.title')}
        categories={categories}
        categoryId={curCategoryId}
        permissions={categoryPermissions}
        onToggle={setCategoryCollapsed}
        onSelected={onCategoryClicked}
        onCreate={() => categoryModal.show()}
        onUpdate={(category) => categoryModal.show(category)}
        onDelete={(category) => deleteCategoryById(category.categoryId)}
      />
    );
  };

  const renderListTable = () => {
    const columns = [
      {
        title: t('dataset.main.column.name'),
        dataIndex: 'name',
        ellipsis: true,
      },
      {
        title: t('dataset.main.column.source'),
        dataIndex: 'credentialId',
        render: (credentialId: number, record: any) => {
          const ds = _.find(credentials, (item) => item.credentialId === credentialId);
          // const meta = _.find(credentialConfigs, (item) => item.name === ds?.configCode);
          const iconPath = record.icon ? formatResourcePath(record.icon) : null;
          return (
            <div className={styles.nameWrapper}>
              { iconPath && <img src={iconPath} className={styles.dataSourceIcon} /> }
              <span style={{ paddingLeft: 4 }}>{ds?.name || '-'}</span>
            </div>
          );
        },
      },
      {
        title: t('dataset.main.column.author'),
        width: 148,
        dataIndex: 'createdBy',
      },
      {
        title: t('dataset.main.column.create_time'),
        width: 148,
        dataIndex: 'createdTime',
      },
    ];

    if (updateAuth || deleteAuth) {
      columns.push({
        title: t('dataset.main.column.action'),
        dataIndex: 'id',
        width: 92,
        align: 'center',
        // @ts-ignore
        render: (id: any, record: any) => {
          return (
            <>
              <IconButton
                icon="edit"
                tooltip={t('common.tooltip.edit')}
                permissions="Dataset-updateDataset"
                onClick={() => {
                  datasetModal.show(record);
                }}
              />
              <IconButton
                icon="delete"
                tooltip={t('common.tooltip.delete')}
                permissions="Dataset-deleteDataset"
                popConfirm={{
                  placement: 'topRight',
                  title: t('common.text.delete_confirmation'),
                  onConfirm: removeCurItem(record.id),
                  okText: t('common.button.confirm'),
                  cancelText: t('common.button.cancel'),
                  okButtonProps: {
                    loading: deleteDatasetRequest.loading,
                  },
                }}
              />
            </>
          );
        },
      });
    }

    return (
      <ListTable
        rowKey="id"
        columns={columns}
        loading={datasetRequest.loading}
        dataSource={dataset.list}
        pagination={dataset.pagination}
        onPageChange={(page: number, size: number) => {
          queryData.page = page;
          queryData.size = size;
        }}
      />
    );
  };

  const renderPageContainer = () => {
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
          <Col flex="1">{renderListTable()}</Col>
        </Row>
      </div>
    );
  };

  const renderDatasetModal = () => {
    return <DatasetModal onSuccess={handleSuccess} />;
  };

  const renderCategoryModal = () => {
    return <CategoryModal />;
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageTitle()}
      {renderPageContainer()}
      {renderDatasetModal()}
      {renderCategoryModal()}
    </>
  );
};

export default Index;
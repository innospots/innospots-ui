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

import React, {useMemo, useEffect, useState} from 'react';
import {Col, message, Row, Space, Tag, Typography, TableColumnsType} from 'antd';
import {
  ContainerOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RedoOutlined
} from '@ant-design/icons';
import {history, Link, useModel, useParams, useSearchParams} from 'umi';
import {useMemoizedFn, useSetState} from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import PageTitle from '@/components/PageTitle/PageTitle';
import PageHelmet from '@/components/PageHelmet';
import PageLoading from '@/components/PageLoading';
import ListTable from '@/components/ListTable';
import IconButton from '@/components/IconButton';
import CategoriesPane, {CategorySelector} from '@/components/CategoriesPane';

import CategoryModal, {MODAL_NAME} from './components/CategoryModal';
import WorkflowModal, {
  MODAL_NAME as WORKFLOW_MODAL_NAME
} from './components/WorkflowModal';

import {renderNodeIcon} from '@/pages/Workflow/Builder/components/NodeIcon';

import { BUTTON_PERMISSION_MAP } from './config';

import styles from './style.less';

const { Title } = Typography;

const DEFAULT_PAGE_DATA = {
  page: 1,
  size: 20
};

const getWorkflowType = (workflowType: string) => {
  return !workflowType || workflowType === 'index' ? '' : workflowType;
};

const Index: React.FC<any> = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const {
    workflows,
    categories,
    updateStatusRequest,
    deleteWorkflowRequest,
    fetchWorkflowsRequest,
    deleteCategoryRequest,
    fetchCategoriesRequest
  } = useModel('Workflow', model => ({
    workflows: model.workflows,
    categories: model.categories,
    updateStatusRequest: model.updateStatusRequest,
    deleteWorkflowRequest: model.deleteWorkflowRequest,
    fetchWorkflowsRequest: model.fetchWorkflowsRequest,
    deleteCategoryRequest: model.deleteCategoryRequest,
    fetchCategoriesRequest: model.fetchCategoriesRequest,
  }));

  const {t, loading: i18nLoading} = useI18n(['workflow', 'common']);

  const [categoryCollapsed, setCategoryCollapsed] = useState(false);

  const [queryData, setQueryData] = useSetState<any>({
    queryInput: '',
    ...DEFAULT_PAGE_DATA
  });

  const [modal] = useModal(MODAL_NAME);
  const [workflowModal] = useModal(WORKFLOW_MODAL_NAME);
  const {
    page: curPage = 1,
    size: curSize = 20,
    queryInput = '',
    category: curCategoryId = 0
  } = {
    ...DEFAULT_PAGE_DATA,
    ...query
  };
  const { workflowType } = useParams<{ workflowType: string }>();
  const buttonPermissions = BUTTON_PERMISSION_MAP[workflowType] || {};

  const categoryPermissions = useMemo(
    () => ({
      create: buttonPermissions.createCategory,
      update: buttonPermissions.updateCategory,
      delete: buttonPermissions.deleteCategory
    }),
    [buttonPermissions]
  );

  useEffect(() => {
    setQueryData({
      ...queryData,
      queryInput,
      page: curPage,
      size: curSize,
    })
  }, [curPage, curSize, queryInput, workflowType]);

  const fetchCategories = () => {
    fetchCategoriesRequest.run({
      workflowType: getWorkflowType(workflowType)
    });
  };

  useEffect(() => {
    fetchCategories();
  }, [workflowType]);

  useEffect(() => {
    getWorkflowList();
  }, [curCategoryId, queryData]);

  const getWorkflowList = () => {
    fetchWorkflowsRequest.run(getWorkflowType(workflowType), {
      ...queryData,
      categoryId: curCategoryId,
    });
  };

  const handleCategoryChange = useMemoizedFn((categoryId: number) => {
    setSearchParams({
      category: categoryId + '',
    });
  });

  const handlePageChange = (page: number, size: number) => {
    setSearchParams({
      category: curCategoryId + '',
      page: page + '',
      size: size + '',
    });
  };

  const deleteCategoryById = async (categoryId: number) => {
    const result = await deleteCategoryRequest.runAsync(workflowType, categoryId);

    if (result) {
      fetchCategories();
      message.success(t('common.error_message.delete.success'));
      if (curCategoryId == categoryId) {
        setSearchParams({
          category: '0',
        });
      }
    } else {
      message.error(t('common.error_message.delete.fail'));
    }
  };

  const removeCurWorkflow = (id: number, isReally?: boolean) => () => {
    return new Promise<void>(async (resolve) => {
      if (id) {
        const result = await deleteWorkflowRequest.runAsync(getWorkflowType(workflowType), id, isReally);

        fetchCategories();
        getWorkflowList();
      }

      resolve();
    });
  };

  const updateWorkflowStatus = (id: number, status: string) => () => {
    return new Promise<void>(async (resolve) => {
      if (id) {
        await updateStatusRequest.runAsync(getWorkflowType(workflowType), id, status);
      }

      fetchCategories();
      getWorkflowList();

      resolve();
    });
  };

  const renderPageHeader = () => {
    return (
      <PageTitle
        title={
          <Row gutter={40} align="middle">
            <Col><Title level={3}>{t('workflow.main.heading_title')}</Title></Col>
            <Col>
              {categoryCollapsed && (
                <Col>
                  <CategorySelector
                    title={`${t('workflow.category.linput.category.label')}:`}
                    categories={categories}
                    onToggle={setCategoryCollapsed}
                    categoryId={curCategoryId}
                    onSelected={handleCategoryChange}
                  />
                </Col>
              )}
            </Col>
          </Row>
        }
        rightContent={{
          search: {
            placeholder: t('workflow.main.input.search.placeholder'),
            onSearch: (value: string) => {
              setSearchParams({
                category: curCategoryId + '',
                queryInput: value,
              });
            }
          },
          button: {
            label: t('workflow.main.button.add'),
            itemKey: buttonPermissions.createWorkflow,
            onClick: () => {
              workflowModal.show({
                modalType: 'add',
                initValues: {
                  name: '',
                  categoryId: curCategoryId * 1,
                  workflowType: getWorkflowType(workflowType)
                }
              });
            }
          }
        }}
      />
    );
  };

  const renderCategoriesPanel = () => {
    return (
      <CategoriesPane
        title={t('workflow.category.linput.category.label')}
        categories={categories}
        categoryId={curCategoryId}
        loading={fetchCategoriesRequest.loading}
        permissions={categoryPermissions}
        onToggle={setCategoryCollapsed}
        onSelected={handleCategoryChange}
        onCreate={() => modal.show({
          modalType: 'add',
          initValues: {
            workflowType: getWorkflowType(workflowType)
          }
        })}
        onUpdate={(category) => modal.show({
          modalType: 'edit',
          initValues: {
            category,
            workflowType: getWorkflowType(workflowType)
          }
        })}
        onDelete={(category) => deleteCategoryById(category.categoryId)}
      />
    );
  };

  const renderDataList = () => {
    const columns: TableColumnsType<any> = [
      {
        title: t('workflow.main.column.name'),
        dataIndex: 'name',
        render: (name: string, record: any) => {
          return (
            <Row className={styles.nameWrapper} align="middle" gutter={8}>
              <Col flex="28px">
                <div className={styles.iconNode}>{renderNodeIcon(record)}</div>
              </Col>
              <Col>
                <div>
                  <Link
                    className="g-button"
                    to={`/workflow/${workflowType}/detail?instanceId=${record.workflowInstanceId}`}
                  >
                    {name || '-'}
                  </Link>
                </div>
                <div>{record.type}</div>
              </Col>
            </Row>
          );
        }
      },
      {
        title: t('workflow.main.column.status'),
        align: 'center',
        width: 112,
        dataIndex: 'status',
        render: (status: string) => {
          return status === 'ONLINE' ? (
            <Tag color="#DBF4EC" style={{color: '#31CB8A'}}>
              {t('common.text.activate')}
            </Tag>
          ) : (
            <Tag color="#E9EDF1" style={{color: '#959EAD'}}>
              {t('common.text.deactivate')}
            </Tag>
          );
        }
      },
      {
        title: t('workflow.main.column.author'),
        width: 148,
        dataIndex: 'createdBy'
      },
      {
        title: t('workflow.main.column.update_time'),
        width: 148,
        dataIndex: 'updatedTime'
      },
      {
        title: t('workflow.main.column.action'),
        dataIndex: 'workflowInstanceId',
        width: 80,
        align: 'center',
        render: (id: number, record: any) => {
          if (record.status === 'REMOVED') {
            return (
              <Space>
                <IconButton
                  icon={<RedoOutlined/>}
                  tooltip={t('common.text.undo')}
                  permissions={buttonPermissions.updateDataStatus}
                  popConfirm={{
                    title: t('common.text.recover_confirmation'),
                    onConfirm: updateWorkflowStatus(id, 'OFFLINE'),
                    okButtonProps: {
                      loading: updateStatusRequest.loading
                    }
                  }}
                />
                <IconButton
                  icon="delete"
                  tooltip={t('common.button.delete')}
                  permissions={buttonPermissions.deleteWorkflowInstance}
                  popConfirm={{
                    title: t('common.text.delete_confirmation'),
                    placement: 'left',
                    onConfirm: removeCurWorkflow(id, true),
                    okButtonProps: {
                      loading: deleteCategoryRequest.loading
                    }
                  }}
                />
              </Space>
            );
          } else {
            const statusBtn = record.status === 'OFFLINE' ? (
              <IconButton
                icon={<PlayCircleOutlined/>}
                tooltip={t('common.text.activate')}
                permissions={buttonPermissions.updateDataStatus}
                popConfirm={{
                  title: t(
                    'workflow.main.workflow_activate_confirmation'
                  ),
                  placement: 'left',
                  onConfirm: updateWorkflowStatus(id, 'ONLINE'),
                  okButtonProps: {
                    loading: updateStatusRequest.loading
                  }
                }}
              />
            ) : (
              <IconButton
                icon={<PauseCircleOutlined/>}
                tooltip={t('common.text.activate')}
                permissions={buttonPermissions.updateDataStatus}
                popConfirm={{
                  title: t(
                    'workflow.main.workflow_deactivate_confirmation'
                  ),
                  placement: 'left',
                  onConfirm: updateWorkflowStatus(id, 'OFFLINE'),
                  okButtonProps: {
                    loading: updateStatusRequest.loading
                  }
                }}
              />
            )
            return (
              <Space>
                { record.revision !== 0 && statusBtn }

                {record.triggerCode !== 'DUMMY' && (
                  <IconButton
                    icon={<ContainerOutlined/>}
                    tooltip={t('common.button.detail')}
                    onClick={() => {
                      history.push(`/workflow/${workflowType}/detail?instanceId=${id}`)
                    }}
                  />
                )}

                <IconButton
                  icon="edit"
                  tooltip={t('common.button.edit')}
                  onClick={() => history.push(`/workflow/${workflowType}/builder?instanceId=${id}&page=${curPage}&size=${curSize}`)}
                />

                <IconButton
                  icon="delete"
                  tooltip={t('common.tooltip.recycle_bin')}
                  permissions={buttonPermissions.removeWorkflowToRecycle}
                  popConfirm={{
                    title: t('common.text.delete_confirmation'),
                    placement: 'left',
                    onConfirm: removeCurWorkflow(id),
                    okButtonProps: {
                      loading: deleteWorkflowRequest.loading
                    }
                  }}
                />
              </Space>
            );
          }
        }
      }
    ];

    return (
      <div className={styles.dataList}>
        <div className={styles.inner}>
          <div>
            <ListTable
              rowKey="workflowInstanceId"
              columns={columns}
              loading={fetchWorkflowsRequest.loading}
              dataSource={workflows.list}
              pagination={workflows.pagination}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderPageContainer = () => {
    let colProps = categoryCollapsed
      ? {
        span: 0
      }
      : {
        flex: '256px'
      };

    return (
      <div className={styles.pageContainer}>
        <Row gutter={16}>
          <Col {...colProps}>{renderCategoriesPanel()}</Col>
          <Col flex="auto">{renderDataList()}</Col>
        </Row>
      </div>
    );
  };

  const renderWorkflowModal = () => {
    return (
      <WorkflowModal
        workflowType={getWorkflowType(workflowType)}
        onSuccess={() => {
          fetchCategories();
          getWorkflowList();
        }}
      />
    );
  };

  const renderCategoryModal = () => <CategoryModal/>;

  if (i18nLoading) {
    return <PageLoading/>;
  }

  return (
    <>
      <PageHelmet title={t('workflow.main.heading_title')}/>
      {renderPageHeader()}
      {renderPageContainer()}
      {renderWorkflowModal()}
      {renderCategoryModal()}
    </>
  );
};

export default Index;

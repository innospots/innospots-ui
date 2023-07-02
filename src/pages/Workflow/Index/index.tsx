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
import {Col, message, Row, Space, Tag, TableColumnsType} from 'antd';
import {
  ContainerOutlined,
  DeleteOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RedoOutlined
} from '@ant-design/icons';

import {history, Link, useModel} from 'umi';

import {useMemoizedFn, useSetState} from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import PageTitle from '@/components/PageTitle/PageTitle';
import PageHelmet from '@/components/PageHelmet';
import PageLoading from '@/components/PageLoading';
import ListTable from '@/components/ListTable';
import NiceAvatar from '@/components/Nice/NiceAvatar';
import IconButton from '@/components/IconButton';
import CategoriesPane, {CategorySelector} from '@/components/CategoriesPane';

import CategoryModal, {MODAL_NAME} from './components/CategoryModal';
import WorkflowModal, {
  TYPE_ICONS,
  MODAL_NAME as WORKFLOW_MODAL_NAME
} from './components/WorkflowModal';

import styles from './style.less';

const DEFAULT_PAGE_DATA = {
  page: 1,
  size: 20
};

const Index: React.FC<any> = ({location}) => {
  const {
    workflows,
    categories,
    updateStatusRequest,
    deleteWorkflowRequest,
    fetchWorkflowsRequest,
    deleteCategoryRequest,
    fetchCategoriesRequest
  } = useModel('Workflow');

  const {t, loading: i18nLoading} = useI18n(['workflow', 'common']);

  const [categoryCollapsed, setCategoryCollapsed] = useState(false);

  const [queryData, setQueryData] = useSetState({
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
    ...location.query
  };

  const categoryPermissions = useMemo(
    () => ({
      create: 'WorkflowCategory-createCategory',
      update: 'WorkflowCategory-updateCategory',
      delete: 'WorkflowCategory-deleteCategory'
    }),
    []
  );

  useEffect(() => {
    setQueryData({
      ...queryData,
      queryInput,
      page: curPage,
      size: curSize
    })
  }, [curPage, curSize, queryInput]);

  useEffect(() => {
    fetchCategoriesRequest.run();
  }, []);

  useEffect(() => {
    getWorkflowList();
  }, [curCategoryId, queryData]);

  const getWorkflowList = () => {
    fetchWorkflowsRequest.run({
      ...queryData,
      categoryId: curCategoryId
    });
  };

  const handleCategoryChange = useMemoizedFn((categoryId: number) => {
    setQueryData({
      queryInput: '',
      ...DEFAULT_PAGE_DATA
    });
    history.push(`index?category=${categoryId}`);
  });

  const handlePageChange = (page: number, size: number) => {
    // setQueryData({
    //     page,
    //     size,
    // });
    history.push(`index?category=${curCategoryId}&page=${page}&size=${size}`);
  };

  const deleteCategoryById = async (categoryId: number) => {
    const result = await deleteCategoryRequest.runAsync(categoryId);

    if (result) {
      message.success(t('common.error_message.delete.success'));
      if (curCategoryId == categoryId) {
        history.push(`index?category=0`);
      }
    } else {
      message.error(t('common.error_message.delete.fail'));
    }
  };

  const removeCurWorkflow = (id: number, isReally?: boolean) => () => {
    return new Promise<void>(async (resolve) => {
      if (id) {
        const result = await deleteWorkflowRequest.runAsync(id, isReally);

        fetchCategoriesRequest.run();
        getWorkflowList();
      }

      resolve();
    });
  };

  const updateWorkflowStatus = (id: number, status: string) => () => {
    return new Promise<void>(async (resolve) => {
      if (id) {
        await updateStatusRequest.runAsync(id, status);
      }

      fetchCategoriesRequest.run();
      getWorkflowList();

      resolve();
    });
  };

  const renderPageHeader = () => {
    return (
      <PageTitle
        title={
          <Row gutter={40} align="middle">
            <Col>{t('workflow.main.heading_title')}</Col>
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
              history.push(`index?category=${curCategoryId}&queryInput=${value}`);
            }
          },
          button: {
            label: t('workflow.main.button.add'),
            itemKey: 'WorkflowInstance-createWorkflow',
            onClick: () => {
              workflowModal.show({
                modalType: 'add',
                initValues: {
                  name: '',
                  categoryId: curCategoryId * 1
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
        onCreate={() => modal.show()}
        onUpdate={(category) => modal.show(category)}
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
          const {search} = location
          return (
            <Row className={styles.nameWrapper} align="middle" gutter={8}>
              <Col flex="28px">
                <NiceAvatar size={28} src={TYPE_ICONS[record.triggerCode]}/>
              </Col>
              <Col>
                <div>
                  <Link
                    className="g-button"
                    to={`index/detail${search?.length > 0 ? search + '&' : '?'}instanceId=${record.workflowInstanceId}`}
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
                  permissions="WorkflowInstance-updateDataStatus"
                  popConfirm={{
                    title: t('common.text.recover_confirmation'),
                    placement: 'left',
                    onConfirm: updateWorkflowStatus(id, 'OFFLINE'),
                    okButtonProps: {
                      loading: updateStatusRequest.loading
                    }
                  }}
                />
                <IconButton
                  icon={<DeleteOutlined/>}
                  tooltip={t('common.button.delete')}
                  permissions="WorkflowInstance-deleteWorkflowInstance"
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
            return (
              <Space>
                {record.status === 'OFFLINE' ? (
                  <IconButton
                    icon={<PlayCircleOutlined/>}
                    tooltip={t('common.text.activate')}
                    permissions="WorkflowInstance-updateDataStatus"
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
                    permissions="WorkflowInstance-updateDataStatus"
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
                )}

                {record.triggerCode !== 'DUMMY' && (
                  <IconButton
                    icon={<ContainerOutlined/>}
                    tooltip={t('common.button.detail')}
                    onClick={() => {
                      const {search} = location
                      history.push(`index/detail${search?.length > 0 ? search + '&' : '?'}instanceId=${id}`)
                    }}
                  />
                )}

                <IconButton
                  icon={<EditOutlined/>}
                  tooltip={t('common.button.edit')}
                  onClick={() => history.push(`builder?instanceId=${id}`)}
                />

                <IconButton
                  icon={<DeleteOutlined/>}
                  tooltip={t('common.tooltip.recycle_bin')}
                  permissions="WorkflowInstance-removeWorkflowToRecycle"
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
        onSuccess={() => {
          fetchCategoriesRequest.run();
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

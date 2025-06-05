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
import { history, useModel, useSearchParams } from 'umi';
import { useSetState, useDebounceEffect } from 'ahooks';
import { Row, Col, message, TableColumnsType, Input, Button } from 'antd';
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

import NodeModal, { MODAL_NAME as NODE_MODAL_NAME } from './components/NodeModal';
import NodeGroupModal, { MODAL_NAME as NODE_GROUP_MODAL_NAME } from './components/NodeGroupModal';

import styles from './style.less';

const DEFAULT_PAGE_DATA = {
  page: 1,
  size: 20,
};

const Page: React.FC<any> = () => {
  const [searchParams] = useSearchParams();
  const query = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const { t, loading } = useI18n(['page', 'common', 'node']);
  const [nodeGroupId, setNodeGroupId] = useState<number>();
  const [nodeTemplate, setNodeTemplate] = useState<string>();

  const categoryPermissions = useMemo(
    () => ({
      create: 'FlowNodeGroup-createNodeGroup',
      update: 'FlowNodeGroup-reNameNodeGroup',
      delete: 'FlowNodeGroup-removeNodeGroup',
    }),
    [],
  );

  const {
    nodeGroups,
    primitives,
    nodePageData,
    nodeTemplates,
    fetchNodesRequest,
    deleteNodeRequest,
    deleteNodeGroupRequest,
    fetchNodeGroupsRequest,
    fetchPrimitivesRequest,
    updateNodeStatusRequest,
    fetchNodeTemplatesRequest,
  } = useModel('FlowNode', (model) => ({
    nodeGroups: model.nodeGroups,
    primitives: model.primitives,
    nodePageData: model.nodePageData,
    nodeTemplates: model.nodeTemplates,
    fetchNodesRequest: model.fetchNodesRequest,
    deleteNodeRequest: model.deleteNodeRequest,
    deleteNodeGroupRequest: model.deleteNodeGroupRequest,
    fetchNodeGroupsRequest: model.fetchNodeGroupsRequest,
    fetchPrimitivesRequest: model.fetchPrimitivesRequest,
    updateNodeStatusRequest: model.updateNodeStatusRequest,
    fetchNodeTemplatesRequest: model.fetchNodeTemplatesRequest,
  }));

  const nodeCategories = useMemo(() => {
    return _.map(nodeGroups, (item) => {
      return {
        scopes: item.scopes,
        categoryName: item.name,
        categoryId: item.nodeGroupId,
      };
    });
  }, [nodeGroups]);

  const [categoryCollapsed, setCategoryCollapsed] = useState(false);

  const [nodeModal] = useModal(NODE_MODAL_NAME);
  const [groupModal] = useModal(NODE_GROUP_MODAL_NAME);

  const [queryData, setQueryData] = useSetState({
    queryInput: '',
    ...DEFAULT_PAGE_DATA,
  });

  const {
    page: curPage = 1,
    size: curSize = 20,
    groupId = '',
    template = '',
    queryInput = '',
  } = {
    ...DEFAULT_PAGE_DATA,
    ...query,
  };

  const switchDataSource = useMemo<any[]>(
    () =>
      _.map(nodeTemplates, (item) => ({
        value: item.tplCode,
        label: item.tplName,
      })),
    [nodeTemplates],
  );

  useEffect(() => {
    if (!nodeTemplates) {
      fetchNodeTemplatesRequest.run();
    }
  }, [nodeTemplates]);

  useEffect(() => {
    if (switchDataSource.length) {
      setNodeTemplate(template || switchDataSource[0].value);
    }
  }, [switchDataSource, template]);

  useEffect(() => {
    if (nodeTemplate) {
      fetchNodeGroupsRequest.run(nodeTemplate, { includeAll: true });
    }
  }, [nodeTemplate]);

  useEffect(() => {
    fetchPrimitivesRequest.run();
  }, []);

  useEffect(() => {
    let gid = groupId || -1;
    if (!groupId && nodeCategories.length) {
      gid = nodeCategories[0].categoryId;
    }
    setNodeGroupId(gid);
  }, [groupId, nodeCategories]);

  useEffect(() => {
    setQueryData({
      ...queryData,
      queryInput,
      page: curPage,
      size: curSize,
    });
  }, [curPage, curSize, queryInput]);

  const getNodeList = () => {
    const tplCode = nodeTemplate || template;
    const tplResult = _.find(nodeTemplates, (item) => item.tplCode === tplCode);

    if (tplResult) {
      fetchNodesRequest.run({
        ...queryData,
        nodeGroupId,
        flowTplId: tplResult.flowTplId,
      });
    }
  };

  useDebounceEffect(
    () => {
      getNodeList();
    },
    [nodeGroupId, queryData, nodeTemplates],
    {
      wait: 300,
    },
  );

  const handleAppSaved = () => {
    getNodeList();
  };

  const deleteNodeGroupById = async (groupId: number) => {
    const result = await deleteNodeGroupRequest.runAsync(groupId);

    if (result) {
      message.success(t('common.error_message.delete.success'));
      fetchNodeGroupsRequest.run(nodeTemplate || '', { includeAll: true });
      if (nodeGroupId === groupId) {
        setNodeGroupId(nodeCategories[0]?.categoryId);
      }
    } else {
      message.error(t('common.error_message.delete.fail'));
    }
  };

  const deleteApp = async (id: number) => {
    const result = await deleteNodeRequest.runAsync(id);

    if (result) {
      getNodeList();
      message.success(t('common.error_message.delete.success'));
    }
  };

  const pageTo = (params: Record<string, any>) => {
    const ls = _.map(
      {
        groupId: nodeGroupId,
        template: nodeTemplate,
        ...params,
      },
      (v, k) => `${k}=${v}`,
    );
    history.push(`/node-definition?${ls.join('&')}`);
  };

  const onCategoryClicked = (groupId: number) => {
    pageTo({
      groupId,
    });
  };

  const changeStatus = async (id: number, status: string) => {
    const result = await updateNodeStatusRequest.runAsync(id, status);
    if (result) {
      message.success(t('common.error_message.save.success'));
    }
  };

  const onListPageChange = (page: number, size: number) => {
    pageTo({
      page,
      size,
    });
  };

  const onPageSearch = (queryInput: string) => {
    pageTo({
      queryInput,
    });
  };

  const dropdownDisabled = (group: any) => group.scopes === 'system';

  const renderCategoriesPanel = () => {
    return (
      <CategoriesPane
        title={t('node.category.title')}
        showCount={false}
        folderIcon={''}
        categories={nodeCategories}
        categoryId={nodeGroupId}
        loading={fetchNodeGroupsRequest.loading}
        permissions={categoryPermissions}
        onToggle={setCategoryCollapsed}
        onSelected={onCategoryClicked}
        dropdownDisabled={dropdownDisabled}
        onCreate={() =>
          groupModal.show({
            modalType: 'add',
            initValues: {
              templateCode: nodeTemplate,
            },
          })
        }
        onUpdate={(category) =>
          groupModal.show({
            modalType: 'edit',
            initValues: {
              name: category.categoryName,
              nodeGroupId: category.categoryId,
              templateCode: nodeTemplate,
            },
          })
        }
        onDelete={(category) => deleteNodeGroupById(category.categoryId)}
      />
    );
  };

  const renderTitleRightContent = () => {
    return (
      <Row gutter={[16, 0]}>
        <Col>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('common.input.placeholder')}
            style={{ width: 280, backgroundColor: '#fff', borderColor: '#fff' }}
            // @ts-ignore
            onPressEnter={(event) => onPageSearch(event.target?.value)}
          />
        </Col>
        <Col>
          <Button icon={<FilterOutlined />} onClick={() => {}}>
            {t('node.button.filter')}
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              nodeModal.show({
                modalType: 'add',
                nodeGroupId: nodeGroupId * 1,
              })
            }
          >
            {t('common.button.create')}
          </Button>
        </Col>
      </Row>
    );
  };

  const renderPageTitle = () => {
    return (
      <PageTitle
        leftContent={
          <Row gutter={40} align="middle">
            <Col>
              <span className="page-header-title">{t('node.list.title')}</span>
            </Col>
            <Col>
              <NiceSwitch
                value={nodeTemplate}
                dataSource={switchDataSource}
                onChange={setNodeTemplate}
              />
            </Col>
            {categoryCollapsed && (
              <Col>
                <CategorySelector
                  title={`${t('page.category.title')}:`}
                  categories={nodeCategories}
                  onToggle={setCategoryCollapsed}
                  categoryId={nodeGroupId}
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
    const columns: TableColumnsType<any> = [
      {
        width: 60,
        dataIndex: 'icon',
        render(icon, record) {
          return <div className={styles.nodeIcon}>{renderNodeIcon(record)}</div>;
        },
      },
      {
        title: t('node.column.name'),
        dataIndex: 'name',
        width: 188,
      },
      {
        title: t('node.column.type'),
        width: 'auto',
        dataIndex: 'primitive',
        render: (p: string) => {
          const item = _.find(primitives, (pi) => pi.value === p);
          return item ? [item.value, item.label].join(' - ') : p;
        },
      },
      {
        title: t('common.text.status'),
        width: 112,
        align: 'center',
        dataIndex: 'status',
        render: (status: Status) => <StatusTag status={status || 'OFFLINE'} />,
      },
      {
        title: t('common.table.column.action'),
        width: 182,
        align: 'center',
        dataIndex: 'nodeId',
        render: (nodeId: number, record: any) => {
          const isUsed = record.used;
          const isSystem = record.vendor === 'system';
          const statusBtn =
            record.status !== 'ONLINE' ? (
              <IconButton
                disabled={isSystem}
                icon={<PlayCircleOutlined />}
                tooltip={t('node.button.online')}
                permissions="FlowNodeDefinition-updateNodeStatus"
                onClick={() => changeStatus(nodeId, 'ONLINE')}
              />
            ) : (
              <IconButton
                icon={<PauseCircleOutlined />}
                tooltip={t('node.button.offline')}
                permissions="FlowNodeDefinition-updateNodeStatus"
                onClick={() => {
                  if (isUsed) {
                    message.warning(t('node.message.workflow_referenced_no_offline'));
                  } else {
                    changeStatus(nodeId, 'OFFLINE');
                  }
                }}
              />
            );

          const delButton = isUsed ? (
            <IconButton
              icon="delete"
              disabled={isSystem}
              onClick={() => {
                message.warning(t('node.message.workflow_referenced_no_delete'));
              }}
            />
          ) : (
            <IconButton
              icon="delete"
              tooltip={t('common.button.delete')}
              popConfirm={{
                placement: 'topRight',
                title: t('node.message.confirm_delete'),
                onConfirm: () => deleteApp(nodeId),
                okText: t('common.button.confirm'),
                cancelText: t('common.button.cancel'),
                okButtonProps: {
                  loading: deleteNodeRequest.loading,
                },
              }}
              permissions="FlowNodeDefinition-deleteNode"
            />
          );

          return (
            <>
              {nodeGroupId != -1 && statusBtn}
              {!isSystem && (
                <>
                  <IconButton
                    icon="edit"
                    tooltip={t('common.button.edit')}
                    permissions="FlowNodeDefinition-updateNodeInfo"
                    onClick={() => {
                      // if (isUsed) {
                      //   message.warning('此应用已经被工作流引用，不能编辑！')
                      // } else {
                      //   nodeModal.show(record);
                      // }
                      nodeModal.show(record);
                    }}
                  />
                </>
              )}
              <IconButton
                icon={<AppstoreOutlined />}
                tooltip={t('node.app.edit')}
                permissions="FlowNodeDefinition-updateNodeInfo"
                onClick={() => {
                  history.push(`/workflow/node-editor/${nodeId}`);
                }}
              />
              {!isSystem && delButton}
            </>
          );
        },
      },
    ];
    return (
      <ListTable
        rowKey="nodeId"
        columns={columns}
        loading={fetchNodesRequest.loading}
        dataSource={nodePageData.list}
        pagination={nodePageData.pagination}
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

  const renderNodeModal = () => <NodeModal flowCode={nodeTemplate} onSuccess={handleAppSaved} />;
  const renderNodeGroupModal = () => <NodeGroupModal />;

  if (loading) {
    return <PageLoading />;
  }

  return (
    <>
      <PageHelmet title={t('node.page.title')} />
      {renderPageTitle()}
      {renderPageContent()}
      {renderNodeModal()}
      {renderNodeGroupModal()}
    </>
  );
};

export default Page;

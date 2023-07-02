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

import React, {useEffect, useState} from 'react';

import {Button, Col, DatePicker, Form, Popover, Row, Select, Space, Spin, Tag, Typography,} from 'antd';

import Icon, {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ContainerOutlined,
  FilterOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';

import {useSetState} from "ahooks";

import styles from "./style.less";

import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import PageTitle from "@/components/PageTitle";
import useModal from "@/common/hooks/useModal";
import TaskModal, {MODAL_NAME} from "./components/TaskModal";
import TaskDrawer, {DRAWER_NAME} from "./components/TaskDrawer";
import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

import TaskContext from './contexts/TaskContext'
import TaskDashboard from './components/TaskDashboard'

import {fetchPriorityOptions, fetchTagOptions} from "@/services/Tasks";

import {fetchMember} from "@/services/User";
import {useModel} from "@@/plugin-model/useModel";
import ListTable from "@/components/ListTable";
import {KeyValues} from "@/common/types/Types";
import IconButton from "@/components/IconButton";
import UserAvatar from "@/components/UserAvatar";

import { usePermission } from '@/components/PermissionSection';

import {PRIORITY_TYPES, Status, STATUS_TYPES} from './constants'

const {RangePicker} = DatePicker;
const {Paragraph} = Typography;

const dateFormat = 'YYYY-MM-DD';


const oneProgressSvg = () => (
  <svg t="1677492783631" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
       p-id="3685" width="16" height="16">
    <path
      d="M512 64C264.576 64 64 264.576 64 512s200.576 448 448 448 448-200.576 448-448S759.424 64 512 64z m0 816c-202.916 0-368-165.084-368-368s165.084-368 368-368 368 165.084 368 368-165.084 368-368 368z"
      fill="#00b1ff" p-id="3686"></path>
    <path d="M512 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#00b1ff" p-id="3687"></path>
    <path d="M304 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#00b1ff" p-id="3688"></path>
    <path d="M720 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#00b1ff" p-id="3689"></path>
  </svg>
);

export const STATUS_ICONS = {
  'Pending': MinusCircleOutlined,
  'InProgress': oneProgressSvg,
  'Finished': CheckCircleOutlined,
  'Canceled': CloseCircleOutlined,
};

const Index: React.FC = () => {

  const [modal] = useModal(MODAL_NAME);
  const [drawer] = useModal(DRAWER_NAME);

  const [filterForm] = Form.useForm();

  const {sessionData} = useModel('Account');

  const [createAuth] = usePermission('TodoTask-createTodoTask');

  const {
    taskData,
    taskRequest,
    deleteTaskRequest,
  } = useModel('Tasks');

  const {t, loading: i18nLoading} = useI18n(['task', 'common']);

  const [tabId, setTabId] = useState<string>('list');

  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<{
    tags?: any[];
    priority?: any[];
    userList?: any[];
  }>({
    tags: [],
    priority: [],
    userList: [],
  });

  const [queryData, setQueryData] = useSetState<any>({
    queryInput: '',
  });

  useEffect(() => {
    formatFilterOptions();
  }, []);

  useEffect(() => {
    taskRequest.run(queryData);
  }, [queryData]);

  const formatFilterOptions = async () => {
    const options: {
      tags?: any;
      priority?: any;
      userList?: any;
    } = {};

    const tagsResult = await fetchTagOptions();
    const priorityResult = await fetchPriorityOptions();
    const memberListResult = await fetchMember({
      paging: false,
    });

    // @ts-ignore
    options.tags = (tagsResult || []).map((item) => ({
      value: item,
      label: item,
    }));

    // @ts-ignore
    options.priority = (priorityResult || []).map((item) => ({
      value: item,
      label: item,
    }));

    options.userList = (memberListResult?.list || []).map((item) => ({
      value: item.userId,
      label: item.userName,
    }));

    setFilterOptions(options);
  };

  const onListPageChange = (page: number, size: number) => {
    setQueryData({
      ...queryData,
      page,
      size
    });
  };

  const handleFormSubmit = (values) => {
    const params: {
      tags?: string;
      endDate?: string;
      startDate?: string;
      priorities?: string;
      principalUserIds?: string;
    } = {};

    if (values) {
      const {
        tags,
        logTime,
        priorities,
        principalUserIds
      } = values;

      if (logTime?.length) {
        params.startDate = logTime[0] ? logTime[0].format(dateFormat) : '';
        params.endDate = logTime[1] ? logTime[1].format(dateFormat) : '';
      }

      if (tags) {
        params.tags = tags;
      }

      if (priorities) {
        params.priorities = priorities;
      }

      if (principalUserIds) {
        params.principalUserIds = principalUserIds;
      }
    }

    // @ts-ignore
    setQueryData(params);
    setFilterOpen(false);
  };

  const deleteCurTask = (id: number) => () => {
    return new Promise<void>(async (resolve) => {
      await deleteTaskRequest.runAsync(id);
      resolve();
    });
  };

  const renderFilterForm = () => {

    return (
      <Form form={filterForm} layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item name="principalUserIds" label={t('task.form.label.principal')}>
          <Select
            allowClear
            mode="multiple"
            options={filterOptions.userList}
            className={styles.multiSelector}
            placeholder={t('common.select.placeholder')}
          />
        </Form.Item>
        <Form.Item name="priorities" label={t('task.form.label.priority')}>
          <Select
            allowClear
            mode="multiple"
            options={filterOptions.priority}
            className={styles.multiSelector}
            placeholder={t('common.select.placeholder')}
          />
        </Form.Item>
        <Form.Item name="tags" label={t('task.form.label.tag')}>
          <Select
            allowClear
            mode="multiple"
            options={filterOptions.tags}
            className={styles.multiSelector}
            placeholder={t('common.select.placeholder')}
          />
        </Form.Item>
        <Form.Item name="logTime" label={t('task.list.column.schedule_time')}>
          {/*@ts-ignore*/}
          <RangePicker style={{width: '100%'}}/>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{float: 'right'}}>
            {t('common.button.confirm')}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const renderFilterButton = () => {
    const filterContent = (
      <div className={styles.filterContent}>
        <div className={styles.inner}>
          <p className={styles.title}>{t('common.button.filter')}：</p>
          {renderFilterForm()}
        </div>
      </div>
    );

    return (
      <Popover
        open={filterOpen}
        title={null}
        trigger="click"
        placement="leftTop"
        content={filterContent}
        onOpenChange={setFilterOpen}
      >
        <Button icon={<FilterOutlined/>} className={styles.filterButton}>
          {t('common.button.filter')}
        </Button>
      </Popover>
    );
  };

  const renderPageHeader = () => {
    return (
      <PageTitle
        style={{height: 64}}
        leftContent={
          <Row align="middle">
            <Col>
              <span className="page-header-title">
                {t('task.main.page.title')}
              </span>
            </Col>
            <Col className={styles.titleTab}>
              <div className={tabId === 'list' ? styles.activeTab : ''}
                   onClick={() => setTabId('list')}>
                <UnorderedListOutlined/>
                {t('task.main.page.tab.list')}
              </div>
              <div className={tabId === 'dashboard' ? styles.activeTab : ''}
                   onClick={() => setTabId('dashboard')}>
                <AppstoreOutlined/>
                {t('task.main.page.tab.dashbord')}
              </div>
            </Col>
          </Row>
        }
        rightContent={{
          search: {
            placeholder: t('task.main.page.search.placeholder'),
            onSearch: (value: string) => {
              // @ts-ignore
              setQueryData({
                queryInput: value,
                ...DEFAULT_PAGINATION_SETTINGS
              });
            },
          },
          button: (
            <Space size={16}>
              {renderFilterButton()}

              {
                createAuth && (
                  <Button icon={<PlusOutlined/>} type="primary" onClick={() => modal.show()}>
                    {t('common.button.add')}
                  </Button>
                )
              }
            </Space>
          ),
        }}
      />
    );
  };

  const renderDataContent = () => {
    const columns: KeyValues[] = [
      {
        title: t('task.list.column.taskId'),
        width: 100,
        key: 'taskId',
        fixed: 'left',
        align: 'center',
        dataIndex: 'taskId',
      },
      {
        title: t('task.list.column.taskName'),
        width: 280,
        fixed: 'left',
        key: 'taskName',
        dataIndex: 'taskName',
        render: (taskName) => {
          return (
            <Paragraph ellipsis={{rows: 2, tooltip: taskName}}>{taskName}</Paragraph>
          )
        }
      },
      {
        title: t('task.list.column.priority'),
        width: 80,
        key: 'taskPriority',
        dataIndex: 'taskPriority',
        render: (taskPriority) => {
          const priority = PRIORITY_TYPES[taskPriority]
          return (
            <Tag
              color={priority.bgColor}
              style={{color: priority.color}}
            >
              {t(priority.text)}
            </Tag>
          )
        }
      },
      {
        title: t('task.list.column.tag'),
        key: 'tags',
        dataIndex: 'tags',
        render: (tags) => {
          return (
            _.map(tags, (tag: any, index) => {
              return (
                <Tag
                  color={'#ecf0ff'}
                  style={{color: '#53555a'}}
                  key={[tag, index].join('*')}
                >
                  {tag}
                </Tag>
              )
            })
          )
        }
      },
      {
        title: t('task.list.column.status'),
        align: 'center',
        key: 'taskStatus',
        dataIndex: 'taskStatus',
        render: (status: Status) => {
          const state = STATUS_TYPES[status] || STATUS_TYPES['Pending']
          const state_icon = STATUS_ICONS[status] || STATUS_ICONS['Pending']

          return (
            <Space size={4}>
              <Icon component={state_icon} style={{fontSize: '16px', color: state.color, marginTop: 5}}/>

              <span style={{fontSize: '12px', lineHeight: '16px'}}>
                {t(state.text)}
              </span>
            </Space>
          )
        }
      },
      {
        title: t('task.list.column.create_time'),
        key: 'createdTime',
        dataIndex: 'createdTime',
      },
      {
        title: t('task.list.column.task_leader'),
        key: 'principalUserName',
        dataIndex: 'principalUserName',
        render: (userName, record) => {
          return (
            <Space>
              <UserAvatar
                size={16}
                userInfo={{avatarKey: `/api/${record.principalAvatarKey}`}}
                style={{width: 16, height: 16}}
              />
              <span>{userName}</span>
            </Space>
          )
        }
      },
      {
        title: t('task.list.column.creator'),
        key: 'createdBy',
        dataIndex: 'createdBy',
        render: (userName, record) => {
          return (
            <Space>
              <UserAvatar
                size={16}
                userInfo={{avatarKey: `/api/${record.avatarKey}`}}
                style={{width: 16, height: 16}}
              />
              <span>{userName}</span>
            </Space>
          )
        }
      },
      {
        title: t('task.list.column.schedule_time'),
        key: 'time',
        dataIndex: 'time',
        render: (time, record) => {
          return (
            <Space>
              <span>{record.startDate}</span>
              <span>~</span>
              <span>{record.endDate}</span>
            </Space>
          )
        }
      },
      {
        title: t('task.list.column.operate'),
        key: 'operate',
        dataIndex: 'operate',
        align: 'center',
        fixed: 'right',
        render: (operate: any, record: any) => {
          // 只有创建者可以展示编辑和删除按钮
          const isAuth = sessionData.userId === record.userId

          return (
            <>
              <IconButton
                icon={<ContainerOutlined/>}
                tooltip={t('common.button.detail')}
                onClick={() => {
                  drawer.show(record)
                }}
              />

              {isAuth &&
              <IconButton
                icon="edit"
                tooltip={t('common.button.edit')}
                permissions="TodoTask-updateTodoTask"
                onClick={() => {
                  modal.show(record);
                }}
              />
              }

              {isAuth &&
              <IconButton
                icon="delete"
                permissions="TodoTask-deleteTodoTask"
                tooltip={t('common.tooltip.delete')}
                popConfirm={{
                  title: t('common.text.delete_confirmation'),
                  placement: 'topRight',
                  onConfirm: deleteCurTask(record.taskId),
                  okButtonProps: {
                    loading: deleteTaskRequest.loading,
                  },
                }}
              />
              }
            </>
          );
        },
      },
    ];

    if (tabId === 'dashboard') {
      return <TaskDashboard/>
    }

    return (
      <div className={styles.listWrapper}>
        <Spin spinning={taskRequest.loading}>
          <ListTable
            noSpacing
            rowKey='taskId'
            columns={columns}
            scroll={{x: 'max-content'}}
            dataSource={taskData.list}
            onPageChange={onListPageChange}
            loading={taskRequest.loading}
            pagination={taskData.pagination}
          />
        </Spin>
      </div>
    );
  }

  const renderTaskModal = () => {
    return <TaskModal/>;
  };

  const renderTaskDrawer = () => {
    return <TaskDrawer/>;
  };

  if (i18nLoading) {
    return <PageLoading/>;
  }

  let pageStyle = {};

  if (tabId === 'dashboard') {
    pageStyle = {
      width: '100%',
      height: 'calc(100% - 64px)',
      position: 'absolute'
    }
  }

  return (
    <div style={{...pageStyle}}>
      <TaskContext.Provider value={{tabId, filterOptions, dateFormat, onListPageChange}}>
        {renderPageHeader()}
        {renderDataContent()}
        {renderTaskModal()}
        {renderTaskDrawer()}
      </TaskContext.Provider>
    </div>
  );
};

export default Index;

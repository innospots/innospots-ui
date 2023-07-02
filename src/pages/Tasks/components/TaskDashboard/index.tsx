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

import React, {useContext, useEffect, useState} from 'react';

import {Col, Dropdown, Pagination, Row, Space, Tag, Typography} from 'antd'

import {
  CalendarOutlined,
  ContainerOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  MessageOutlined
} from '@ant-design/icons'

import {useModel} from "umi";

import styles from './style.less'
import TaskContext from '../../contexts/TaskContext'
import {PRIORITY_TYPES, STATUS_TYPES} from '../../constants'
import UserAvatar from "@/components/UserAvatar";
import useI18n from "@/common/hooks/useI18n";
import PageLoading from '@/components/PageLoading';
import useModal from "@/common/hooks/useModal";
import {DRAWER_NAME} from "@/pages/Tasks/components/TaskDrawer";
import {MODAL_NAME} from "@/pages/Tasks/components/TaskModal";
import type {MenuProps} from 'antd';

const {Paragraph} = Typography;

const TaskDashboard: React.FC = () => {

  const {
    taskData,
    taskRequest,
    deleteTaskRequest
  } = useModel('Tasks');

  const {t} = useI18n(['common', 'task']);

  const [modal] = useModal(MODAL_NAME);
  const [drawer] = useModal(DRAWER_NAME);

  const {sessionData} = useModel('Account');

  const {tabId, onListPageChange} = useContext(TaskContext);

  const [initData, setInitData] = useState<any>({});

  useEffect(() => {
    if (tabId === 'dashboard') {
      formatInitData();
    }
  }, [taskData, tabId]);

  const formatInitData = () => {
    let initObj = {};

    (taskData.list || []).map((task) => {
      const initObjKeys = Object.keys(initObj)

      if (!initObjKeys.includes(task.taskStatus)) {
        initObj[task.taskStatus] = []
      }

      initObj[task.taskStatus].push(task)
    })

    setInitData(initObj);
  }

  const deleteCurTask = (id: number) => () => {
    return new Promise<void>(async (resolve) => {
      await deleteTaskRequest.runAsync(id);
      resolve();
    });
  };

  const renderStatusCol = () => {
    return (
      Object.keys(STATUS_TYPES).map((key) => {
        const status = STATUS_TYPES[key]
        const colList = initData[key] || []

        return (
          <Col span={6} key={key}>
            <Row justify="space-between" className={styles.cellTitle}>
              <Col>
                <Space size={4}>
                  <span> {t(status.text)} </span>
                  <span className={styles.cellNumber}>/{colList.length}</span>
                </Space>
              </Col>
              <Col>
                {/*<EllipsisOutlined className={styles.cellIcon}/>*/}
              </Col>
            </Row>

            <div className={styles.cellContent}>
              {renderTaskCard(colList)}
            </div>
          </Col>
        )
      })
    )
  }

  const renderTagsContent = (priority, tags) => {
    const taskPriority = PRIORITY_TYPES[priority]

    return (
      <Space size={[0, 4]} wrap>
        <Tag
          color={taskPriority.bgColor}
          style={{color: taskPriority.color}}
        >
          {t(taskPriority.text)}
        </Tag>

        {
          _.map(tags, (tag: any, index) => {
            return (
              <Tag
                key={[tag, index].join('-')}
                color={'#ecf0ff'}
                style={{color: '#53555a'}}
              >
                {tag}
              </Tag>
            )
          })
        }
      </Space>
    )
  }

  const getOperateMenu = (item: any) => {
    // 只有创建者可以展示编辑和删除按钮
    const isAuth = sessionData.userId === item.userId

    const onMenuClick = ({key}) => {
      switch (key) {
        case 'detail':
          drawer.show(item);
          break;
        case 'edit':
          modal.show(item);
          break;
        default:
          deleteCurTask(item.taskId)
      }
    };

    const menus: MenuProps['items'] = [
      {
        key: 'detail',
        icon: <ContainerOutlined/>,
        label: (
          <span>{t('common.button.detail')}</span>
        ),
      },
      {
        key: 'edit',
        icon: <EditOutlined/>,
        disabled: !isAuth,
        label: (
          <span>{t('common.button.edit')}</span>
        )
      },
      {
        key: 'delete',
        icon: <DeleteOutlined/>,
        disabled: !isAuth,
        label: (
          <span>{t('common.button.delete')}</span>
        )
      }
    ];

    return {
      items: menus,
      onClick: onMenuClick
    }
  }

  const renderTaskCard = (colList) => {

    return (
      colList.map((item, index) => {
        return (
          <div className={styles.taskCard} key={[item.taskId, index].join('-')}>
            <Row className={styles.cardTop}>
              <Col>
                <div className={styles.taskTitle}>
                  <Paragraph ellipsis={{rows: 3, tooltip: item.taskName}}>{item.taskName}</Paragraph>
                </div>
                <div className={styles.taskTag}>
                  {renderTagsContent(item.taskPriority, item.tags)}
                </div>
                <div className={styles.taskTime}>
                  <Space>
                    <CalendarOutlined/>

                    <Space>
                      <span>{item.startDate}</span>
                      <span>~</span>
                      <span>{item.endDate}</span>
                    </Space>
                  </Space>
                </div>
              </Col>
              <Col flex="20px">
                <Dropdown menu={getOperateMenu(item)}>
                  <EllipsisOutlined className={styles.cellIcon}/>
                </Dropdown>
              </Col>
            </Row>

            <Row justify="space-between" className={styles.cardBottom}>
              <Col>
                <Space>
                  <UserAvatar
                    size={28}
                    userInfo={{avatarKey: `/api/${item.principalAvatarKey}`}}
                    style={{width: 28, height: 28}}
                  />
                  <span>{item.principalUserName}</span>
                </Space>
              </Col>
              <Col>
                <Space size={4}>
                  <MessageOutlined/>

                  <span>
                    {item.commentCount}
                  </span>
                </Space>
              </Col>
            </Row>
          </div>
        )
      })
    )
  }

  const renderPageNode = () => {

    const page = taskData.pagination

    if (page && page.total) {
      return (
        <Row align="middle" justify="end" className={styles.pageNode}>
          <Col>
            <span style={{fontSize: 12}}>{t('common.table.pagination.total_count', page)}</span>
          </Col>
          <Col>
            <Pagination
              size="small"
              showLessItems
              showSizeChanger
              {...page}
              onChange={onListPageChange}
            />
          </Col>
        </Row>
      );
    }

    return null;
  };

  if (taskRequest.loading) {
    return <PageLoading/>;
  }

  return (
    <div className={styles.taskDashboard}>
      <Row gutter={16} className={styles.dashboardContent}>
        {renderStatusCol()}
      </Row>

      {renderPageNode()}
    </div>
  );
}

export default TaskDashboard;

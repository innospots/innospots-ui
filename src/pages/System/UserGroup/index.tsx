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

import _ from 'lodash';
import { useModel, history, useSearchParams } from 'umi';
import React, { useEffect, useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { EllipsisOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Col, message, Row, Spin, Input, Tree, Table, Switch, Popconfirm, Descriptions, Modal, Dropdown, Button, Space } from 'antd';

import useModal from '@/common/hooks/useModal';
import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import PageTitle from '@/components/PageTitle';
import UserAvatar from '@/components/UserAvatar';
import PageHelmet from '@/components/PageHelmet';
import InnoIcon from '@/components/Icons/InnoIcon';

import MemberModal, { MODAL_NAME as MEMBER_MODAL_NAME } from './components/MemberModal';
import UserGroupModal, { MODAL_NAME as USER_GROUP_MODAL_NAME } from './components/UserGroupModal';

import styles from './style.less';

interface DataType {
  realName: string;
  userName: string;
  email: string;
  operate: string;
}

const { TreeNode } = Tree;

const Index: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const {
    userGroups,
    groupUsers,
    userGroupOptions,
    userGroupsRequest,
    groupUsersRequest,
    deleteUserGroupRequest,
    updateGroupHeadUserRequest,
  } = useModel('User', (model) => ({
    userGroups: model.userGroups,
    groupUsers: model.groupUsers,
    userGroupOptions: model.userGroupOptions,
    userGroupsRequest: model.userGroupsRequest,
    groupUsersRequest: model.groupUsersRequest,
    deleteUserGroupRequest: model.deleteUserGroupRequest,
    updateGroupHeadUserRequest: model.updateGroupHeadUserRequest,
  }));

  const [memberQuery, setMemberQuery] = useState<any>({
    userName: ''
  });

  const [memberModal] = useModal(MEMBER_MODAL_NAME);
  const [userGroupModal] = useModal(USER_GROUP_MODAL_NAME);
  const { t, loading: i18nLoading } = useI18n(['user-group', 'role', 'common']);

  const currentGroup = useMemo(() => {
    if (userGroups.length) {
      if (!query.groupId) {
        return userGroups[0];
      }

      return userGroups.find((group: any) => group.groupId == query.groupId);
    }

    return null;
  }, [userGroups, query.groupId]);

  useEffect(() => {
    if (currentGroup) {
      groupUsersRequest.run(currentGroup.groupId, memberQuery);
    }
  }, [currentGroup, memberQuery.userName]);

  const [categoryCollapsed, setCategoryCollapsed] = useState(false);

  useEffect(() => {
    userGroupsRequest.run();
  }, []);

  const renderGroupInfo = () => {
    return (
      <div className={styles.groupInfo}>
        <Descriptions title={t('user-group.main.group_info.title')} extra={(
          <Space>
            <Button type="link" onClick={() => memberModal.show()}>{t('common.button.member_management')}</Button>
            {/* <Button type="link">{t('common.button.modify_head_user')}</Button> */}
          </Space>
        )}>
          <Descriptions.Item label={t('user-group.name.label')}>
            {currentGroup?.groupName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('user-group.user_count.label')}>
            {currentGroup?.userCount || 0}
          </Descriptions.Item>
          <Descriptions.Item label={t('user-group.head_user.label')}>
            {currentGroup?.headUserId || '-'}
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  const renderMemberList = () => {
    const columns: ColumnsType<DataType> = [
      {
        title: t('role.main.column.name'),
        key: 'realName',
        dataIndex: 'realName',
        render: (name: string, record: any) => {
          return (
            <Row className={styles.nameWrapper} align="middle">
              <Col flex="38px">
                <UserAvatar size={28} userInfo={record} style={{ width: 28, height: 28 }} />
              </Col>
              <Col>
                <span>{name || '-'}</span>
              </Col>
            </Row>
          );
        },
      },
      {
        title: t('role.main.column.username'),
        key: 'userName',
        dataIndex: 'userName',
      },
      {
        title: t('role.main.column.email'),
        key: 'email',
        dataIndex: 'email',
      },
      {
        title: '是否负责人',
        width: 120,
        key: 'userId',
        dataIndex: 'userId',
        align: 'center',
        render: (userId: string, record: any) => {
          const isHeadUser = currentGroup?.headUserId == userId;
          return (
            <Popconfirm
              placement="topLeft"
              disabled={isHeadUser}
              title={t(`user-group.${isHeadUser ? 'unset' : 'set'}.head_user`)}
              onConfirm={async () => {
                const result = await updateGroupHeadUserRequest.runAsync(currentGroup?.groupId, userId);
                if (result) {
                  message.success(t('common.tips.success'));
                  userGroupsRequest.run();
                  groupUsersRequest.run(currentGroup.groupId, memberQuery);
                }
              }}
            >
              <Switch
                checked={isHeadUser}
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
              />
            </Popconfirm>
          );
        },
      },
    ];

    return (
      <div className={styles.memberList}>
        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <span className={styles.title}>{t('user-group.member_list.title')}</span>
          </Col>
          <Col>
            <Input.Search
              allowClear
              style={{ width: 200 }}
              placeholder={t('common.input.placeholder')}
              onSearch={(value) => setMemberQuery({ userName: value })}
            />
          </Col>
        </Row>
        <Table
          rowKey="userId"
          columns={columns}
          loading={groupUsersRequest.loading}
          dataSource={groupUsers}
        />
      </div>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  const renderPageTitle = () => {
    return (
      <PageTitle
        leftContent={
          <Row gutter={40} align="middle">
            <Col>
              <span className="page-header-title">{t('user-group.main.heading_title')}</span>
            </Col>
          </Row>
        }
      />
    );
  };

  const groupMenuClick =
    (group: any) =>
    ({ key, domEvent }: any) => {
      domEvent.stopPropagation();
      if (key === 'edit') {
        userGroupModal.show(group);
      } else if (key === 'delete') {
        Modal.confirm({
          title: t('common.text.delete_confirmation'),
          onOk: async () => {
            try {
              const result = await deleteUserGroupRequest.runAsync(group.groupId);
              if (result) {
                userGroupsRequest.run();

                message.success(t('common.error_message.delete.success'));
              }
            } catch (error) {}
          },
        });
      }
    };

  const renderGroupMenu = (item: any) => {
    const items = [
      { label: t('common.button.edit'), key: 'edit' }, // 菜单项务必填写 key
      { label: t('common.button.delete'), key: 'delete' },
    ];
    return (
      <Dropdown menu={{ items, onClick: groupMenuClick(item) }}>
        <span className="g-button">
          <EllipsisOutlined />
        </span>
      </Dropdown>
    );
  };

  const renderTreeNodes = (data: any[]) => {
    return _.map(data, (item) => {
      const nodeTitle = (
        <Row className={styles.groupTitle} align="middle" gutter={24}>
          <Col>
            <span>{item.groupName}</span>
          </Col>
          <Col>
            <div className={styles.groupMenu}>{renderGroupMenu(item)}</div>
          </Col>
        </Row>
      );
      if (item.children) {
        return (
          <TreeNode title={nodeTitle} key={item.groupId}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={nodeTitle} key={item.groupId} />;
    });
  };

  const renderUserGroups = () => {
    if (userGroupsRequest.loading) {
      return (
        <div style={{ padding: 20 }}>
          <Spin />
        </div>
      );
    }

    return (
      <div className={styles.groupPane}>
        <div className={styles.inner}>
          <Row className={styles.header} align="middle" justify="space-between">
            <Col>
              <Row gutter={8} align="middle">
                <Col>
                  <span className={styles.title}>{t('user-group.main.group_panel.title')}</span>
                </Col>
                <Col>
                  <span
                    className="g-button"
                    title={t('common.tooltip.category.create')}
                    onClick={() => userGroupModal.show()}
                  >
                    <InnoIcon type="folder-add" size={16} />
                  </span>
                </Col>
              </Row>
            </Col>
          </Row>
          <div className={styles.groupTree}>
            {currentGroup && (
              <Tree
                showLine
                showIcon
                defaultExpandAll
                defaultSelectedKeys={[currentGroup.groupId + '']}
                onSelect={(selectedKeys, info) => {
                  history.push({
                    pathname: '/system/user-group',
                    query: {
                      groupId: selectedKeys[0],
                    },
                  });
                }}
              >
                {renderTreeNodes(userGroupOptions)}
              </Tree>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPageContent = () => {
    let colProps = categoryCollapsed
      ? {
          span: 0,
        }
      : {
          flex: '400px',
        };

    return (
      <div className={styles.pageContainer}>
        <Row gutter={16}>
          <Col {...colProps}>{renderUserGroups()}</Col>
          <Col flex="1">
            {renderGroupInfo()}
            {renderMemberList()}
          </Col>
        </Row>
      </div>
    );
  };

  const renderGroupModal = () => {
    return (
      <UserGroupModal
        onSuccess={() => {
          userGroupsRequest.run();
        }}
      />
    );
  };

  const renderMemberModal = () => {
    return (
      <MemberModal
        groupId={currentGroup?.groupId}
        onSuccess={() => {
          userGroupsRequest.run();
          groupUsersRequest.run(currentGroup?.groupId);
        }}
      />
    );
  };

  return (
    <>
      <PageHelmet title={t('user-group.main.heading_title')} />
      {renderPageTitle()}
      {renderPageContent()}
      {renderGroupModal()}
      {renderMemberModal()}
    </>
  );
};

export default Index;

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

import React, { useEffect } from 'react';

import { Col, Row, Space, Typography, TableColumnsType } from 'antd';
import {
  CaretRightOutlined,
  LockOutlined,
  PauseOutlined,
  UserAddOutlined,
} from '@ant-design/icons';

import { useModel } from 'umi';
import { useDeepCompareEffect, useMemoizedFn, useSetState } from 'ahooks';

import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

import PageLoading from '@/components/PageLoading';
import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import UserAvatar from '@/components/UserAvatar';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import { KeyValues } from '@/common/types/Types';

import MemberModal, { MODAL_NAME } from './components/MemberModal';
import MemberDetailModal, { MODAL_NAME as DETAIL_MODAL_NAME } from './components/MemberDetailModal';
import UpdatePasswordModal, {
  MODAL_NAME as PASSWORD_MODAL_NAME,
} from './components/UpdatePasswordModal';
import UserConfigContext from './components/contexts/UserConfigContext';

import StatusTag, { Status } from '@/components/StatusTag';
import IconButton from '@/components/IconButton';

import styles from './style.less';

const Index: React.FC = () => {
  const { sessionData } = useModel('Account');
  const { userData, changeStatusRequest, userRequest, deleteUserRequest } = useModel('User');

  const currentAdmin = sessionData?.admin;

  const { fetchRolesRequest } = useModel('Role', (model) => ({
    fetchRolesRequest: model.fetchRolesRequest,
  }));

  const [memberModal] = useModal(MODAL_NAME);
  const [passwordModal] = useModal(PASSWORD_MODAL_NAME);
  const [detailModal] = useModal(DETAIL_MODAL_NAME);

  const { t, loading: i18nLoading } = useI18n(['user', 'common']);

  const [queryData, setQueryData] = useSetState({
    ...DEFAULT_PAGINATION_SETTINGS,
    queryInput: '',
  });

  useEffect(() => {
    fetchRolesRequest.run();
  }, []);

  const fetchMemberData = () => {
    userRequest.run(queryData);
  };

  useDeepCompareEffect(() => {
    fetchMemberData();
  }, [queryData]);

  const deleteCurMember = (id: number) => () => {
    return new Promise<void>(async (resolve) => {
      await deleteUserRequest.runAsync(id);
      resolve();
    });
  };

  const changeMemberStatus = (id: string, status: string) => () => {
    changeStatusRequest.run(id, status === 'ONLINE' ? 'OFFLINE' : 'ONLINE');
  };

  const onListPageChange = useMemoizedFn((curPage) => {
    setQueryData({
      page: curPage,
    });
  });

  const renderPageHeader = () => {
    return (
      <PageTitle
        title={t('user.main.heading_title')}
        rightContent={{
          search: {
            placeholder: t('user.main.input.search.placeholder'),
            onSearch: (value: string) => {
              setQueryData({
                queryInput: value,
              });
            },
          },
          button: {
            icon: <UserAddOutlined />,
            label: t('user.main.button.add'),
            itemKey: 'User-createUser',
            onClick: () => {
              memberModal.show();
            },
          },
        }}
      />
    );
  };

  // 新建、编辑成功后需要刷新列表
  const onFormSubmitSuccess: any = (modalType) => {
    if (modalType === 'add') {
      setQueryData({
        ...queryData,
        queryInput: '',
      });
    } else {
      setQueryData({
        ...queryData,
      });
    }

    fetchMemberData();
  };

  const renderDataContent = () => {
    const columns: TableColumnsType<KeyValues> = [
      {
        title: t('user.main.column.name'),
        key: 'realName',
        width: 250,
        dataIndex: 'realName',
        render: (name: string, record: any) => {
          return (
            <Row align="middle" gutter={10}>
              <Col flex="50px">
                <UserAvatar userInfo={record} />
              </Col>
              <Col flex="170px">
                <Typography.Text ellipsis>{name || '-'}</Typography.Text>
              </Col>
            </Row>
          );
        },
      },
      {
        title: t('user.main.column.username'),
        key: 'userName',
        dataIndex: 'userName',
      },
      // {
      //   title: t('user.main.column.email'),
      //   key: 'email',
      //   dataIndex: 'email',
      // },
      {
        title: t('user.main.column.role'),
        dataIndex: ['roleNames', '0'],
        render: (roleName: string) => roleName || '-',
      },
      {
        title: t('user.main.column.visit_time'),
        dataIndex: 'lastAccessTime',
        render: (value: string) => value || '-',
      },
      {
        title: t('user.main.column.status'),
        key: 'status',
        width: 112,
        dataIndex: 'status',
        render: (status: Status) => {
          return <StatusTag status={status} />;
        },
      },
      {
        title: t('common.table.column.action'),
        key: 'operate',
        dataIndex: 'operate',
        width: 140,
        align: 'center',
        render: (operate: any, record: any) => {
          const isAdmin = record.admin || record.roleIds?.includes(1);

          return (
            <>
              <Space size={8}>
                <IconButton
                  icon={record.status === 'ONLINE' ? <PauseOutlined /> : <CaretRightOutlined />}
                  tooltip={t(
                    record.status === 'ONLINE' ? 'common.text.deactivate' : 'common.text.activate',
                  )}
                  permissions="User-updateUserStatus"
                  onClick={changeMemberStatus(record.userId, record.status)}
                />

                <IconButton
                  icon="eye"
                  tooltip={t('common.text.preview')}
                  onClick={() => {
                    detailModal.show(record);
                  }}
                />

                <IconButton
                  icon="edit"
                  tooltip={t('common.tooltip.edit')}
                  permissions="User-updateUser"
                  onClick={() => {
                    memberModal.show(record);
                  }}
                />
                <IconButton
                  icon="delete"
                  disabled={isAdmin}
                  permissions="User-deleteUser"
                  tooltip={t('common.tooltip.delete')}
                  popConfirm={{
                    title: t('common.text.delete_confirmation'),
                    okButtonProps: {
                      loading: deleteUserRequest.loading,
                    },
                    onConfirm: deleteCurMember(record.userId),
                  }}
                />
                <IconButton
                  icon={<LockOutlined />}
                  disabled={(!currentAdmin ? isAdmin : false)}
                  tooltip={t('common.tooltip.edit_password')}
                  permissions="User-changePassword"
                  onClick={() => {
                    passwordModal.show({
                      userId: record.userId,
                    });
                  }}
                />
              </Space>
            </>
          );
        },
      },
    ];

    return (
      <div className={styles.listWrapper}>
        <ListTable
          rowKey="userId"
          columns={columns}
          loading={userRequest.loading}
          dataSource={userData.list}
          pagination={userData.pagination}
          onPageChange={onListPageChange}
        />
      </div>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <UserConfigContext.Provider value={{ onFormSubmitSuccess }}>
      {renderPageHeader()}
      {renderDataContent()}
      <MemberModal />
      <MemberDetailModal />
      <UpdatePasswordModal />
    </UserConfigContext.Provider>
  );
};

export default Index;

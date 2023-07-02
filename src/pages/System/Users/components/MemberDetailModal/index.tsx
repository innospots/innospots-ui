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

import React, { useState } from 'react';

import { useModel } from 'umi';

import { Col, Row, Tabs } from 'antd';
import { MailOutlined, MobileOutlined, UngroupOutlined } from '@ant-design/icons';
import { useDeepCompareEffect, useMemoizedFn, useSetState } from 'ahooks';

import NiceModal from '@/components/Nice/NiceModal';
import ListTable from '@/components/ListTable';
import UserAvatar from '@/components/UserAvatar';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import styles from './style.less';

export const MODAL_NAME = 'MemberDetailModal';

const { TabPane } = Tabs;
const tabList = ['login', 'operation'];

const MemberDetailModal: React.FC = () => {
  const [logType, setLogType] = useState('login');

  const { t } = useI18n(['user', 'common']);

  const [operateQueryData, setOperateQueryData] = useSetState({});

  const [loginQueryData, setLoginQueryData] = useSetState<{
    page?: number;
    size?: number;
    sort?: string;
  }>({
    sort: 'loginTime',
  });

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const { visible, initValues: member } = modalInfo;

  const { loginLogData, operateLogData, loginLogRequest, operateLogRequest } = useModel('Log');

  useDeepCompareEffect(() => {
    if (visible && member) {
      fetchOperateLogList();
    }
  }, [visible, member, operateQueryData]);

  useDeepCompareEffect(() => {
    if (visible && member) {
      fetchLoginLog();
    }
  }, [visible, member, loginQueryData]);

  const onTabChange = useMemoizedFn((activeKey) => {
    setLogType(activeKey);
  });

  const fetchLoginLog = useMemoizedFn(() => {
    loginLogRequest.run({
      usernames: member.userName,
      ...loginQueryData,
    });
  });

  const fetchOperateLogList = useMemoizedFn(() => {
    operateLogRequest.run({
      usernames: member.userName,
      ...operateQueryData,
    });
  });

  const onListPageChange = useMemoizedFn((type) => (page: number, size: number) => {
    if (type === 'login') {
      setLoginQueryData({
        page,
        size,
      });
    } else {
      setOperateQueryData({
        page,
        size,
      });
    }
  });

  const renderUserCard = () => {
    const { email, mobile, realName, roleNames, department } = member || {};

    return (
      <div className={styles.userCard}>
        <div className={styles.avatar}>
          <UserAvatar size={110} userInfo={member} />
          <p className={styles.name}>{realName}</p>
          <p className={styles.roleName}>{roleNames?.[0] || '-'}</p>
        </div>
        <div className={styles.information}>
          <h3 className={styles.title}>{t('user.form.info.label')}</h3>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>
              <MailOutlined /> {t('user.form.input.email.label')}:
            </p>
            <p className={styles.infoValue}>{email || t('common.text.empty')}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>
              <MobileOutlined /> {t('user.form.input.mobile.label')}:
            </p>
            <p className={styles.infoValue}>{mobile || t('common.text.empty')}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>
              <UngroupOutlined /> {t('user.form.input.department.label')}:
            </p>
            <p className={styles.infoValue}>{department || t('common.text.empty')}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderLogContent = () => {
    return (
      <div>
        <Tabs size="large" activeKey={logType} onChange={onTabChange}>
          {tabList.map((tab) => (
            <TabPane tab={t(`user.form.tab.${tab}_log`)} key={tab} />
          ))}
        </Tabs>
        <div className={styles.logList}>
          {logType === 'login' ? renderLoginLog() : renderOperateLog()}
        </div>
      </div>
    );
  };

  const renderOperateLog = () => {
    const columns = [
      {
        title: 'ID',
        width: 80,
        dataIndex: 'logId',
      },
      {
        title: t('user.activity.operation_log.column.operation_time'),
        dataIndex: 'operateTime',
      },
      {
        title: t('user.activity.operation_log.column.module'),
        dataIndex: 'module',
      },
      {
        title: t('user.activity.operation_log.column.operation_type'),
        dataIndex: 'operateType',
      },
      {
        title: t('user.activity.operation_log.column.resource_type'),
        dataIndex: 'resourceType',
      },
      {
        title: t('user.activity.operation_log.column.resource_name'),
        dataIndex: 'resourceName',
      },
      {
        title: t('user.activity.operation_log.column.operation'),
        dataIndex: 'detail',
      },
    ];

    return (
      <ListTable
        noSpacing
        size="small"
        rowKey="logId"
        columns={columns}
        scroll={{
          x: 760,
          y: 400,
        }}
        dataSource={operateLogData.list}
        pagination={operateLogData.pagination}
        loading={operateLogRequest.loading}
        onPageChange={onListPageChange('operate')}
      />
    );
  };

  const renderLoginLog = () => {
    const columns = [
      {
        title: 'ID',
        width: 80,
        dataIndex: 'logId',
      },
      {
        title: t('user.activity.login_log.column.login_time'),
        dataIndex: 'loginTime',
      },
      {
        title: t('user.activity.login_log.column.from_ip'),
        dataIndex: 'ip',
      },
      {
        title: t('user.activity.login_log.column.browser'),
        dataIndex: 'browser',
      },
      {
        title: t('user.activity.login_log.column.os'),
        dataIndex: 'os',
      },
      {
        title: t('user.activity.login_log.column.status'),
        dataIndex: 'status',
      },
      {
        title: t('user.activity.operation_log.column.operation'),
        dataIndex: 'detail',
      },
    ];
    return (
      <ListTable
        noSpacing
        size="small"
        rowKey="logId"
        columns={columns}
        scroll={{
          x: 760,
          y: 400,
        }}
        dataSource={loginLogData.list}
        pagination={loginLogData.pagination}
        loading={loginLogRequest.loading}
        onPageChange={onListPageChange('login')}
      />
    );
  };

  return (
    <NiceModal
      destroyOnClose
      width={1124}
      footer={null}
      style={{ top: 20 }}
      visible={visible}
      title={t('user.activity.title')}
      onCancel={modal.hide}
    >
      <Row gutter={[40, 0]}>
        <Col flex="290px">{renderUserCard()}</Col>
        <Col flex="825px" style={{ overflow: 'hidden' }}>
          {renderLogContent()}
        </Col>
      </Row>
    </NiceModal>
  );
};

export default MemberDetailModal;

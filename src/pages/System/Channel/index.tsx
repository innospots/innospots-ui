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

import { Button, message, Popconfirm, Space, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useModel } from 'umi';

import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import ChannelModal, { MODAL_NAME } from './components/ChannelModal';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import PageLoading from '@/components/PageLoading';
import PermissionSection, { usePermission } from '@/components/PermissionSection';
import IconButton from '@/components/IconButton';
import { KeyValues } from '@/common/types/Types';

import styles from './style.less';

interface DataType {
  status: string;
  operate: string;
  channelName: string;
  channelType: string;
}

const Index: React.FC = () => {
  const { channels, channelsRequest, deleteChannelRequest, changeChannelStatusRequest } =
    useModel('Notification');

  const { t, loading: i18nLoading } = useI18n(['notification', 'common']);
  const [updateStatusAuth] = usePermission('NotificationChannel-updateStatus');

  const [channelModal] = useModal(MODAL_NAME);

  useEffect(() => {
    channelsRequest.run();
  }, []);

  const deleteCurChannel = (id: string) => () => {
    return new Promise<void>(async (resolve) => {
      await deleteChannelRequest.runAsync(id);
      resolve();
    });
  };

  const handleChangeChannelStatus = async (record) => {
    const result = await changeChannelStatusRequest.runAsync(record);

    if (result) {
      message.success(t('common.notification.success.title'));
    }else {
      message.success(t('common.notification.fail.title'));
    }
  };

  const renderPageHeader = () => {
    return (
      <>
        <PageTitle title={t('notification.channel.title')} />
        {/*<Space className={styles.headerButton}>*/}
        {/*  <PermissionSection itemKey="NotificationChannel-createChannel">*/}
        {/*    <Button type="primary" icon={<PlusOutlined />} onClick={() => channelModal.show()}>*/}
        {/*      {t('notification.channel.button.add')}*/}
        {/*    </Button>*/}
        {/*  </PermissionSection>*/}
        {/*</Space>*/}
      </>
    );
  };

  const renderDataContent = () => {
    const columns: KeyValues[] = [
      {
        title: t('notification.channel.column.channel_name'),
        key: 'channelName',
        dataIndex: 'channelName',
      },
      {
        title: t('notification.channel.column.channel_type'),
        key: 'channelType',
        dataIndex: 'channelType',
      },
      {
        title: t('notification.channel.column.status'),
        dataIndex: 'status',
        render: (status, record) => {
          return updateStatusAuth ? (
            <Popconfirm
              title={t(`是否确认${status === 'ONLINE' ? '停用' : '启用'}该渠道？`)}
              okText={t('common.button.confirm')}
              cancelText={t('common.button.cancel')}
              placement="left"
              okButtonProps={{
                loading: changeChannelStatusRequest.loading,
              }}
              onConfirm={() => handleChangeChannelStatus(record)}
            >
              <Switch checked={status === 'ONLINE'} />
            </Popconfirm>
          ) : (
            <Switch disabled checked={status === 'ONLINE'} />
          );
        },
      },
      {
        title: t('notification.channel.column.action'),
        dataIndex: 'operate',
        width: 80,
        align: 'center',
        render: (operate: any, record: any) => {
          if (record.channelType === 'INBOX' || record.channelType === 'EMAIL') return '-';
          return (
            <>
              <Space size={8}>
                <IconButton
                  icon="edit"
                  tooltip={t('common.button.edit')}
                  permissions="NotificationChannel-updateChannel"
                  onClick={() => channelModal.show(record)}
                />

                {record.status === 'OFFLINE' && (
                  <IconButton
                    icon="delete"
                    tooltip={t('common.button.delete')}
                    popConfirm={{
                      title: t('common.text.delete_confirmation'),
                      okButtonProps: {
                        loading: deleteChannelRequest.loading,
                      },
                      onConfirm: deleteCurChannel(record.messageChannelId),
                    }}
                    permissions="NotificationChannel-deleteChannel"
                  />
                )}
              </Space>
            </>
          );
        },
      },
    ];

    return (
      <div className={styles.listWrapper}>
        <ListTable
          columns={columns}
          rowKey="messageChannelId"
          dataSource={channels}
          loading={channelsRequest.loading}
        />
      </div>
    );
  };

  const renderChannelModal = () => {
    return <ChannelModal />;
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageHeader()}
      {renderDataContent()}
      {renderChannelModal()}
    </>
  );
};

export default Index;

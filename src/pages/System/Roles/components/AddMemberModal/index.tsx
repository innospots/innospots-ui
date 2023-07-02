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

import React, { useEffect, useState } from 'react';

import { useModel } from 'umi';
import { useMemoizedFn } from 'ahooks';

import { message, Spin, Transfer } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import UserAvatar from '@/components/UserAvatar';
import NiceModal from '@/components/Nice/NiceModal';

import styles from './style.less';
import useModal from '@/common/hooks/useModal';

export const MODAL_NAME = 'AddMemberModal';

type AddMemberModalProps = {
  roleId: number;
  currentUsers: number[];
};

const AddMemberModal: React.FC = () => {
  const { t } = useI18n(['role', 'common']);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, initValues = {} } = modalInfo;
  const { roleId, currentUsers } = initValues;
  const { userData, userRequest } = useModel('User');
  const { fetchRolesRequest, roleUserListRequest, updateMemberOfRoleRequest } = useModel('Role');

  useEffect(() => {
    if (visible && roleId) {
      fetchMemberData();
    }
  }, [visible, roleId]);

  useEffect(() => {
    if (visible) {
      setTargetKeys([...currentUsers]);
    }
  }, [visible, currentUsers]);

  const fetchMemberData = async () => {
    try {
      await userRequest.runAsync();
    } catch (e) {}
  };

  const saveMemberOfRole = async () => {
    try {
      const result = await updateMemberOfRoleRequest.runAsync(roleId, {
        userIds: targetKeys,
      });

      if (result) {
        fetchRolesRequest.run();
        roleUserListRequest.run(roleId);
        message.success(t('common.error_message.save.success'));
        modal.hide();
      }
    } catch (e) {}
  };

  const handleSaveData = useMemoizedFn(() => {
    saveMemberOfRole();
  });

  const handleTransferChange = useMemoizedFn((targetKeys) => {
    setTargetKeys(targetKeys);
  });

  const renderTransferItem = useMemoizedFn((item: any) => {
    const itemLabel = (
      <div className={styles.transferItem}>
        <div className={styles.icon}>
          <UserAvatar size={38} userInfo={item} />
        </div>
        <div className={styles.content}>
          <p className={styles.realName}>{item.realName}</p>
          <p className={styles.userName}>{item.userName}</p>
        </div>
      </div>
    );

    return {
      label: itemLabel,
      value: item.realName,
    };
  });

  const renderContent = () => {
    if (userRequest.loading) {
      return (
        <div className="g-loading">
          <Spin />
        </div>
      );
    }

    return (
      <Transfer
        oneWay
        targetKeys={targetKeys}
        titles={[t('role.form.user.all'), t('role.form.user.selected')]}
        dataSource={userData.list}
        listStyle={{
          width: 328,
          height: 360,
        }}
        render={renderTransferItem}
        rowKey={(record) => record.userId}
        onChange={handleTransferChange}
      />
    );
  };

  return (
    <NiceModal
      width={748}
      visible={visible}
      title={t('role.main.button.add_user')}
      okButtonProps={{
        loading: updateMemberOfRoleRequest.loading,
      }}
      onOk={handleSaveData}
      onCancel={modal.hide}
    >
      {renderContent()}
    </NiceModal>
  );
};

export default AddMemberModal;

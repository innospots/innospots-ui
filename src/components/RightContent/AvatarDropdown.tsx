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
import { LogoutOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useModel } from 'umi';
import UserAvatar from '@/components/UserAvatar';
import HeaderDropdown from '../HeaderDropdown';
import useI18n from '@/common/hooks/useI18n';

import { saveSessionData } from '@/common/utils';

import styles from './index.less';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const [userInfo, setUserInfo] = useState({});

  const { logout, sessionData, setSessionData } = useModel('Account');
  const { userDetailRequest } = useModel('User', model => ({
    userDetailRequest: model.userDetailRequest
  }));

  const { t } = useI18n('account');

  useEffect(() => {
    if (sessionData?.userId) {
      fetchUserInfo(sessionData?.userId)
    }
  }, [ sessionData?.userId ]);

  const fetchUserInfo = async (userId: number) => {
    const result = await userDetailRequest.runAsync(userId);
    if (result) {
      const userData = {
        ...sessionData,
        ...result
      };
      setUserInfo(userData);
      setSessionData(userData);
      saveSessionData(userData);
    }
  }

  const onMenuClick = ({ key }) => {
    switch (key) {
      case 'logout':
        logout();
        break;
    }
  };

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!sessionData || !sessionData.userId || userDetailRequest.loading) {
    return loading;
  }

  const userName = sessionData.userName || 'I';

  return (
    <HeaderDropdown menu={{
      items: [{
        key: 'logout',
        icon: <LogoutOutlined />,
        label: t('account.login.button.logout')
      }],
      onClick: onMenuClick
    }}>
      <div className={`${styles.action} ${styles.account}`}>
        <div className={styles.avatar}>
          <UserAvatar userInfo={userInfo} size={24} />
        </div>
        <span className={`${styles.name} anticon`}>{userName}</span>
      </div>
    </HeaderDropdown>
  );
};

export default AvatarDropdown;

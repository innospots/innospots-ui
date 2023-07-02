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
import {Col, Row, Space} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';
import {getFormattedLocale, getSessionData} from '@/common/utils';
import styles from './index.less';
import useI18n from '@/common/hooks/useI18n';
import {fetchMemberDetail} from '@/services/User';
import {fetchLoginFilterOptions} from '@/services/Log';
import {getWorkspaceInfoNumber} from '@/services/Workspace';
import FlagIcon from "@/components/Icons/FlagIcon";
import UserAvatar from "@/components/UserAvatar";

const Index: React.FC = () => {
  const [workspaceInfoData, setWorkspaceInfoData] = useState({});
  const [userDetail, setUserDetail] = useState({});
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  useEffect(() => {
    const userId = getSessionData()?.userId;
    fetchMemberDetail(userId).then((payload: any) => {
      setUserDetail(payload);
    });
    fetchLoginFilterOptions('latest').then((payload: any) => {
      setWorkspaceInfoData(payload);
    });
    getWorkspaceInfoNumber().then((payload: any) => {
      setUnreadMsgCount(payload);
    });
  }, []);

  const {t} = useI18n(['common', 'workspace']);
  const [currentLocale, , , currentFlagCode] = getFormattedLocale();
  const unreadNumText = t('workspace.welcome.unread_msg');
  const leftIndex = unreadNumText?.indexOf('{');
  const rightIndex = unreadNumText?.length - 4;
  const avatarKey = {
    avatarKey: userDetail['avatarKey']
  }
  return (
    <Row className={styles.content}>
      <Col className={styles.userInfo} span={12}>
        <div>
          <Space size={16}>
            <div className={styles.avatar}>
              <UserAvatar size={38} userInfo={avatarKey}/>
            </div>
            <span className={styles.userName}>
              {t('workspace.welcome.title')}
              {userDetail['userName']}！
            </span>
          </Space>
        </div>
        <Row className={styles.userMsgNotice}>
          <Col><ExclamationCircleOutlined style={{color: '#F57A60'}}/></Col>
          <Col>{unreadNumText?.slice(0, leftIndex)} </Col>
          <Col style={{color: '#1818ff'}}>{unreadMsgCount}</Col>
          <Col> {unreadNumText?.slice(leftIndex + 2, rightIndex)}
            <span style={{color: '#1818ff', marginLeft: -4}}> {unreadNumText?.slice(rightIndex)}</span>
          </Col>
        </Row>
      </Col>

      <Col className={styles.loginInfo} span={6}>
        <div className={styles.currentLoc}>
          <p className={styles.label}>{t('workspace.welcome.login.location')}</p>
          <p className={styles.value}>
            <Space>
              <FlagIcon code={currentFlagCode}/>
              <span>{workspaceInfoData['city']}</span>
              <span>{workspaceInfoData['province']}</span>
            </Space>
          </p>
        </div>
      </Col>
      <Col span={6}>
        <div className={styles.latesLogin}>
          <p className={styles.label}>{t('workspace.welcome.login.time')}</p>
          <p className={styles.value}>{workspaceInfoData['loginTime']}</p>
        </div>
        <div className={styles.latestLoc}>
          <p className={styles.label}>{t('workspace.welcome.login.recent_location')}</p>
          <p className={styles.value}>
            <Space>
              <FlagIcon code={currentFlagCode}/>
              <span>{workspaceInfoData['recentCity']}</span>
              <span>{workspaceInfoData['recentProvince']}</span>
            </Space>
          </p>
        </div>
      </Col>
    </Row>
  );
};
export default Index;

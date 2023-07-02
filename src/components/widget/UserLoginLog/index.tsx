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
import {Card, List, Space, Avatar, Skeleton, Typography, Timeline, Divider} from 'antd';
const { Text } = Typography;

import styles from './index.less';
import useI18n from '@/common/hooks/useI18n';
import * as Service from '@/services/Log';
import { getDateDiff } from '@/common/utils/Datetime';
import Meta from 'antd/es/card/Meta';
import {AJAX_PREFIX} from "@/common/constants";
import UserAvatar from "@/components/UserAvatar";

const Index: React.FC<{ itemsNum?: number }> = ({ itemsNum }) => {
  const [loginLogList, setLoginLogList] = useState([]);
  const { t } = useI18n('workspace');
  useEffect(() => {
    Service.fetchLoginLog().then((payload: any) => {
      const loginLogs = payload?.list || [];
      setLoginLogList(loginLogs.slice(0, itemsNum || 5) || []);
    });
  }, []);
  const logTimeLineRender = () => {
    let logTimeLineItems: any[] = [];
    loginLogList.map((item) => {
      logTimeLineItems.push(
        <Timeline.Item label={getDateDiff(item['loginTime'])} position="left" color="#1245FA" className={styles.timelineItem}>
          <Meta
            className={styles.metaInfo}
            avatar={
              <div style={{ width: 48, height: 48 }} >
                <UserAvatar size={48} userInfo={{avatarKey:item['userAvatar']}} />
              </div>
            }
            title={<span className={styles.name}>{item['userName'] || '---'}</span>}
            description={
              <span style={{ fontSize: 12 }}>
              {item['userRoleName']}
              </span>
            }
          />
          <Divider className={styles.loginTimeDivider} />
        </Timeline.Item>,
      );
    });
    return logTimeLineItems;
  };
  return (
    <Card title={t('workspace.login_users.title')} className={styles.coreWidget}>
      <Timeline mode="left"  className={styles.userLoginTimeline}>
        {logTimeLineRender()}
      </Timeline>
    </Card>
  );
};
export default Index;

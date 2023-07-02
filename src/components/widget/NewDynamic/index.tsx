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

import { Card, List, Row, Col, Tooltip, Skeleton } from 'antd';

import styles from './index.less';
import useI18n from '@/common/hooks/useI18n';
import * as Service from '@/services/Log';
import { getDateDiff } from '@/common/utils/Datetime';
import UserAvatar from "@/components/UserAvatar";

const Index: React.FC<{ itemsNum?: number }> = ({ itemsNum }) => {
  const [operateLogs, setOperateLogList] = useState([]);
  useEffect(() => {
    Service.getOperateLogList().then((payload: any) => {
      setOperateLogList((payload.list || []).slice(0, itemsNum || 5) || []);
    });
  }, []);

  const { t } = useI18n('workspace');

  return (
    <Card
      title={t('workspace.recent_activities.title')}
      className={styles.coreWidget}
      bodyStyle={{ paddingTop: 8 }}
    >
      <List
        itemLayout="horizontal"
        dataSource={operateLogs}
        renderItem={(item) => (
          <List.Item className={styles.loginLogs}>
            <Skeleton avatar title={false} loading={false} active>
              <List.Item.Meta
                avatar={
                  <div style={{ width: 48, height: 48 }} >
                    <UserAvatar size={48} userInfo={{avatarKey:`/api/${item['userAvatar']}`}} />
                  </div>
                  }
                title={
                  <Tooltip title={
                    <Row gutter={4}>
                      <Col>{item['username'] || '---'}</Col>
                      <Col>{item['operate'] || '---'}</Col>
                      <Col>{item['resourceName'] || '---'}</Col>
                      <Col>{item['detail'] || '---'}</Col>
                    </Row>
                  }>
                    <p className={styles.hideText}>
                      <span className={styles.name}>{item['username'] || '---'}</span>
                      <span style={{color: '#1818ff'}}>{item['operate'] || '---'}</span>
                      <span className={styles.detail}>{item['resourceName'] || '---'}</span>
                      <span className={styles.detail}>{item['detail'] || '---'}</span>
                    </p>
                  </Tooltip>
                }
                description={
                  <span className={styles.date}>{getDateDiff(item['operateTime'])}</span>
                }
              />
            </Skeleton>
          </List.Item>
        )}
      />
    </Card>
  );
};
export default Index;

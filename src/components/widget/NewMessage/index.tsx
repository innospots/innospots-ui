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
import { Card, List, Space } from 'antd';
import styles from './index.less';
import useI18n from '@/common/hooks/useI18n';
import * as Service from '@/services/Workspace';
import { getLatestNews } from '@/services/Workspace';

const Index: React.FC<{ itemsNum?: number }> = ({ itemsNum }) => {
  const { t } = useI18n('workspace');
  const [newMessage, setNewMessage] = useState<any[]>([]);
  const [messageThumb, setMessageThumb] = useState<string>('');

  useEffect(() => {
    // messageInfoRequest.run( {
    //   page: 1,
    //   size: msgNum || 3,
    //   asc: false,
    //   sort: 'createdTime',
    //   paging: false
    // });
    Service.getLatestNews().then((payload: any) => {
      setNewMessage(payload.news.slice(0, itemsNum || 4) || []);
      setMessageThumb(payload.sourceUrl);
    });
  }, []);

  return (
    <Card
      title={t('workspace.news.title')}
      extra={<span className={styles.operation}>
          <a href="http://innospots.com/blogs/" target="_blank">{t('workspace.news.more') + ' >'}</a>
        </span>}
      className={styles.coreWidget}
    >
      <div className={styles.newMessageImg}>
        <img src={messageThumb} width={"100%"}/>
      </div>

      <List
        itemLayout="vertical"
        dataSource={newMessage}
        renderItem={item => (
          <List.Item>
            <div className={styles.title}>
              <span>{item.date}</span>
            </div>
            <div className={styles.content}>
              <a href={item.link} target="_blank"> {item.title}</a>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};
export default Index;

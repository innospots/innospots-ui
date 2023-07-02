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
import styles from './index.less';
import useI18n from '@/common/hooks/useI18n';
import { Card } from 'antd';
import * as Service from '@/services/Workspace';

const Index: React.FC = () => {
  const [latestActivity, setLatestActivity] = useState<any>({});
  const { t } = useI18n('workspace');
  useEffect(() => {
    Service.getLatestActivity().then((payload) => {
      setLatestActivity(payload);
    });
  }, []);
  return (
    <Card
      title={t('workspace.events.title')}
      bordered={false}
      className={styles.coreWidget}
      headStyle={{ border: 'none', color: '#fff' }}
      bodyStyle={{ paddingTop: 0 }}
      style={{ background: '#1245FA', borderRadius: 10 }}
    >
      <div className={styles.content}>
        <a href={latestActivity.link} target="_blank">{latestActivity.title}</a>
      </div>
    </Card>
  );
};
export default Index;

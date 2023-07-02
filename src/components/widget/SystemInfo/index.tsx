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
import { Card, Col, Button } from 'antd';
import styles from './index.less';
import useI18n from '@/common/hooks/useI18n';

const Index: React.FC = () => {
  const { t } = useI18n('workspace');

  return (
    <Card
      title={t('workspace.system_updates.title')}
      bordered={false}
      className={styles.coreWidget}
      bodyStyle={{ paddingTop: 16, borderRadius: 10 }}
    >
      <div className={styles.content}>
        <div className={styles.title}>
          <img
            src={require('@/assets/images/common/u4046.svg')}
            alt="right"
            style={{ width: 24 }}
          />
          <span className={styles.titleText}>{t('workspace.system_updates.description')}</span>
        </div>
        <p>{t('workspace.system_updates.current_version')}：5.8.2</p>
        <p>{t('workspace.system_updates.last_checked')}：2021年11月22日 12:43</p>
      </div>
      <div className={styles.bottom}>
        <Button size="small" type="primary" className={styles.operationBtn}>
          {' '}
          {t('workspace.system_updates.button.check')}{' '}
        </Button>
      </div>
    </Card>
  );
};
export default Index;

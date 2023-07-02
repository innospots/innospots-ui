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
import { Card, Col, Row } from 'antd';
import styles from './index.less';
import useI18n from '@/common/hooks/useI18n';
import * as Service from '@/services/Workspace';

const Index: React.FC = () => {
  const { t } = useI18n('workspace');
  const [machineInfoData, setMachineInfoData] = useState<any>({});

  const basicInfo = machineInfoData['basicInfo'] || {};

  useEffect(() => {
    Service.getMachineInfoData().then((payload) => {
      setMachineInfoData(payload);
    });
  }, []);

  return (
    <Card title={t('workspace.server_info.title')} bordered={false} className={styles.coreWidget}>
      <Row>
        <Col className={styles.label}>
          {t('workspace.server_info.host_name')}:
        </Col>
        <Col className={styles.value}>
          {basicInfo?.hostName}
        </Col>
      </Row>
      <Row className={styles.machineInfo}>
        <Col className={styles.label}>
          {t('workspace.server_info.operating_system')}:
        </Col>
        <Col className={styles.value}>
          {basicInfo?.os}
        </Col>
      </Row>
      <Row className={styles.machineInfo}>
        <Col className={styles.label}>
          {t('workspace.server_info.kernel_version')}:
        </Col>
        <Col className={styles.value}>
          {basicInfo?.kernelVersion}
        </Col>
      </Row>
      <Row className={styles.machineInfo}>
        <Col className={styles.label}>
          {t('workspace.server_info.cpu_model')}:
        </Col>
        <Col className={styles.value}>
          {basicInfo?.cpuModel}
        </Col>
      </Row>
      <Row className={styles.machineInfo}>
        <Col className={styles.label}>
          {t('workspace.server_info.cpu_cores')}:
        </Col>
        <Col className={styles.value}>
          {basicInfo?.cpuCores}
        </Col>
      </Row>
      <Row className={styles.machineInfo}>
        <Col className={styles.label}>
          {t('workspace.server_info.memory')}:
        </Col>
        <Col className={styles.value}>
          {basicInfo?.memory}
        </Col>
      </Row>
      <Row className={styles.machineInfo}>
        <Col className={styles.label}>
          {t('workspace.server_info.disk_space')}:
        </Col>
        <Col className={styles.value}>
          {basicInfo?.diskSpace || '---'}
        </Col>
      </Row>
    </Card>
  );
};
export default Index;

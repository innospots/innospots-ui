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

import { Col, Row, Tag } from 'antd';

import styles from './index.less';
import { useModel } from 'umi';
import useI18n from "@/common/hooks/useI18n";

const Index: React.FC = (props) => {
  const { strategyDetailData, getStrategyDetail } = useModel('StrategyDetail');
  const { strategyId } = props['commonParams'];

  const {t} = useI18n('workspace');

  useEffect(() => {
    getStrategyDetail.run(strategyId);
  }, [strategyId]);

  return (
    <Row className={styles.content}>
      <Col span={4}>
        <Row style={{ marginBottom: 24 }}>
          <Col span={24} className={styles.infoLabel}>
            {' '}
            {t('workflow.overview.trigger')}{' '}
          </Col>
          <Col span={24} className={styles.infoValue}>
            {' '}
            {strategyDetailData['type'] || '---'}{' '}
          </Col>
        </Row>
        <Row>
          <Col span={24} className={styles.infoLabel}>
            {' '}
            {t('workflow.overview.status')}{' '}
          </Col>
          <Col span={24}>
            <Tag color={strategyDetailData['status'] === 'ONLINE' ? '#87d068' : '#f50'}>
              {strategyDetailData['status'] === 'ONLINE' ? t('workflow.board.status.online') : t('workflow.board.status.no.online')}
            </Tag>
          </Col>
        </Row>
      </Col>
      <Col span={5}>
        <Row style={{ marginBottom: 24 }}>
          <Col span={24} className={styles.infoLabel}>
            {' '}
            {t('workflow.overview.author')}{' '}
          </Col>
          <Col span={24} className={styles.infoValue}>
            {' '}
            {strategyDetailData['createdBy'] || '---'}{' '}
          </Col>
        </Row>
        <Row>
          <Col span={24} className={styles.infoLabel}>
            {' '}
            {t('workflow.overview.create_time')}{' '}
          </Col>
          <Col span={24} className={styles.infoValue}>
            {' '}
            {strategyDetailData['createdTime'] || '---'}{' '}
          </Col>
        </Row>
      </Col>
      <Col span={5}>
        <Row style={{ marginBottom: 24 }}>
          <Col span={24} className={styles.infoLabel}>
            {' '}
            {t('workflow.overview.editor')}{' '}
          </Col>
          <Col span={24} className={styles.infoValue}>
            {' '}
            {strategyDetailData['updatedBy'] || '---'}
          </Col>
        </Row>

        <Row>
          <Col span={24} className={styles.infoLabel}>
            {' '}
            {t('workflow.overview.update_time')}{' '}
          </Col>
          <Col span={24} className={styles.infoValue}>
            {' '}
            {strategyDetailData['updatedTime'] || '---'}{' '}
          </Col>
        </Row>
      </Col>
      <Col span={5}>
        <Row style={{ marginBottom: 24 }}>
          <Col span={24} className={styles.infoLabel}>
            {' '}
            {t('workflow.overview.active_time')}{' '}
          </Col>
          <Col span={24} className={styles.infoValue}>
            {' '}
            {strategyDetailData['onlineTime'] || '---'}{' '}
          </Col>
        </Row>

        <Row>
          <Col span={24} className={styles.infoLabel}>
            {' '}
            {t('workflow.overview.execution_time')}{' '}
          </Col>
          <Col span={24} className={styles.infoValue}>
            {' '}
            {strategyDetailData['runTime'] || '---'}
          </Col>
        </Row>
      </Col>
      <Col span={5}>
        <Col className={styles.infoLabel}> {t('workflow.overview.desc')} </Col>
        <Col className={styles.infoValue}> {strategyDetailData['name']} </Col>
      </Col>
    </Row>
  );
};
export default Index;

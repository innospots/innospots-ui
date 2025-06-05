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

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Col, Form, Row, Tabs } from 'antd';
import React, { useEffect } from 'react';
import { history } from 'umi';

import useI18n from '@/common/hooks/useI18n';
import PageHelmet from '@/components/PageHelmet';

import styles from './index.less';

const Header = ({ dataSource, pageType, onTabChange }) => {
  const { t } = useI18n('datasource');

  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(dataSource);
  }, [dataSource]);

  const getTabsNode = () => {
    const items = [
      {
        key: 'metadata',
        label: t('datasource.metadata.tab.metadata'),
      },
    ];

    return (
      <div className={styles.tabs}>
        <Tabs activeKey={pageType} onChange={onTabChange} items={items} />
      </div>
    );
  };

  return (
    <div className={styles.pageHeader}>
      <PageHelmet title={t('datasource.metadata.tab.metadata')} />
      <Row justify="space-between" style={{ padding: '0 24px' }}>
        <Col>
          <Row align="middle" gutter={16}>
            <Col>
              <div className={styles.backIcon} onClick={() => history.back()}>
                <ArrowLeftOutlined />
              </div>
            </Col>
            <Col>
              <span>
                {t('datasource.main.heading_title')}：{dataSource.name}
              </span>
            </Col>
            <Col style={{ paddingLeft: 20 }}>
              <span>
                {t('datasource.metadata.datasource_type')}：
                {dataSource.configCode}
              </span>
            </Col>
          </Row>
        </Col>
        <Col>{getTabsNode()}</Col>
      </Row>
    </div>
  );
};

export default React.memo(Header);

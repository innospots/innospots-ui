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
import { history } from 'umi';

import { Row, Col, Tabs, Form, PageHeader } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

const { TabPane } = Tabs;

const Header = ({ dataSource, pageType, onTabChange }) => {
  const { t } = useI18n('datasource');

  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(dataSource);
  }, [dataSource]);

  const getTabsNode = () => {
    return (
      <div className={styles.tabs}>
        <Tabs activeKey={pageType} onChange={onTabChange}>
          <TabPane tab={t('datasource.metadata.tab.metadata')} key="metadata" />
          {/*<TabPane tab="SQL查询" key="sqlQuery" />*/}
        </Tabs>
      </div>
    );
  };

  return (
    <div className={styles.pageHeader}>
      <PageHeader className="polaris-pro-fixed-header">
        <div className="polaris-pro-global-header">
          <Row justify="space-between">
            <Col>
              <Row>
                <Col>
                  <div className={styles.backIcon} onClick={() => history.goBack()}>
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
                    {t('datasource.metadata.datasource_type')}：{dataSource.configCode}
                  </span>
                </Col>
              </Row>
            </Col>
            <Col>{getTabsNode()}</Col>
          </Row>
        </div>
      </PageHeader>
    </div>
  );
};

export default React.memo(Header);

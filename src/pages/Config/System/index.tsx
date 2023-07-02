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

import React, { useState, useEffect } from 'react';

import { Row, Col, Menu } from 'antd';

import { useHistory } from 'react-router';

import PageTitle from '@/components/PageTitle';

import styles from './style.less';
import InfoConfig from './components/BasicConfig';
import EmailConfig from './components/EmailConfig';
import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';

const Index: React.FC = () => {
  const history = useHistory();
  const {
    location: {
      // @ts-ignore
      query,
      pathname,
    },
  } = history;

  const { t, loading: i18nLoading } = useI18n(['configuration', 'common']);

  const [tabKey, setTabKey] = useState(query.tabKey || 'basic');

  useEffect(() => {
    setTabKey(query.tabKey || 'basic');
  }, [query]);

  useEffect(() => {
    history.push({
      pathname,
      // @ts-ignore
      query: {
        tabKey,
      },
    });
  }, [tabKey]);

  const renderPageHeader = () => {
    return <PageTitle title={t('configuration.main.heading_title')} style={{ height: 64 }} />;
  };

  const handleTabChange = ({ key }) => {
    setTabKey(key);
  };

  const getTabContent = () => {
    return tabKey === 'basic' ? <InfoConfig /> : <EmailConfig />;
  };

  const renderPageContent = () => {
    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col flex="244px">
            <div className={styles.categoryList}>
              <div className={styles.inner}>
                <Menu mode="inline" onClick={handleTabChange} selectedKeys={[tabKey || '']}>
                  <Menu.Item key="basic">{t('configuration.form.tab.org.title')}</Menu.Item>
                  <Menu.Item key="email">{t('configuration.form.tab.email.title')}</Menu.Item>
                </Menu>
              </div>
            </div>
          </Col>
          <Col flex="auto">{getTabContent()}</Col>
        </Row>
      </div>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageHeader()}
      {renderPageContent()}
    </>
  );
};

export default Index;

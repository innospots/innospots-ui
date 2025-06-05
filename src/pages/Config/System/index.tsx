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
import { history, useLocation, useSearchParams } from 'umi';
import { Row, Col, Menu } from 'antd';

import PageHelmet from '@/components/PageHelmet';
import PageTitle from '@/components/PageTitle';
import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';

import InfoConfig from './components/BasicConfig';
import EmailConfig from './components/EmailConfig';
import EnvConfig from './components/EnvConfig';

import styles from './style.less';

const SystemConfig: React.FC = () => {
  const location = useLocation();
  const {
    pathname,
  } = location;
  const [searchParams] = useSearchParams();

  const { t, loading: i18nLoading } = useI18n(['configuration', 'system', 'common']);

  const [tabKey, setTabKey] = useState(searchParams.get('tabKey') || 'basic');

  useEffect(() => {
    setTabKey(searchParams.get('tabKey') || 'basic');
  }, [searchParams]);

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
    return <PageTitle title={t('configuration.main.heading_title')} />;
  };

  const handleTabChange = ({ key }) => {
    setTabKey(key);
  };

  const getTabContent = () => {
    if (tabKey === 'basic') {
      return <InfoConfig />;
    }
    if (tabKey === 'email') {
      return <EmailConfig />;
    }
    if (tabKey === 'env') {
      return <EnvConfig />;
    }
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
                  <Menu.Item key="env">{t('configuration.form.tab.env.title')}</Menu.Item>
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
      <PageHelmet title={t('configuration.main.heading_title')} />
      {renderPageHeader()}
      {renderPageContent()}
    </>
  );
};

export default SystemConfig;

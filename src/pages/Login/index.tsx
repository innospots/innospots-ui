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
import { Form, Input, Button, Row, Col } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

import pick from 'lodash/pick';

import { useModel, useRequest } from 'umi';

import useI18n from '@/common/hooks/useI18n';
import PageHelmet from '@/components/PageHelmet';
import PageLoading from '@/components/PageLoading';
import LanguageSelector from '@/components/LanguageSelector';
import RootConfigProvider from '@/components/RootConfigProvider';

import styles from './index.less';

const Index: React.FC = () => {
  const { t, loading } = useI18n(['account', 'common']);
  const userModel = useModel('Account', (model) => pick(model, ['postLogin', 'publicKeyRequest']));
  const loginRequest = useRequest(userModel.postLogin, {
    manual: true,
  });

  useEffect(() => {
    userModel.publicKeyRequest();
  }, []);

  const handleFormSubmit = (values: any) => {
    loginRequest.run(values);
  };

  const renderLoginForm = () => {
    return (
      <Form layout="vertical" validateTrigger="onBlur" onFinish={handleFormSubmit}>
        <Form.Item
          name="username"
          label={t('account.login.input.username.label')}
          rules={[{ required: true, message: t('account.login.input.username.placeholder') }]}
        >
          <Input
            placeholder={t('account.login.input.username.placeholder')}
            prefix={
              <span className={styles.inputIcon}>
                <MailOutlined />
              </span>
            }
          />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('account.login.input.password.label')}
          rules={[
            { required: true, min: 6, message: t('account.login.input.password.placeholder') },
          ]}
        >
          <Input.Password
            placeholder={t('account.login.input.password.placeholder')}
            prefix={
              <span className={styles.inputIcon}>
                <LockOutlined />
              </span>
            }
          />
        </Form.Item>
        <Form.Item label={t('account.login.language')}>
          <Row className="polaris-input-affix-wrapper">
            <Col span={24} style={{ color: '#333', padding: '5px 0' }}>
              <LanguageSelector />
            </Col>
          </Row>
        </Form.Item>
        {/*<Form.Item name="keep">*/}
        {/*    <Checkbox>*/}
        {/*        <span className={styles.keep}>保持登录</span>*/}
        {/*    </Checkbox>*/}
        {/*</Form.Item>*/}
        <Form.Item style={{ marginTop: 60 }}>
          <Button
            block
            type="primary"
            htmlType="submit"
            className={styles.loginButton}
            loading={loginRequest.loading}
          >
            {t('account.login.button.login')}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const renderLoginContainer = () => {
    return (
      <div className={styles.formContainer}>
        <div className={styles.inner}>
          <div className={styles.formWrapper}>
            <div className={styles.logo}>
              <img src={require('@/assets/images/common/logo.png')} />
            </div>

            <h1 className={styles.title}>{t('account.login.heading_title')}</h1>
            <p className={styles.desc}>{t('account.login.subtitle')}</p>

            <div className={styles.form}>{renderLoginForm()}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderLoginBanner = () => {
    return (
      <div className={styles.formBanner}>
        <div className={styles.inner}>
          <div className={styles.bannerText}>
            <h1>{t('account.login.slogan.title')}</h1>
            <p>{t('account.login.slogan.subtitle')}</p>
          </div>
          <object
            type="image/svg+xml"
            style={{width: 734}}
            data="/static/images/login/innospots_animation.svg"
          />
          {/*<img className={styles.banner} src={require("../../assets/images/login/banner.png")} />*/}
        </div>
      </div>
    );
  };

  return (
    <RootConfigProvider>
      <PageHelmet title={t('account.login.meta_title')} />
      {loading ? (
        <PageLoading />
      ) : (
        <div className={styles.container}>
          {renderLoginContainer()}
          {renderLoginBanner()}
        </div>
      )}
    </RootConfigProvider>
  );
};

export default Index;

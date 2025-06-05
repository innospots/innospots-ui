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
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

import pick from 'lodash/pick';

import { useModel, useRequest, useSearchParams } from 'umi';

import LS from '@/common/utils/LocalStorage';
import { jsonToUrlParams, setLogoutFlag, formatResourcePath } from '@/common/utils';

import useI18n from '@/common/hooks/useI18n';
import PageHelmet from '@/components/PageHelmet';
import PageLoading from '@/components/PageLoading';
import LanguageSelector from '@/components/LanguageSelector';
import RootConfigProvider from '@/components/RootConfigProvider';

import styles from './index.less';

const Index: React.FC = () => {
  const [authLoading, setAuthLoading] = useState(false);
  const { t, loading } = useI18n(['account', 'common']);
  const userModel = useModel('Account', (model) =>
    pick(model, ['postLogin', 'oauthList', 'serverInfo', 'getOauthList', 'publicKeyRequest']),
  );
  const loginRequest = useRequest(userModel.postLogin, {
    manual: true,
  });

  const serverInfo = useMemo(() => {
    return userModel.serverInfo || {};
  }, [userModel.serverInfo]);

  const [searchParams] = useSearchParams();
  const queryParams = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  useEffect(() => {
    userModel.getOauthList();
    userModel.publicKeyRequest();

    setTimeout(() => {
      setLogoutFlag(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (queryParams.redirect) {
      LS.set('signinRedirect', queryParams.redirect);
    }
  }, [queryParams.redirect]);

  const handleFormSubmit = (values: any) => {
    loginRequest.run(values);
  };

  const oauthLogin = async ({ url, params, providerName }: any) => {
    setAuthLoading(true);
    try {
      if (url) {
        const href = [url, jsonToUrlParams({
          ...params,
          state: providerName,
        })].join(url.includes('?') ? '&' : '?');
        window.location.href = href;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };

  const renderOauthList = () => {
    const oauthList = userModel.oauthList || [];

    if (_.isEmpty(oauthList)) {
      return null;
    }

    return (
      <>
        <Divider style={{ margin: '20px 0' }} />
        <div>
          {_.map(oauthList, (item) => {
            return (
              <Button
                block
                key={item.providerName}
                loading={authLoading}
                icon={<img src={item.icon} style={{ height: 20, marginRight: 8 }} />}
                className={styles.loginButton}
                onClick={() => { oauthLogin(item) }}
              >
                {`Login with ${_.startCase(item.providerName)}`}
              </Button>
            );
          })}
        </div>
      </>
    );
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
          <Button block size="large" style={{ justifyContent: 'start' }}>
            <LanguageSelector />
          </Button>
          {/* <Row className="polaris-input-affix-wrapper">
            <Col span={24} style={{ color: '#333', padding: '5px 0' }}>
              <LanguageSelector />
            </Col>
          </Row> */}
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
    const authMode = serverInfo?.authMode;
    return (
      <div className={styles.formContainer}>
        <div className={styles.inner}>
          <div className={styles.formWrapper}>
            <div className={styles.logo}>
              {
                serverInfo?.logo && (
                  <img src={formatResourcePath(serverInfo?.logo)} />
                )
              }
            </div>

            <h1 className={styles.title}>{t('account.login.heading_title')}</h1>
            <p className={styles.desc}>{t('account.login.subtitle')}</p>

            {
              authMode === 'BASIC' && (
                <div className={styles.form}>{renderLoginForm()}</div>
              )
            }

            {
              authMode === 'OAUTH' && renderOauthList()
            }
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
            <h1>{serverInfo?.sloganTitle}</h1>
            <p>{serverInfo?.sloganContent}</p>
          </div>
          <object
            type="image/svg+xml"
            style={{ width: 734 }}
            data={formatResourcePath(serverInfo?.welcomeImage)}
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

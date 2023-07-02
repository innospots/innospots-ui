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

import ProLayout, { getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Helmet } from 'react-helmet';
import React, { useMemo, useEffect } from 'react';
import { Modal } from 'antd';
import useI18n from '@/common/hooks/useI18n';
import { checkUserStatus } from '@/services/Account';
import { history, useModel } from 'umi';
import PageLoading from '@/components/PageLoading';
import RootConfigProvider from '@/components/RootConfigProvider';

import styles from './style.less';

const loginPath = '/login';

const FullScreenLayout = (props) => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;

  const { logout, sessionData, setSessionData } = useModel('Account');

  const currentUserData = useMemo(() => {
    return sessionData;
  }, [sessionData]);

  const { loading: i18nLoading } = useI18n('common');

  useEffect(() => {
    checkUserInfo(location.pathname);

    const unlisten = history.listen((location, action) => {
      if (location.pathname !== loginPath) {
        checkUserInfo(location.pathname);
      }
      Modal.destroyAll();
    });
    return () => unlisten();
  }, []);

  const checkUserInfo = async (url: string) => {
    try {
      const result = await checkUserStatus(url);
      if (['60003', '60004'].includes(result?.code)) {
        logout();
      } else if (result?.code === '10000') {
        setSessionData(result.body);
      }
    } catch (e) {
      logout();
    }
  };

  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    // formatMessage,
    breadcrumb,
    ...props,
  });

  const renderPageLoading = () => {
    return <PageLoading />;
  };

  const renderPageLayout = () => {
    return (
      <ProLayout pure>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={title} />
        </Helmet>

        <div
          className={styles.container}
          style={{
            height: '100vh',
          }}
        >
          {children}
        </div>
      </ProLayout>
    );
  };

  return (
    <RootConfigProvider>
      {currentUserData && currentUserData.userId && !i18nLoading
        ? renderPageLayout()
        : renderPageLoading()}
    </RootConfigProvider>
  );
};
export default FullScreenLayout;

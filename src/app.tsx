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

import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
// import { addGlobalUncaughtErrorHandler } from 'qiankun';
// import { history } from 'umi';

import { IS_DEV } from '@/common/constants';
import PageLoadingComp from '@/components/PageLoading';

import getQiankunMasterState from '@/common/utils/QiankunMasterState';

// addGlobalUncaughtErrorHandler((event) => {
//   try {
//     if (event.reason.message === 'Failed to fetch') {
//       history.replace('/404')
//     }
//   } catch (e) {}
// });

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
}> {
  return {
    settings: {},
  };
}

export const qiankun = new Promise((resolve) => {
  resolve(1);
}).then((props) => {
  return {
    sandbox: false,
    apps: [
      {
        name: 'workflow', // 唯一 id
        entry: IS_DEV ? 'http://localhost:8882' : '/apps/workflow', // html entry
        props: {
          ...getQiankunMasterState(),
        },
      },
      {
        name: 'visualization', // 唯一 id
        entry: IS_DEV ? 'http://localhost:8881' : '/apps/visualization', // html entry
        props: {
          ...getQiankunMasterState(),
        },
      },
    ],
    routes: [
      {
        path: '/apps/workflow',
        microApp: 'workflow',
        microAppProps: {
          autoSetLoading: true,
          wrapperClassName: 'app-wrapper',
          loader: (loading) => (loading && <PageLoadingComp />)
        }
      },
      {
        path: '/apps/visualization',
        microApp: 'visualization',
        microAppProps: {
          autoSetLoading: true,
          wrapperClassName: 'app-wrapper',
          loader: (loading) => (loading && <PageLoadingComp />)
        }
      },
    ],
    externals: {
      react: 'var window.React',
      'react-dom': 'var window.ReactDOM',
    },
  };
});

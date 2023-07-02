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

// https://umijs.org/config/
import {defineConfig} from 'umi';
import {join} from 'path';
import themes from './themes/polaris';

import proxy from './proxy';
import routes from './routes';
import chainWebpack from './chainWebpack';

const {
    NODE_ENV,
    ANT_PREFIX,
    REACT_APP_ENV
} = process.env;

const publicPath = '/';
const IS_DEV = NODE_ENV !== 'production';

const headScripts = IS_DEV ? [
    `https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.development.js`,
    `https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.development.js`
] : [
    { src: `${publicPath}static/js/react.js` },
    { src: `${publicPath}static/js/react-dom.js` }
]

export default defineConfig({
    // umi routes: https://umijs.org/docs/routing
    routes,
    chainWebpack,
    hash: false,
    antd: {},
    headScripts,
    dva: {
        hmr: true,
    },
    define: {
        ANT_PREFIX
    },
    favicon: '/static/images/common/favicon.png',
    alias: {},
    history: { type: 'hash' },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
    },
    // https://umijs.org/zh-CN/plugins/plugin-locale
    locale: {
        // default zh-CN
        default: 'zh-CN',
        antd: true,
        // default true, when it is true, will use `navigator.language` overwrite default
        baseNavigator: true,
    },
    metas: [
      {
        httpEquiv: 'X-Frame-Options',
        content: 'deny',
      },
      // {
      //   name:'referrer',
      //   content: 'no-referrer'
      // }

    ],
    dynamicImport: {
        loading: '@ant-design/pro-layout/es/PageLoading',
    },
    targets: {
        ie: 11,
    },
    // Theme for antd: https://ant.design/docs/react/customize-theme-cn
    theme: {
        ...themes
    },
    // esbuild is father build tools
    // https://umijs.org/plugins/plugin-esbuild
    esbuild: {},
    title: false,
    ignoreMomentLocale: true,
    proxy: proxy[REACT_APP_ENV || 'dev'],
    manifest: {
        basePath: '/',
    },
    // Fast Refresh 热更新
    fastRefresh: {},
    openAPI: [
        {
            requestLibPath: "import { request } from 'umi'",
            // 或者使用在线的版本
            // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
            schemaPath: join(__dirname, 'oneapi.json'),
            mock: false,
        },
        {
            requestLibPath: "import { request } from 'umi'",
            schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
            projectName: 'swagger',
        },
    ],
    nodeModulesTransform: {type: 'none'},
    // mfsu: {},
    webpack5: {},
    exportStatic: {},
    qiankun: {
        master: {}
    }
});

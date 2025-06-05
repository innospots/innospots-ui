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
import { defineConfig } from 'umi';
import chainWebpack from './chainWebpack';
import lessLoader from './lessLoader';
import proxy from './proxy';
import routes from './routes';
import themes from './themes/polaris';

const { ANT_PREFIX, REACT_APP_ENV } = process.env;

const IS_DEV = process.env.NODE_ENV !== 'production';

const publicPath = '/';
const headScripts = IS_DEV ? [] : [
  { src: `${publicPath}static/js/react.js` },
  { src: `${publicPath}static/js/react-dom.js` },
];

const externals = IS_DEV ? {} : {
  react: 'React',
  'react-dom': 'ReactDOM',
};

export default defineConfig({
  // umi routes: https://umijs.org/docs/routing
  routes,
  headScripts,
  chainWebpack,
  antd: {},
  model: {},
  request: {},
  define: {
    ANT_PREFIX,
  },
  hash: true,
  alias: {},
  mfsu: false,
  initialState: {},
  history: { type: 'hash' },
  favicons: ['/static/images/common/fav.png'],
  locale: {
    default: 'zh-CN',
    baseNavigator: true,
  },
  externals,
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
  targets: {
    ie: 11,
  },
  jsMinifier: 'terser',
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    ...themes,
  },
  title: 'Innospots',
  styles: ['/static/css/markdown.css'],
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: true,
  qiankun: {
    master: {},
  },
  lessLoader,
});

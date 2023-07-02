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

import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
const { ModuleFederationPlugin } = require("webpack").container;

const IS_DEV = process.env.NODE_ENV !== 'production';

export default config => {
    config.plugin('monaco-editor').use(MonacoWebpackPlugin, [
        {
            languages: ['']
        },
    ]);

    config.plugin('module-feaderation-plugin').use(ModuleFederationPlugin,[{
      // 对外提供的打包后的文件名（引入时使用）
      filename: 'coreModule.js',
      // 当前应用模块名称
      name: 'coreModule',
      library: { type: "var", name: "coreModule" },
      // 暴露模块
      exposes: {
        './CoreWidget': '@/components/widget/shareWidgets'
      },
      shared: ["react", "react-dom"]
    }]);

    const hash = !IS_DEV ? '.[contenthash:8]' : '';
    config.output.filename(`static/js/[name]${hash}.js`);
    config.output.chunkFilename(`static/js/[name]${hash}.async.js`);

    config.plugin('extract-css').tap(args => [
        {
            ...args[0],
            filename: `static/css/[name]${hash}.css`,
            chunkFilename: `static/css/[name]${hash}.chunk.css`,
        },
    ]);
}

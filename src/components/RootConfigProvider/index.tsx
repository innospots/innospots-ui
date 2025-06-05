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
import { useModel } from 'umi';
import { App, ConfigProvider } from 'antd';

import PageLoading from '@/components/PageLoading';

import defaultConfig from './config';

const RootConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { serverInfo, getServerInfo } = useModel('Account', (model) => ({
    serverInfo: model.serverInfo,
    getServerInfo: model.getServerInfo,
  }));

  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getServerInfo();
    ConfigProvider.config(defaultConfig);
  }, []);
  
  useEffect(() => {
    if (serverInfo?.code) {
      setLoading(false);
    }
  }, [serverInfo?.code]);

  return (
    <ConfigProvider {...defaultConfig}>
      <App component={false}>
        {loading ? <PageLoading /> : children}
      </App>
    </ConfigProvider>
  );
};

export default RootConfigProvider;

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

import React, { useRef, useState, useEffect, useCallback } from 'react';

import { useModel } from 'umi';

import { AppInfo } from '@/common/types/Types';
import PageHelmet from '@/components/PageHelmet';
import PageLoading from '@/components/PageLoading';
import { randomString } from '@/common/utils';

import Header from './components/Header';

import BaseConfig from './BaseConfig';
import CodeConfig from './CodeConfig';
import ParameterConfig from './ParameterConfig';

import DataContext from './DataContext';

import styles from '../style.less';

const DEFAULT_APP_VALUE = {
  inPorts: [{
    id: randomString(4),
    count: 1
  }],
  outPorts: [{
    id: randomString(4),
    count: 1
  }],
  //配置参数
  config: null,
  //连接设置
  connectorConfigs: [],
  connectorName: 'None',
  nodeType: 'io.innospots.workflow.node.app.script.ScriptNode',
}

const Builder = ({ match, location }) => {

  const {
    formSchema,
    appInfoRequest
  } = useModel('App', model => ({
    formSchema: model.formSchema,
    appInfoRequest: model.appInfoRequest
  }));

  const [ appValue, setAppValue ] = useState<Record<string, any>>({
    ...DEFAULT_APP_VALUE
  });

  const [ pageType, setPageType ] = useState<string>('base');
  const [ appDetail, setAppDetail ] = useState<AppInfo>();
  const [ executeValue, setExecuteValue ] = useState<Record<string, any>>({
    inputs: []
  });

  const renderedKeys = useRef<string[]>([]);

  const pathname = location.pathname;
  // const pageType = location.query?.page || 'base';

  const { nodeId } = match.params;

  useEffect(() => {
    fetchAppInfo()
  }, [ nodeId ]);

  useEffect(() => {
    if (!renderedKeys.current.includes(pageType)) {
      renderedKeys.current.push(pageType)
    }
  }, [ pageType, renderedKeys.current ]);

  useEffect(() => {
    executeValue.inputs = appValue.inPorts?.map(port => ({
      sourceKey: port.id
    }));
    setExecuteValue({
      ...executeValue
    })
  }, [ appValue.inPorts ]);

  useEffect(() => {
    appValue.config = formSchema;
    setAppValue({
      ...appValue
    })
  }, [ JSON.stringify(formSchema) ]);

  const fetchAppInfo = async () => {
    const result = await appInfoRequest.runAsync(nodeId);
    if (result) {
      setAppDetail(result);

      const curAppValue = {
        ...DEFAULT_APP_VALUE,
        ...result,
        outPorts: result.outPorts && result.outPorts.length ? result.outPorts : DEFAULT_APP_VALUE.outPorts,
      };
      const isTrigger = result.primitive === 'trigger';
      if (!isTrigger && !result.inPorts && !result.inPorts.length) {
        curAppValue.inPorts = result.inPorts && result.inPorts.length ? result.inPorts : DEFAULT_APP_VALUE.inPorts
      }

      setAppValue(curAppValue)
    }
  }

  const handleUpdateAppValue = useCallback((value: any) => {
    if (!value.nodeType) {
      value.nodeType = DEFAULT_APP_VALUE.nodeType;
    }
    setAppValue({
      ...appValue,
      ...value
    })
  }, [ appValue ]);

  const handleExecuteValueChange = useCallback((value: any) => {
    setExecuteValue({
      ...executeValue,
      ...value
    })
  }, [ executeValue ]);

  const handleHeaderTabChange = (tab: string) => {
    setPageType(tab)
  }

  const handleStatusChange = () => {
    fetchAppInfo()
  }

  const isRenderedPage = (page) => renderedKeys.current.includes(page)

  const renderConfigNode = (type: string) => {
    const isRendered = isRenderedPage(type);

    if (pageType !== type && !isRendered) {
      return null;
    }

    let isShow = false;

    if (pageType === type) {
      isShow = true
    }

    let Component;

    switch (type) {
      case 'base':
        Component = <BaseConfig />
        break;

      case 'parameter':
        Component = <ParameterConfig />
        break;

      case 'code':
        Component = <CodeConfig />
        break;
    }

    return (
      <div className={styles.builderContent} style={{display: isShow ? '' : 'none'}}>
        { Component }
      </div>
    )
  }

  const renderContent = () => {
    if (appInfoRequest.loading) {
      return (
        <div><PageLoading /></div>
      )
    }

    return (
      <>
        { renderConfigNode('base') }
        { renderConfigNode('code') }
        { renderConfigNode('parameter') }
      </>
    )
  }

  return (
    <div className={styles.builderContainer}>
      <DataContext.Provider value={{
        appValue,
        pageType,
        pathname,
        appDetail,
        executeValue,
        onAppValueChange: handleUpdateAppValue,
        onExecuteValueChange: handleExecuteValueChange
      }}>
        <PageHelmet title="App Builder" />
        <Header onInfoUpdated={fetchAppInfo} onStatusChange={handleStatusChange} onTabChange={handleHeaderTabChange} />
        { renderContent() }
      </DataContext.Provider>
    </div>
  )
}

export default Builder;
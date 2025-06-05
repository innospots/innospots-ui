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

import { useEffect } from 'react';
import { useModel, useParams } from 'umi';
import { Spin } from 'antd'

import PageHelmet from '@/components/PageHelmet';

import AppHeader from '../Header/AppHeader';
import Viewport from '../Viewport';
import Setting from '../Setting';

import styles from '../../style.less'

const AppEditor = () => {

  const { appKey } = useParams()

  const {
    settingCollapsed,
  } = useModel('AppEditor', model => ({
    settingCollapsed: model.commonState.settingCollapsed,
  }))
  const {
    fetchAppInfo,
    appInfoRequest,
    currentAppInfo,
    setCurrentAppInfo,
  } = useModel('App',model => ({
    fetchAppInfo: model.fetchAppInfo,
    appInfoRequest: model.appInfoRequest,
    currentAppInfo: model.currentAppInfo,
    setCurrentAppInfo: model.setCurrentAppInfo,
  }))

  useEffect(() => {
    if (appKey && appKey !== currentAppInfo?.appKey) {
      fetchAppInfo(appKey)
    }
  },[ appKey, currentAppInfo?.appKey ])

  useEffect(() => setCurrentAppInfo(undefined),[ appKey ])

  return (
    <div className={styles.editorContainer} id="AppEditorContainer">
      <PageHelmet title="App Editor" />
      <AppHeader />
      {
        appInfoRequest.loading ? <Spin /> : (
          <>
            {settingCollapsed ? <Viewport />: <Setting />}
          </>
        )
      }
    </div>
  )
}

export default AppEditor

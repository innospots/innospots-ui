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

import React from 'react';
import _ from 'lodash'
import cls from 'classnames'
import { useModel } from 'umi'

import { App as RightSidebar } from './RightSidebar';
import { App as LeftSidebar } from './LeftSidebar'

import CustomSuspense from '../CustomSuspense'

import styles from '../../style.less'

const EditorContent = React.lazy(() => import('./EditorContent'))

const AppViewport: React.FC = () => {

  const {
    rightSidebarCollapsed
  } = useModel('AppEditor', model => ({
    rightSidebarCollapsed: model.commonState.rightSidebarCollapsed,
  }))

  const renderLeftSidebar = () => {
    return (
      <div className={styles.leftSidebar}>
        <CustomSuspense>
          <LeftSidebar />
        </CustomSuspense>
      </div>
    )
  }

  const renderRightSidebar = () => {
    return (
      <div className={styles.rightSidebar}>
        <RightSidebar />
      </div>
    )
  }

  const renderPageContent = () => {
    return (
      <div className={styles.content}>
        <CustomSuspense>
          <EditorContent />
        </CustomSuspense>
      </div>
    )
  }

  return (
    <div className={cls(styles.wrapper, `app-viewport-wrapper`)}>
      <div className={styles.container}>
        { renderLeftSidebar() }
        <div id="MainContent" className={cls(styles.mainContent, {
          [styles.rightSidebarCollapsed]: rightSidebarCollapsed
        })}>
          { renderPageContent() }
          { renderRightSidebar() }
        </div>
      </div>
    </div>
  )
}

export default AppViewport

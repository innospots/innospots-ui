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

import { Node as NodeRightSidebar } from './RightSidebar';
import { Node as NodeLeftSidebar, InputData } from './LeftSidebar'

import CustomSuspense from '../CustomSuspense'

import styles from '../../style.less'

const IOConfig = React.lazy(() => import('./IOConfig'))
const CodeEditor = React.lazy(() => import('./CodeEditor'))
const EditorContent = React.lazy(() => import('./EditorContent'))
const ExecutionResult = React.lazy(() => import('../ExecutionResult'))

const NodeViewport: React.FC = () => {

  const {
    nodeEditPage,
    rightSidebarCollapsed
  } = useModel('AppEditor', model => ({
    nodeEditPage: model.nodeEditPage,
    rightSidebarCollapsed: model.commonState.rightSidebarCollapsed,
  }))

  const renderLeftSidebar = () => {
    // if (nodeEditPage === 'io') return null

    return (
      <div className={styles.leftSidebar}>
        <CustomSuspense>
          {
            nodeEditPage === 'code' ? <InputData /> : <NodeLeftSidebar />
          }
        </CustomSuspense>
      </div>
    )
  }

  const renderRightSidebar = () => {
    return (
      <div className={styles.rightSidebar}>
        <NodeRightSidebar />
      </div>
    )
  }

  const renderPageContent = () => {
    let RenderContent

    if (nodeEditPage === 'io') {
      RenderContent = IOConfig
    } else if (nodeEditPage === 'config') {
      RenderContent = EditorContent
    } else if (nodeEditPage === 'code') {
      RenderContent = CodeEditor
    }

    return (
      <div className={styles.content}>
        <CustomSuspense>
          { RenderContent && <RenderContent /> }
        </CustomSuspense>
      </div>
    )
  }

  const renderExecutionResult = () => {
    if (nodeEditPage === 'code') {
      return (
        <div className={styles.executionResult}>
          <ExecutionResult />
        </div>
      )
    }
  }

  return (
    <div className={cls(styles.wrapper, `node-viewport-wrapper`, `page-${nodeEditPage}`)}>
      <div className={styles.container}>
        { renderLeftSidebar() }
        <div id="MainContent" className={cls(styles.mainContent, {
          [styles.rightSidebarCollapsed]: rightSidebarCollapsed
        })}>
          { renderPageContent() }
          { renderRightSidebar() }
          { renderExecutionResult() }
        </div>
      </div>
    </div>
  )
}

export default NodeViewport

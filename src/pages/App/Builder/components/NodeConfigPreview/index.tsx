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

import React, {useContext, useMemo} from 'react';
import cls from 'classnames';
import {useModel} from 'umi';

import DataContext from '../../DataContext';

import NodeSnapshot from '../NodeSnapshot';

import styles from './style.less';

const NodeConfigPreview:React.FC = () => {
  const { appValue, pageType } = useContext(DataContext);

  const {
    connector
  } = useModel('Credential', model => ({
    connector: model.connector
  }));

  const [ inPorts, outPorts ] = useMemo(() => {
    return [ appValue.inPorts || [], appValue.outPorts|| [] ]
  }, [appValue.inPorts, appValue.outPorts]);

  const renderHeader = () => {
    return (
      <div className={styles.header}>
        <span>配置预览</span>
      </div>
    )
  }

  const renderSnapshot = () => {
    return (
      <NodeSnapshot key={pageType} />
    )
  }

  const renderPorts = (name: string, ports: any[]) => {
    return !!inPorts.length ? (
      ports.map((port, index) => (
        <p key={port.id} className={styles.value}>{name}{index + 1}: {port.label || '-'}</p>
      ))
    ) : '-'
  }

  const renderDescription = () => {
    return (
      <div className={styles.description}>
        <p className={styles.title}>连接类型：</p>
        <p className={styles.value}>{ connector?.name }</p>
        <p className={styles.title}>输入数据：</p>
        { renderPorts('Input', inPorts) }
        <p className={styles.title}>输出数据：</p>
        { renderPorts('Output', outPorts) }
      </div>
    )
  }

  return (
    <div className={styles.container}>
      { renderHeader() }
      <div className={cls(styles.content, 'custom-scrollbar')}>
        { renderSnapshot() }
        { renderDescription() }
      </div>
    </div>
  )
}

export default NodeConfigPreview;
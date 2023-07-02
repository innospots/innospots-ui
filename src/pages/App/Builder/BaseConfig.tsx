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
import { Row, Col } from 'antd';
import cls from 'classnames';

import { useModel } from 'umi';

import Tabs from './components/Tabs';
import ConnectorConfig from './components/ConnectorConfig';
import DataInteraction from './components/DataInteraction';
import NodeConfigPreview from './components/NodeConfigPreview';

import styles from '../style.less';

const BaseConfig = () => {

  const [activeKey, setActiveKey] = useState<string>('connectorConfig');

  const renderConfigIntro = () => {

    return (
      <div className={styles.intro}>
        {
          activeKey === 'connectorConfig' ? (
            <>
              <h2>连接设置</h2>
              <p className={styles.desc}>请选择此应用的连接类型和基础鉴权设置，此连接用于外部应用交互、数据库读写以及服务器通讯等。</p>
            </>
          ) : (
            <>
              <h2>输入输出设置</h2>
              <p className={styles.desc}>请选择此应用的连接类型和基础鉴权设置，此连接用于外部应用交互、数据库读写以及服务器通讯等。</p>
            </>
          )
        }
      </div>
    )
  }

  const renderConnectorConfig = () => {

    return (
      <div className={cls(styles.configWrapper, 'custom-scrollbar', {
        [styles.hidden]: activeKey !== 'connectorConfig'
      })}>
        <ConnectorConfig />
      </div>
    )
  }

  const renderDataInteraction = () => {

    return (
      <div className={cls(styles.configWrapper, 'custom-scrollbar', {
        [styles.hidden]: activeKey !== 'dataInteraction'
      })}>
        <DataInteraction />
      </div>
    )
  }

  const renderContent = () => {

    return (
      <Row>
        <Col flex="1" className={styles.configForm}>
          <div>
            <div className={styles.navTabs}>
              <Tabs
                type="nav"
                items={[{
                  key: 'connectorConfig',
                  label: '连接设置'
                }, {
                  key: 'dataInteraction',
                  label: '输入/输出设置'
                }]}
                activeKey={activeKey}
                onChange={setActiveKey}
              />
            </div>
            <div className={styles.configContent}>
              { renderConfigIntro() }
              { renderConnectorConfig() }
              { renderDataInteraction() }
            </div>
          </div>
        </Col>
        <Col flex="320px" className={styles.configPreview}>
          <NodeConfigPreview />
        </Col>
      </Row>
    )
  }

  return renderContent()
}

export default BaseConfig;
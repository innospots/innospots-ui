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

import React, {useEffect, useMemo, useContext} from 'react';
import { Row, Col, Typography } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import _ from 'lodash';

import cls from 'classnames';
import {useModel} from 'umi';

import PageLoading from '@/components/PageLoading';
import {formatResourcePath} from '@/common/utils';

import DataContext from '../../DataContext';

import LinkForm from '../LinkForm';
import getDefaultSchema from '../ConfigBoard/settings/defaultSchema';

import styles from '../../../style.less';

const { Text } = Typography;

export type Config = {
  type?: string
  icon?: string
  name?: string
  overview?: string
  description?: string
  configs?: Record<string, any>[]
};

const ConnectorConfig = () => {
  const { appValue, appDetail, onAppValueChange } = useContext(DataContext);

  const {
    connector,
    setConnector,
    credentialConfigs,
    credentialConfigsRequest
  } = useModel('Credential', model => (_.pick(model, [
    'connector',
    'setConnector',
    'credentialConfigs',
    'credentialConfigsRequest',
  ])));

  const isTrigger = appDetail?.primitive === 'trigger';
  const connectorName = appValue.connectorName;

  useEffect(() => {
    if (connectorName && credentialConfigs.length) {
      const result = _.find(credentialConfigs, item => item.name === connectorName) || {}
      setConnector(result || {});
    }
  }, [ connectorName, credentialConfigs ]);

  useEffect(() => {
    credentialConfigsRequest.run()
  }, []);

  const updateConnectorConfig = (config) => {
    onAppValueChange({
      nodeType: config.appNodeType || 'io.innospots.workflow.node.app.script.ScriptNode',
      connectorName: config.name,
      connectorConfigs: [],
      config: getDefaultSchema(config.name, isTrigger)
    })
  }

  const renderConnectorConfig = () => {

    return (
      <div className={styles.link}>
        <Row style={{width: '100%'}}>
          <Col span={5}>
            <p className={styles.linkTitle}>
              <Text type="danger">*</Text> <Text>{`${isTrigger ? '触发器类型' : '连接类型'}`}：</Text>
            </p>
          </Col>
          <Col flex="auto">
            <ul className={styles.linkContainer}>
              {
                (credentialConfigs || []).map(item => (
                  <li
                    key={item.name}
                    className={cls(styles.linkItem, {
                      [styles.active]: item.name === connectorName
                    })}
                    onClick={() => updateConnectorConfig(item)}
                  >
                    <img className={styles.icon} src={formatResourcePath(item.icon)} />
                    <p className={styles.text}>{ item.name }</p>
                  </li>
                ))
              }
            </ul>
          </Col>
        </Row>
        {
          connector.overview && (
            <Row gutter={8}>
              <Col span={6}>
                <div className={styles.linkInfoIcon}><InfoCircleFilled /></div>
              </Col>
              <Col><Text type="secondary">{ connector.overview }</Text></Col>
            </Row>
          )
        }
      </div>
    )
  }

  const renderLinkForms = () => {
    return (
      <div className={styles.linkForm}>
        <LinkForm connectorData={connector} />
      </div>
    )
  }

  return (
    <div className={styles.connectorConfig}>
      {
        credentialConfigsRequest.loading ? (
          <PageLoading size="small" />
        ) : (
          <>
            { renderConnectorConfig() }
            { renderLinkForms() }
          </>
        )
      }
    </div>
  )
}

export default ConnectorConfig;
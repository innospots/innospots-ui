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
import { Row, Col, Typography, Button, Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { randomString } from '@/common/utils';

import DataContext from '../../DataContext';

import styles from '../../../style.less';

const { Title } = Typography;

const configs = [{
  type: 'inPorts',
  label: '输入设置'
}, {
  type: 'outPorts',
  label: '输出设置'
}];

const getPortData = (data?: Record<string, any>) => {
  return {
    id: randomString(4),
    count: 1,
    ...data
  }
}

const DataInteraction = () => {
  const { appValue, appDetail, onAppValueChange } = useContext(DataContext);

  const isTrigger = appDetail?.primitive === 'trigger';
  const changePortValue = (port: string, index: number) => (event) => {
    const ports = (appValue[port] || []).concat([]);
    ports[index] = {
      ...ports[index],
      label: event.target.value
    };

    appValue[port] = ports;
    onAppValueChange(appValue)
  }

  const curConfigs = useMemo(() => {
    if (isTrigger) {
      return _.filter(configs, item => item.type === 'outPorts')
    }

    return configs
  }, [isTrigger]);

  const changePorts = (port: string, type: 'add' | 'remove', index?: number) => () => {
    const ports = (appValue[port] || []).concat([]);

    if (type === 'add') {
      ports.push(getPortData())
    } else {
      ports.splice(index, 1)
    }

    appValue[port] = ports;
    onAppValueChange(appValue)
  }

  return (
    <div className={styles.dataInteraction}>
      {
        curConfigs.map((item) => {
          let portType = item.type, max = 2;
          if (portType === 'outPorts') {
            max = 4;
          }
          const ports = appValue[portType] || [];
          const addAble = ports.length < max;

          return (
            <div className={styles.configContainer} key={portType}>
              <div className={styles.titleWrap}>
                <Row gutter={12} align="middle">
                  <Col>
                    <Title level={5} className={styles.title}>{ item.label }</Title>
                  </Col>
                  <Col>
                    <Button
                      type="link"
                      size="small"
                      disabled={!addAble}
                      onClick={changePorts(portType, 'add')}
                    >+添加</Button>
                  </Col>
                </Row>
              </div>
              <div className={styles.formList}>
                {
                  _.map(appValue[portType], (port, index: number) => (
                    <Row key={[portType, index].join('-')} align="middle" className={styles.formItem} gutter={12}>
                      <Col flex="130px" className={styles.indexLabel}>{portType === 'inPorts' ? 'Input' : 'Output'}{index + 1}:</Col>
                      <Col flex="60px" className={styles.formLabel}>标签:</Col>
                      <Col flex="300px">
                        <Input placeholder="请输入标签" value={port.label} onChange={changePortValue(portType, index)} />
                      </Col>
                      {
                        index > 0 && (
                          <Col>
                            <Button type="text" size="small" icon={<DeleteOutlined />} onClick={changePorts(portType, 'remove', index)} />
                          </Col>
                        )
                      }
                    </Row>
                  ))
                }
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

export default DataInteraction;
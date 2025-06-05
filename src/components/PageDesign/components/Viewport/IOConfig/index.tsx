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

import { useMemo } from 'react';
import _ from 'lodash';
import cls from 'classnames'
import { useModel } from 'umi';
import { DeleteOutlined } from '@ant-design/icons';
import { Row, Col, Typography, Button, Input } from 'antd';

import { randomString } from '@/common/utils';

import styles from './style.less';

const { Title } = Typography;

const configs = [
  {
    type: 'inPorts',
    label: '输入设置',
  },
  {
    type: 'outPorts',
    label: '输出设置',
  },
];

let updateTimer

const getPortData = (data?: Record<string, any>) => {
  return {
    id: randomString(4),
    count: 1,
    ...data,
  };
};

const IOConfig = () => {
  const { getNodePorts, updateNodePorts } = useModel('FlowNode', (model) => ({
    getNodePorts: model.getNodePorts,
    updateNodePorts: model.updateNodePorts,
  }));

  const curConfigs = useMemo(() => configs, []);

  const changePortValue = (port: string, index: number) => (event) => {
    if (updateTimer) {
      clearTimeout(updateTimer)
      updateTimer = null
    }

    updateTimer = setTimeout(() => {
      const ports: any[] = getNodePorts(port);
      ports[index] = {
        ...ports[index],
        label: event.target.value,
      };
  
      updateNodePorts(port, ports);
    }, 300)
  };

  const changePorts = (port: string, type: 'add' | 'remove', index?: number) => () => {
    const ports: any[] = getNodePorts(port);

    if (type === 'add') {
      ports.push(getPortData());
    } else {
      ports.splice(index as number, 1);
    }

    updateNodePorts(port, ports);
  };

  const renderPortsEditor = () => {
    return (
      <div className={cls(styles.ioEditor, 'custom-scrollbar')}>
        {curConfigs.map((item) => {
          const portType = item.type;
          const max = 4 //portType === 'outPorts' ? 4 : 2;
          const ports = getNodePorts(portType) || [];
          const addAble = ports.length < max;

          return (
            <div className={styles.configContainer} key={portType}>
              <div className={styles.titleWrap}>
                <Row gutter={12} align="middle">
                  <Col>
                    <Title level={5} className={styles.title}>
                      {item.label}
                    </Title>
                  </Col>
                  <Col>
                    <Button
                      type="link"
                      size="small"
                      disabled={!addAble}
                      onClick={changePorts(portType, 'add')}
                    >
                      +添加
                    </Button>
                  </Col>
                </Row>
              </div>
              <div className={styles.formList}>
                {_.map(ports, (port, index: number) => (
                  <Row
                    gutter={12}
                    align="middle"
                    className={styles.formItem}
                    key={[portType, index].join('-')}
                  >
                    <Col flex="130px" className={styles.indexLabel}>
                      {portType === 'inPorts' ? 'Input' : 'Output'}
                      {index + 1}:
                    </Col>
                    <Col flex="60px" className={styles.formLabel}>
                      标签:
                    </Col>
                    <Col flex="300px">
                      <Input
                        defaultValue={port.label}
                        placeholder="请输入标签"
                        onChange={changePortValue(portType, index)}
                      />
                    </Col>
                    {(index > 0 && !port.isDefault) && (
                      <Col>
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={changePorts(portType, 'remove', index)}
                        />
                      </Col>
                    )}
                  </Row>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.dataInteraction}>
      <div className={styles.intro}>
        <Title level={3}>输入输出设置</Title>
        <p className={styles.desc}>
          请选择此应用的连接类型和基础鉴权设置，此连接用于外部应用交互、数据库读写以及服务器通讯等。
        </p>
      </div>
      { renderPortsEditor() }
    </div>
  );
};

export default IOConfig;

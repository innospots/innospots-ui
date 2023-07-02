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

import { Tabs, Table, Row, Col } from 'antd';

import type { FormItemProps } from './types';

const TabConfig:React.FC<FormItemProps> = ({ readOnly, addons, schema, ...props }) => {

  const renderContent = (type: string) => {

    const columns = [{
      key: 'name',
      title: '姓名',
      width: '50%',
      dataIndex: 'name',
    }, {
      key: 'value',
      title: (
        <Row justify="space-between">
          <Col>值111</Col>
          <Col>值222</Col>
        </Row>
      ),
      width: '50%',
      dataIndex: 'value',
    }];

    return (
      <Table size="small" columns={columns} />
    )
  }

  const tabItems = [{
    key: 'param',
    label: '请求参数',
    children: renderContent('param')
  }, {
    key: 'header',
    label: '请求头'
  }, {
    key: 'body',
    label: '请求体'
  }, {
    key: 'template',
    label: '请求体模板'
  }];

  return (
    <div>
      <Tabs size="small" items={tabItems} />
    </div>
  )
}

export default TabConfig;
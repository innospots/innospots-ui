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

import React, { useRef, Suspense, useState, useEffect } from 'react';

import { Row, Col, Tabs, Table, Input, Radio, Button, Select, Pagination, Typography } from 'antd';

import { SaveOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

import styles from './index.less';

require('codemirror/mode/sql/sql');

const codeMirror = require('codemirror/lib/codemirror');

const SQLQuery = () => {
  const editor = useRef(null);
  const [viewType, setViewType] = useState('field'); //sql

  useEffect(() => {
    if (viewType === 'sql') {
      createSQLEditor();
    }
  }, []);

  const createSQLEditor = () => {
    const queryTextarea = document.querySelector('#sqlEditor');
    editor.current = codeMirror.fromTextArea(queryTextarea, {
      mode: 'text/x-sql',
      theme: 'eclipse',
      width: '100%',
      height: '100%',
      lineNumbers: true,
      lineWrapping: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      foldGutter: true,
      gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    });

    // editor.doc.getValue()
  };

  const getSqlEditor = () => {
    return (
      <div className={styles.editor}>
        <textarea id="sqlEditor" placeholder="输入SQL语句" />
      </div>
    );
  };

  const getFieldList = () => {
    const columns = [
      {
        width: 200,
        title: '字段标识',
        dataIndex: 'id',
        key: 'id',
      },
      {
        width: 200,
        title: '数据类型',
        dataIndex: 'type',
        key: 'type',
        render: (value, record) => {
          return (
            <Select size="small" defaultValue="lucy" style={{ width: '100%' }}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="disabled" disabled>
                Disabled
              </Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
          );
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        render: (value, record) => {
          return <Input size="small" style={{ width: 200 }} />;
        },
      },
    ];

    return (
      <div className={styles.fieldList}>
        <Table
          size="small"
          columns={columns}
          dataSource={[
            {
              id: 'customer_id',
              type: '字符串',
              remark: '客户ID',
            },
          ]}
          pagination={false}
        />
      </div>
    );
  };

  const getActionHeader = () => {
    return (
      <Row justify="space-between">
        <Col>
          <Button type="primary" icon={<PlayCircleOutlined />}>
            执行
          </Button>{' '}
          <Button icon={<PauseCircleOutlined />}>停止</Button>{' '}
          <Button icon={<SaveOutlined />}>保存</Button>
        </Col>
        <Col>
          <Radio.Group defaultValue="sql">
            <Radio.Button value="sql">SQL视图</Radio.Button>
            <Radio.Button value="field">字段列表</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
    );
  };

  return (
    <div className={styles.sqlQuery}>
      {getActionHeader()}
      {viewType === 'sql' ? getSqlEditor() : getFieldList()}
    </div>
  );
};

export default SQLQuery;

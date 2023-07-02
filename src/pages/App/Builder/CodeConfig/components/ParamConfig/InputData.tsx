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

import React, {useContext, useEffect, useMemo, useState} from 'react';
import { Space, Row, Col, Typography, Input, Button, Progress, Upload } from 'antd';
import { PlusOutlined, PaperClipOutlined, CloseOutlined } from '@ant-design/icons';
import cls from 'classnames';
import _ from 'lodash';

import { AJAX_PREFIX } from '@/common/constants';
import { getAuthHeader } from '@/common/request/header';

import DataContext from '../../../DataContext';

import styles from './style.less';

const { Text } = Typography;

const tabs = [{
  key: 'data',
  label: '数据'
}, {
  key: 'file',
  label: '文件'
}]

const CodeConfig = () => {
  const { executeValue, onExecuteValueChange } = useContext(DataContext);
  const [tabKeys, setTabKeys] = useState<string[]>([]);

  const inputs = useMemo(() => executeValue.inputs || [], [ executeValue.inputs ]);

  useEffect(() => {
    inputs.forEach((port, index) => {
      if (!tabKeys[index]) {
        tabKeys[index] = 'data';
      }
    })
    setTabKeys([
      ...tabKeys
    ])
  },[inputs]);

  const uploadFileChange = (index) => ({ fileList }) => {
    executeValue.inputs[index].resources = fileList;
    onExecuteValueChange(executeValue);
  }

  const removeFile = (index: number) => () => {
    executeValue.inputs[index].resources.splice(index, 1);
    onExecuteValueChange(executeValue);
  }

  const renderInputData = (index: number) => {
    return (
      <div>
        <Input.TextArea
          rows={6}
          placeholder="请输入JSON格式的数据，如要传入多条数据则需传入JSON数组"
          onChange={event => {
            executeValue.inputs[index].data = event.target.value;
            onExecuteValueChange(executeValue);
          }}
        />
      </div>
    )
  }

  const renderFiles = (index: number) => {
    const props = {
      name: 'files',
      headers: getAuthHeader(),
      action: AJAX_PREFIX + 'apps/definition/debug/upload-file/true',
      showUploadList: false,
      onChange: uploadFileChange(index)
    };
    const fileList = inputs[index]?.resources || [];
    return (
      <div className={styles.uploadBox}>
        {
          fileList.map((item, fileIndex) => (
            <div className={styles.fileItem}>
              <Row justify="space-between">
                <Col>
                  <Space>
                    <Text type="secondary"><PaperClipOutlined /></Text>
                    <Text type="secondary">{ item.name }</Text>
                  </Space>
                </Col>
                <Col>
                  <Text type="secondary" className={styles.removeBtn} onClick={removeFile(fileIndex)}>
                    <CloseOutlined />
                  </Text>
                </Col>
              </Row>
              <div style={{marginTop: -6}}>
                <Progress
                  size="small"
                  percent={item.percent}
                  showInfo={false}
                  strokeWidth={3}
                />
              </div>
            </div>
          ))
        }
        <Upload {...props}>
          <Button type="link" size="small" icon={<PlusOutlined />}>上传文件</Button>
        </Upload>
      </div>
    )
  }

  const toggleTabKey = (index: number, tabKey: string) => () => {
    tabKeys[index] = tabKey;
    setTabKeys([
      ...tabKeys
    ])
  }

  return (
    <div className={styles.inputData}>
      {
        _.map(inputs, (port, index:number) => (
          <div key={port.sourceKey} className={styles.inputItem}>
            <p><Text type="danger">*</Text>input{index + 1}:</p>
            <div className={styles.menus}>
              {
                tabs.map(item => (
                  <span
                    key={item.key}
                    className={cls(styles.menuItem, { [styles.active]: item.key === tabKeys[index] })}
                    onClick={toggleTabKey(index, item.key)}
                  >{ item.label }</span>
                ))
              }
            </div>
            {
              tabKeys[index] === 'data' ? renderInputData(index) : renderFiles(index)
            }
          </div>
        ))
      }
    </div>
  )
}

export default CodeConfig;
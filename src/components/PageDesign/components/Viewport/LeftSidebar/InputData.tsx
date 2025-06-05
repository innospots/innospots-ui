import { useModel } from 'umi';
import _ from 'lodash';
import cls from 'classnames';
import React, { useState } from 'react';
import { useDeepCompareEffect, useDebounceEffect } from 'ahooks';
import { Space, Row, Col, Typography, Button, Progress, Upload } from 'antd';
import { PlusOutlined, PaperClipOutlined, CloseOutlined } from '@ant-design/icons';

const AceCodeEditor = React.lazy(() => import('@/components/AceCodeEditor'))

import { AJAX_PREFIX } from '@/common/constants';
import { getAuthHeader } from '@/common/request/header';

import styles from './style.less';

const { Text } = Typography;

const tabs = [
  {
    key: 'data',
    label: 'JSON',
  },
  {
    key: 'file',
    label: '文件',
  },
];

const InputData = () => {
  const [inputStatus, setInputStatus] = useState<string[]>([]);
  const [tabKeys, setTabKeys] = useState<string[]>([]);
  const { getNodePorts, flowNodeDebugState } = useModel('FlowNode', (model) => ({
    getNodePorts: model.getNodePorts,
    flowNodeDebugState: model.flowNodeDebugState,
  }));
  const { setInputData } = useModel('AppData', (model) => ({
    setInputData: model.setInputData,
  }));

  const inputPorts = getNodePorts('inPorts');

  useDeepCompareEffect(() => {
    _.each(inputPorts, (port, index) => {
      if (!tabKeys[index]) {
        tabKeys[index] = 'data';
      }

      if (!flowNodeDebugState.inputs[index]) {
        flowNodeDebugState.inputs[index] = {};
      }
    });
    setTabKeys([...tabKeys]);
  }, [inputPorts]);

  const parseInputData = () => {
    const status: string[] = []
    const inputData: any[] = _.map<any[]>(flowNodeDebugState.inputs, (input, index) => {
      const key = `Input${index + 1}`;
      const nodeData: Record<string, any> = {
        files: [],
        fields: [],
        nodeKey: key,
        nodeName: key,
      };
      const files: any[] = [];
      const fields: any[] = [];
      let jsonData = [];
      try {
        if (input.data) {
          jsonData = JSON.parse(input.data)
        }
      } catch (error) {
        status[index] = 'error'
      }

      if (!_.isArray(jsonData)) {
        jsonData = [jsonData];
      }

      _.each(jsonData, (json) => {
        let field: any = json;
        if (_.isString(json) || _.isNumber(json)) {
          field = {
            [json]: json,
          };
        }

        _.each(field, (value, key) => {
          let type = 'MAP';
          if (_.isString(value)) {
            type = 'STRING';
          } else if (_.isNumber(value)) {
            type = 'INTEGER';
          } else if (_.isBoolean(value)) {
            type = 'BOOLEAN';
          }

          fields.push({
            type,
            value: key,
            label: key,
          });
        });
      });

      _.each(input.resources, res => {
        files.push({
          value: res.name,
          label: res.name
        })
      })

      nodeData.files = files;
      nodeData.fields = fields;

      return nodeData;
    });
    setInputData(inputData);
    setInputStatus(status)
  }

  useDebounceEffect(() => {
    parseInputData()
  }, [flowNodeDebugState.inputs]);

  const uploadFileChange =
    (index) =>
    ({ fileList }) => {
      flowNodeDebugState.inputs[index].resources = fileList;
      flowNodeDebugState.inputs = [...flowNodeDebugState.inputs];
    };

  const removeFile = (index: number) => () => {
    flowNodeDebugState.inputs[index].resources.splice(index, 1);
    flowNodeDebugState.inputs = [...flowNodeDebugState.inputs];
  };

  const toggleTabKey = (index: number, tabKey: string) => () => {
    tabKeys[index] = tabKey;
    setTabKeys([...tabKeys]);
  };

  const renderInputData = (index: number) => {
    return (
      <div className={styles.inputEditor}>
        <AceCodeEditor
          mode="json"
          height="300px"
          onChange={(newValue) => {
            if (!flowNodeDebugState.inputs[index]) {
              flowNodeDebugState.inputs[index] = {};
            }
            flowNodeDebugState.inputs[index].data = _.trim(newValue);
            flowNodeDebugState.inputs = [...flowNodeDebugState.inputs];
          }}
          name="jsonEditor"
          showGutter={false}
          setOptions={{
            showLineNumbers: false
          }}
          placeholder="请输入JSON格式的对象或数组"
        />
      </div>
    );
  };

  const renderFiles = (index: number) => {
    const props = {
      name: 'files',
      headers: getAuthHeader(),
      action: AJAX_PREFIX + 'flow-node/debug/upload-file/true',
      showUploadList: false,
      onChange: uploadFileChange(index),
    };
    const fileList = flowNodeDebugState.inputs[index]?.resources || [];
    return (
      <div className={styles.uploadBox}>
        {fileList.map((item, fileIndex) => (
          <div className={styles.fileItem} key={['file', fileIndex].join('-')}>
            <Row justify="space-between">
              <Col>
                <Space>
                  <Text type="secondary">
                    <PaperClipOutlined />
                  </Text>
                  <Text type="secondary">{item.name}</Text>
                </Space>
              </Col>
              <Col>
                <Text type="secondary" className={styles.removeBtn} onClick={removeFile(fileIndex)}>
                  <CloseOutlined />
                </Text>
              </Col>
            </Row>
            <div style={{ marginTop: -6 }}>
              <Progress size="small" percent={item.percent} showInfo={false} strokeWidth={3} />
            </div>
          </div>
        ))}
        <Upload {...props}>
          <Button type="link" size="small" icon={<PlusOutlined />}>
            上传文件
          </Button>
        </Upload>
      </div>
    );
  };

  const renderInputList = () => {
    return (
      <div className={styles.inputData}>
        <div className={cls(styles.listWrapper, 'custom-scrollbar')}>
          {_.map(inputPorts, (port, index: number) => (
            <div key={['data', index].join('-')} className={styles.inputItem}>
              <p>
                <Text type="danger">*</Text>input{index + 1}:
              </p>
              <div className={styles.menus}>
                {tabs.map((item) => (
                  <span
                    key={item.key}
                    className={cls(styles.menuItem, {
                      [styles.active]: item.key === tabKeys[index],
                    })}
                    onClick={toggleTabKey(index, item.key)}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
              {tabKeys[index] === 'data' ? renderInputData(index) : renderFiles(index)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={cls(styles.wrapper, styles.nodeLeftbar)}>
        <div className="editor-top-bar">
          <p className="top-bar-title">输入数据</p>
        </div>
        <div className={cls(styles.bottomContainer)}>{renderInputList()}</div>
      </div>
    </>
  );
};

export default InputData;

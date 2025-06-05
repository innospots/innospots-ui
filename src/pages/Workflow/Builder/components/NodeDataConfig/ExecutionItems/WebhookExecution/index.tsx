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

import React, {useMemo, useState, useEffect, useContext} from 'react';

import {Row, Col, Tabs, Form, Radio, Input, Table, Select, Button, Popconfirm, TableColumnsType} from 'antd';
import {PlusOutlined, MinusCircleOutlined} from '@ant-design/icons';

import _ from 'lodash';
import cls from 'classnames';
import {useModel} from 'umi';

import {useReactive} from 'ahooks';

import {randomString} from '@/common/utils';
import useI18n from '@/common/hooks/useI18n';

import CurContext from '../../../../common/context';

import {AUTH_OPTIONS} from '../../config';

import styles from './index.less';

type ConfigData = {
  key?: string;
  name?: string;
  value?: string;
};

type ConfigDataTypes = {
  contentType?: string,
  params?: ConfigData[];
  headers?: ConfigData[];
  body?: ConfigData[];
};

const getDefaultField = (o?: ConfigData): ConfigData => ({
  key: randomString(4),
  name: '',
  ...o
});

const testDataCache: any = {};

const CONTENT_TYPES = [
  'none',
  'form-data',
  'x-www-form-urlencoded',
  'json',
  'xml',
  'raw',
  'binary'
];

const WebhookExecution: React.FC<any> = (props) => {
  const {onExecute, onChange} = props;
  const {node, nodeData} = useContext(CurContext);

  const {t} = useI18n(['workflow', 'common']);

  const initConfig = useMemo(() => testDataCache[node.id] || nodeData.data?.webhook_config || {}, [ node.id, nodeData.data ]);
  const webhookData = useMemo(() => nodeData.data?.api_trigger, [nodeData]);

  const configData = useReactive<ConfigDataTypes>({
    contentType: 'none',
    params: [],
    headers: [],
    body: []
  });
  const formValues = useReactive<{
    username?: string;
    password?: string;
    authType?: string;
    httpMethod?: string;
    apiUrlAddress?: string;
  }>({
    username: '',
    password: '',
    authType: 'NONE',
    httpMethod: 'POST',
    apiUrlAddress: ''
  });
  const [authForm] = Form.useForm();
  const [requestTabKey, setRequestTabKey] = useState('1');
  const executeLoading = useModel('Builder', (model) => model.executeLoading);

  useEffect(() => {
    formValues.authType = webhookData?.authType || 'NONE';
    authForm.setFieldsValue({
      ...formValues
    });
  }, [webhookData]);

  useEffect(() => {
    if (initConfig) {
      configData.contentType = initConfig.contentType || 'none';
      ['body', 'params', 'headers'].forEach(key => {
        configData[key] = _.cloneDeep(initConfig[key] || []);
      })
    }
  }, [initConfig]);

  const triggerChange = (data) => {
    const testData = {
      ...data
    }
    testDataCache[node.id] = testData;
    onChange?.(testData)
  };

  const getFieldByType = (type: string, defaultData?: ConfigData) => {
    return getDefaultField({
      name: '',
      value: '',
      ...defaultData
    });
  };

  const changeListItem = (field: string, type: string, index: number) => (event) => {
    if (configData[type]) {
      configData[type][index] ??= {};
      try {
        configData[type][index][field] = event.target.value;
      } catch {
        configData[type][index][field] = event;
      }

      triggerChange(configData);
    }
  };

  const deleteListItem = (type: string, index: number) => () => {
    if (configData[type]?.length) {
      configData[type].splice(index, 1);
      configData[type] = [].concat(configData[type]);

      triggerChange(configData);
    }
  };

  const addListItem = (type: string) => () => {
    if (configData[type]) {
      configData[type].push(getFieldByType(type));
      configData[type] = [].concat(configData[type]);

      triggerChange(configData);
    }
  };

  const handleAuthFormChange = (changedValues) => {
    _.each(_.keys(changedValues), (key: string) => {
      formValues[key] = changedValues[key];
    });
  };

  const handleExecute = () => {
    authForm
      .validateFields()
      .then((values: any) => {
        onExecute?.({
          ...configData,
          authorization: {
            authType: 'NONE',
            ...values
          }
        });
      })
      .catch(() => {
        setRequestTabKey('2');
      });
  };

  const handleTabChange = (activeKey: string) => {
    if (activeKey === '2') {
      authForm.setFieldsValue(formValues);
    }

    setRequestTabKey(activeKey);
  };

  /**
   * 请求参数
   */
  const renderRequestParams = () => {
    const columns: TableColumnsType<any> = [
      {
        title: t('workflow.webhook.request.column.field'),
        dataIndex: 'name',
        render: (name: string, record: any, index: number) => (
          <Input
            size="small"
            value={name}
            readOnly={record.from === 'path'}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('name', 'params', index)}
          />
        )
      },
      {
        title: t('workflow.webhook.request.column.value'),
        dataIndex: 'value',
        render: (value, record: any, index: number) => (
          <Input
            size="small"
            value={value}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('value', 'params', index)}
          />
        )
      },
      {
        title: () => (
          <span className="b-button" onClick={addListItem('params')}>
                        <PlusOutlined/> {t('common.button.add')}
                    </span>
        ),
        width: 80,
        align: 'center',
        dataIndex: 'key',
        render: (key, record: any, index: number) => (
          <Popconfirm
            title={t('common.text.delete_confirmation')}
            onConfirm={deleteListItem('params', index)}
            okText={t('common.button.confirm')}
            cancelText={t('common.button.cancel')}
          >
                        <span
                          className={cls('g-button', {
                            disabled: record.from === 'path'
                          })}
                        >
                            <MinusCircleOutlined/>
                        </span>
          </Popconfirm>
        )
      }
    ];

    const dataSource = configData.params;

    return (
      <Table
        size="small"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{
          y: 152
        }}
      />
    );
  };

  /**
   * 请求头
   */
  const renderRequestHeaders = () => {
    const columns: TableColumnsType<any> = [
      {
        title: t('workflow.webhook.request.column.field'),
        dataIndex: 'name',
        render: (name: string, record: any, index: number) => (
          <Input
            size="small"
            value={name}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('name', 'headers', index)}
          />
        )
      },
      {
        title: t('workflow.webhook.request.column.value'),
        dataIndex: 'value',
        render: (value: string, record: any, index: number) => (
          <Input
            size="small"
            value={value}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('value', 'headers', index)}
          />
        )
      },
      {
        title: () => (
          <span className="b-button" onClick={addListItem('headers')}>
                        <PlusOutlined/> {t('common.button.add')}
                    </span>
        ),
        width: 80,
        align: 'center',
        dataIndex: 'key',
        render: (key, record: any, index: number) => (
          <Popconfirm
            title={t('common.text.delete_confirmation')}
            okText={t('common.button.confirm')}
            cancelText={t('common.button.cancel')}
            onConfirm={deleteListItem('headers', index)}
          >
                        <span className="g-button">
                            <MinusCircleOutlined/>
                        </span>
          </Popconfirm>
        )
      }
    ];

    return (
      <Table
        size="small"
        columns={columns}
        dataSource={[].concat(configData.headers as [])}
        pagination={false}
        scroll={{
          y: 152
        }}
      />
    );
  };

  /**
   * 请求体
   */
  const renderRequestBody = () => {
    const columns: TableColumnsType<any> = [
      {
        title: t('workflow.webhook.request.column.field'),
        dataIndex: 'name',
        render: (name: string, record: any, index: number) => (
          <Input
            size="small"
            value={name}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('name', 'body', index)}
          />
        )
      },
      {
        title: t('类型'),
        dataIndex: 'type',
        render: (value: string, record: any, index: number) => (
          <Select
            size="small"
            value={value}
            options={[{
              label: 'text',
              value: 'text'
            }, {
              label: 'file',
              value: 'file'
            }, {
              label: 'number',
              value: 'number'
            }]}
            style={{width: '100%'}}
            placeholder={t('common.select.placeholder')}
            onChange={changeListItem('type', 'body', index)}
          />
        )
      },
      {
        title: t('workflow.webhook.request.column.value'),
        dataIndex: 'value',
        render: (value: string, record: any, index: number) => (
          <Input
            size="small"
            value={value}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('value', 'body', index)}
          />
        )
      },
      {
        title: '说明',
        dataIndex: 'comment',
        render: (value: string, record: any, index: number) => (
          <Input
            size="small"
            value={value}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('comment', 'body', index)}
          />
        )
      },
      {
        title: () => (
          <span className="b-button" onClick={addListItem('body')}>
                        <PlusOutlined/> {t('common.button.add')}
                    </span>
        ),
        width: 80,
        align: 'center',
        dataIndex: 'key',
        render: (key, record: any, index: number) => (
          <Popconfirm
            title={t('common.text.delete_confirmation')}
            okText={t('common.button.confirm')}
            cancelText={t('common.button.cancel')}
            onConfirm={deleteListItem('body', index)}
          >
                        <span className="g-button">
                            <MinusCircleOutlined/>
                        </span>
          </Popconfirm>
        )
      }
    ];

    return (
      <div>
        <Row className={styles.contentTypes} align="middle">
          <Col>
            <Radio.Group
              value={configData.contentType}
              onChange={event => {
                configData.contentType = event.target.value;
                triggerChange(configData);
              }}
            >
              {
                _.map(CONTENT_TYPES, type => (
                  <Radio key={type} value={type}>{type}</Radio>
                ))
              }
            </Radio.Group>
          </Col>
        </Row>
        <Table
          size="small"
          scroll={{
            y: 106
          }}
          columns={columns}
          pagination={false}
          dataSource={[].concat(configData.body as [])}
        />
      </div>
    );
  };

  const renderAuthForm = () => {
    return (
      <div className={styles.authForm}>
        <Form
          {...{
            labelCol: {span: 6},
            wrapperCol: {span: 12}
          }}
          size="small"
          form={authForm}
          onValuesChange={handleAuthFormChange}
        >
          <Form.Item
            name="authType"
            label={t('workflow.webhook.form.select.auth.label')}
            rules={[{required: true}]}
          >
            <Select
              disabled
              placeholder={t('common.select.placeholder')}
              options={AUTH_OPTIONS}
            />
          </Form.Item>
          {formValues.authType === 'BASIC_AUTH' ? (
            <>
              <Form.Item
                name="username"
                rules={[{required: true}]}
                label={t('workflow.webhook.form.input.username.label')}
              >
                <Input placeholder={t('common.input.placeholder')}/>
              </Form.Item>
              <Form.Item
                name="password"
                label={t('workflow.webhook.form.input.password.label')}
                rules={[{required: true}]}
              >
                <Input.Password placeholder={t('common.input.placeholder')}/>
              </Form.Item>
            </>
          ) : null}
          {formValues.authType === 'BEARER_AUTH' ? (
            <>
              <Form.Item name="token" label="Token" rules={[{required: true}]}>
                <Input placeholder={t('common.input.placeholder')}/>
              </Form.Item>
            </>
          ) : null}
        </Form>
      </div>
    );
  };

  const renderRequestForms = () => {
    return (
      <div className={styles.configBox}>
        <Tabs
          size="small"
          activeKey={requestTabKey}
          items={_.map([
            'params',
            'auth',
            'header',
            'body'
          ], (key: string, index: number) => {
            let children;

            if (key === 'params') {
              children = renderRequestParams()
            } else if (key === 'auth') {
              children = renderAuthForm()
            } else if (key === 'header') {
              children = renderRequestHeaders()
            } else if (key === 'body') {
              children = renderRequestBody()
            }

            return {
              children,
              key: (index + 1).toString(),
              label: t(`workflow.webhook.request.tab.${key}`),
              forceRender: true
            }
          })}
          onChange={handleTabChange}
        />
      </div>
    );
  };

  return (
    <div className={styles.previewNode}>
      <div className={styles.previewContent}>
        <Row justify="space-between" align="middle">
          <Col>{t('workflow.webhook.run.config')}</Col>
          <Col>
            <Button
              size="small"
              type="primary"
              loading={executeLoading}
              disabled={executeLoading}
              onClick={handleExecute}
            >
              {t('common.button.run')}
            </Button>
          </Col>
        </Row>
        {renderRequestForms()}
      </div>
    </div>
  );
};

export default WebhookExecution;

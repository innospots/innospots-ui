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

import React, {useRef, useMemo, useState, useEffect} from 'react';

import {
  Col,
  Row,
  Tabs,
  Menu,
  Form,
  Input,
  Empty,
  Table,
  Button,
  Select,
  Divider,
  message,
  Dropdown,
  Popconfirm,
  TableColumnsType
} from 'antd';
import {PlusOutlined, DownOutlined, RightOutlined, MinusCircleOutlined} from '@ant-design/icons';
import {useReactive, useUpdateEffect} from 'ahooks';
import _ from 'lodash';
import cls from 'classnames';
import {useModel} from 'umi';

import ReactJson from 'react-json-view';

import {randomString} from '@/common/utils';
import {KeyValues} from '@/common/types/Types';

import NiceSwitch from '@/components/Nice/NiceSwitch';
import NiceModal, {NiceModalProps} from '@/components/Nice/NiceModal';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import styles from './style.less';

const {TabPane} = Tabs;

const AUTH_OPTIONS = [
  {
    value: 'NO_AUTH',
    label: 'No Auth'
  },
  {
    value: 'BASIC_AUTH',
    label: 'Basic Auth'
  },
  {
    value: 'BEARER_TOKEN',
    label: 'Bearer Token'
  }
];

const METHOD_OPTIONS = [
  {
    value: 'GET',
    label: 'GET'
  },
  {
    value: 'POST',
    label: 'POST'
  }
];

type ConfigData = {
  key?: string;
  code?: string;
  name?: string;
  value?: string;
  valueType?: string;
  httpFieldType?: string;
  httpFieldParamType?: string;
};

type ConfigDataTypes = {
  pathVariable?: ConfigData[];
  requestParam?: ConfigData[];
  requestHeader?: ConfigData[];
  requestBody?: ConfigData[];
};

const getDefaultField = (o?: ConfigData): ConfigData => ({
  key: randomString(4),
  name: '',
  code: '',
  valueType: 'STRING',
  ...o
});

const configPicks = ['name', 'code', 'valueType', 'httpFieldType', 'httpFieldParamType'];

const fieldTypes = {
  requestHeader: 'HTTP_HEADER',
  requestParam: 'HTTP_PARAM',
  requestBody: 'HTTP_BODY',
  pathVariable: 'HTTP_PATH'
};

const jsonInputTheme = {
  // theme: 'light_mitsuketa_tribute',
  colors: {
    keys: '#333',
    number: '#4659e7',
    background: 'transparent'
  }
};

const DEFAULT_DATA = {
  formStatus: {
    name: undefined,
    description: undefined,
    apiUrlAddress: undefined
  },

  responseData: {
    body: {},
    header: '',
    testResult: false
  },

  configData: {
    pathVariable: [],
    requestParam: [],
    requestHeader: [],
    requestBody: []
  },

  formValues: {
    username: '',
    password: '',
    bearerToken: '',
    authType: 'NO_AUTH',
    apiMethod: 'POST',
    apiUrlAddress: ''
  }
};

export const MODAL_NAME = 'HttpApiModal';

const HttpApiModal: React.FC<NiceModalProps> = () => {
  const {testExecuteRequest, saveHttpApiRequest, httpApiDetailRequest} = useModel('HttpApi');
  const delRef = useRef([]);

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const {visible, modalType, initValues} = modalInfo;

  const {t, loading: i18nLoading} = useI18n(['httpapi', 'common']);

  const [baseForm] = Form.useForm();
  const [authForm] = Form.useForm();

  const [scriptData, setScriptData] = useState({
    prev: '',
    post: ''
  });
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [requestTabKey, setRequestTabKey] = useState('1');
  const [responseViewType, setResponseViewType] = useState('1');

  const formConfig = useReactive<{
    requestVisible: boolean;
    responseVisible: boolean;
  }>({
    requestVisible: true,
    responseVisible: true
  });
  const formStatus = useReactive<{
    name: any;
    description: any;
    apiUrlAddress: any;
  }>({
    ...DEFAULT_DATA.formStatus
  });
  const responseData = useReactive<{
    body: {};
    header: string;
    testResult: boolean;
  }>({
    ..._.cloneDeep(DEFAULT_DATA.responseData)
  });

  const configData = useReactive<ConfigDataTypes>({
    ...DEFAULT_DATA.configData
  });
  const formValues = useReactive<{
    username?: string;
    password?: string;
    authType?: string;
    apiMethod?: string;
    bearerToken?: string;
    apiUrlAddress?: string;
  }>({
    ...DEFAULT_DATA.formValues
  });

  useEffect(() => {
    if (visible) {
      getInitData();
    } else {
      resetDefaultData();
    }
  }, [modalType, initValues, visible]);

  useEffect(() => {
    if (formValues.apiUrlAddress) {
      matchPathParams(formValues.apiUrlAddress);
    }
  }, [formValues.apiUrlAddress]);

  useUpdateEffect(() => {
    matchTemplateParams(bodyTemplate);
  }, [bodyTemplate]);

  const hasBodyTemplate = useMemo(() => _.trim(bodyTemplate) !== '', [bodyTemplate]);

  const resetDefaultData = () => {
    _.extend(formValues, DEFAULT_DATA.formValues);
    _.extend(configData, DEFAULT_DATA.configData);
    _.extend(responseData, DEFAULT_DATA.responseData);
    _.extend(formStatus, DEFAULT_DATA.formStatus);

    setScriptData({
      prev: '', post: ''
    });
    setBodyTemplate('');
    setRequestTabKey('1');
    setResponseViewType('1');
  };

  const matchPathParams = _.debounce((url = '') => {
    const matches = url.match(/\{\w+\}/g);
    if (matches && matches.length) {
      const list: any[] = [];
      const curPathVariable = configData.pathVariable;
      _.map(matches, (code) => {
        const c = code.replace(/\{|\}/g, '');
        const cur = _.find(curPathVariable, (item) => item.code === c);

        if (!cur) {
          const data = getFieldByType('pathVariable', {
            code: c
          });
          list.push(data);
        } else {
          list.push(cur);
        }
      });

      configData.pathVariable = list;
    } else {
      configData.pathVariable = [];
    }
  }, 500);

  const matchTemplateParams = _.debounce((template = '') => {
    const matches = template.match(/\$\{\w+\}/g);
    if (matches && matches.length) {
      const list: any[] = [];
      const curList: ConfigData[] | undefined = configData.requestBody;
      _.map(matches, (code) => {
        const c = code.replace(/\$\{|\}/g, '');
        const cur = _.find(curList, (item) => item.code === c);

        const data = getFieldByType('requestBody', {
          code: c
        });

        if (cur) {
          list.push({
            ...data,
            ...cur
          });
        } else {
          list.push(data);
        }
      });

      configData.requestBody = list;
    } else {
      configData.requestBody = [];
    }
  }, 500);

  const getInitData = async () => {

    let _initValues = initValues || {};

    if (_initValues.registryId) {
      const result = await httpApiDetailRequest.runAsync(_initValues.registryId);
      _initValues = result || {};
    }

    const _formValues = _.pick(_initValues, ['apiMethod', 'address']);
    const schemaFields = _initValues.schemaFields || [];

    setRequestTabKey('1');
    setResponseViewType('1');

    formConfig.requestVisible = true;
    formConfig.responseVisible = true;

    baseForm.setFieldsValue(_.pick(_initValues, ['name', 'description']));

    if (modalType === 'add') {
      authForm.setFieldsValue({
        username: undefined,
        password: undefined,
        authType: 'NO_AUTH'
      });
      formValues.authType = 'NO_AUTH';
    } else {
      setScriptData({
        prev: _initValues.prevScript,
        post: _initValues.postScript
      });
      _initValues.bodyTemplate && setBodyTemplate(_initValues.bodyTemplate);
    }

    formValues.apiMethod = _formValues.apiMethod || formValues.apiMethod;
    formValues.apiUrlAddress = _formValues.address;

    responseData.body = {};
    responseData.header = '';
    responseData.testResult = false;

    if (modalType === 'edit') {
      try {
        _.map(_.keys(fieldTypes), (key: string) => {
          const fieldScope = fieldTypes[key];
          configData[key] = _.filter(schemaFields, (item) => item.fieldScope === fieldScope);
        });
      } catch (e) {
      }
    }
  };

  const validateBaseForm = (callback) => {
    baseForm.validateFields().then((values) => {
      if (!values.name) {
        formStatus.name = 'error';
        message.error(t('httpapi.form.input.name.error_message'));
        return;
      } else {
        formStatus.name = undefined;
      }
      if (!values.description) {
        formStatus.description = 'error';
        message.error(t('httpapi.form.input.desc.error_message'));
        return;
      } else {
        formStatus.description = undefined;
      }

      if (values.name && values.description) {
        callback(values);
      }
    });
  }

  const handleFormSubmit = () => {
    validateBaseForm(values => {
      if (!formValues.apiUrlAddress) {
        formStatus.apiUrlAddress = 'error';
      } else {
        formStatus.apiUrlAddress = undefined;
        doSaveData(values);
      }
    })
  };

  const handleTabChange = (activeKey: string) => {
    if (activeKey === '2') {
      authForm.setFieldsValue(formValues);
    }

    setRequestTabKey(activeKey);
  };

  const handleAuthFormChange = (changedValues) => {
    _.each(_.keys(changedValues), (key: string) => {
      formValues[key] = changedValues[key];
    });
  };

  const handleMethodChange = (event) => {
    formValues.apiMethod = event.key;
  };

  const handleUrlChange = (event) => {
    formValues.apiUrlAddress = event.target.value;
    matchPathParams(formValues.apiUrlAddress);
  };

  const handleTestExecute = () => {
    validateBaseForm(values => {
      if (!formValues.apiUrlAddress) {
        formStatus.apiUrlAddress = 'error';
      } else {
        formStatus.apiUrlAddress = undefined;
        doExecute(values);
      }
    });
  };

  const doExecute = async (values) => {
    const result = await testExecuteRequest.runAsync(getPostData(values, true));
    if (result) {
      message.success(t('httpapi.form.msg.test_success'));
      let resultData = result as any;

      if (_.isString(resultData)) {
        resultData = JSON.parse(resultData);
      }

      try {
        resultData.body = JSON.parse(resultData.body);
      } catch (e) {
      }

      responseData.body = resultData;
      responseData.testResult = true;
    } else {
      responseData.body = {};
      responseData.testResult = false;
    }
  };

  const doSaveData = async (formData: {
    name: string;
    description: string;
    response_param?: any;
  }) => {
    const postData = getPostData(formData);

    await saveHttpApiRequest.runAsync(
      {
        ...initValues,
        ...postData
      },
      modalType
    );

    modal.hide();
  };

  const getResponseParams = () => {
    return _.map(responseData.body || {}, (value: any, key: string) => {
      let valueType = 'STRING';

      if (_.isNumber(value)) {
        valueType = 'NUMBER';
      } else if (_.isBoolean(value)) {
        valueType = 'BOOLEAN';
      }

      return {
        valueType,
        name: key,
        code: key,
        httpFieldType: 'RESPONSE',
        httpFieldParamType: 'RESPONSE_PARAM'
      };
    });
  };

  const getSchemaFields = (isTest?: boolean) => {
    let paramValue: any = null;
    const schemaFields: any[] = [];
    const keys = ['code', 'name', 'fieldId', 'valueType'];

    if (isTest) {
      paramValue = {};
      keys.push('value');
    }

    _.map(_.keys(configData), (key: string) => {
      const items = configData[key];
      _.map(items, (item) => {
        if (paramValue) {
          paramValue[item.code] = item.value;
        }

        schemaFields.push({
          fieldScope: fieldTypes[key],
          ..._.pick(item, keys)
        });
      });
    });

    return [ schemaFields, paramValue ];
  };

  const getPostData = (data?: any, isTest?: boolean) => {
    const postData = {
      configCode: 'http',
      ...data
    };
    const {apiMethod, apiUrlAddress: address} = formValues;

    _.extend(postData, {
      address,
      apiMethod
    });

    const [ schemaFields, paramValue ] = getSchemaFields(isTest);

    postData.configs = {};
    postData.paramValue = paramValue;
    postData.schemaFields = schemaFields;
    postData.prevScript = scriptData.prev;
    postData.postScript = scriptData.post;
    postData.bodyTemplate = bodyTemplate;

    return postData;
  };

  const getFieldByType = (type: string, defaultData?: ConfigData) => {
    let httpFieldParamType = '';

    if (type === 'pathVariable') {
      httpFieldParamType = 'PATH_VARIABLE';
    } else if (type === 'requestParam') {
      httpFieldParamType = 'REQUEST_PARAM';
    } else if (type === 'requestHeader') {
      httpFieldParamType = 'REQUEST_HEADER';
    }

    return getDefaultField({
      name: '',
      value: '',
      valueType: 'STRING',
      httpFieldType: 'REQUEST',
      httpFieldParamType,
      ...defaultData
    });
  };

  const changeListItem = (field: string, type: string, index: number) => (event) => {
    if (configData[type]) {
      configData[type][index] ??= {};
      configData[type][index][field] = event.target.value;
      configData[type] = [...configData[type]];
    }
  };

  const deleteListItem = (type: string, index: number) => () => {
    if (configData[type]?.length) {
      //httpFieldDeleteIds
      const record: {
        fieldId: number;
      } = configData[type][index] || {};
      if (record.fieldId) {
        // @ts-ignore
        delRef.current.push(record.fieldId);
      }

      configData[type].splice(index, 1);
      configData[type] = [...configData[type]];
    }
  };

  const addListItem = (type: string) => () => {
    if (configData[type]) {
      configData[type].push(getFieldByType(type));
      configData[type] = [...configData[type]];
    }
  };

  const handleBaseFormChange = (changedValues) => {
    for (let key in changedValues) {
      formStatus[key] = undefined;
    }
  }

  const renderBaseForm = () => {
    return (
      <div className={styles.baseForm}>
        <Form form={baseForm} preserve={false} layout="inline" onValuesChange={handleBaseFormChange}>
          <Row className={styles.formRow}>
            <Col span={12}>
              <Form.Item
                required
                name="name"
                label={t('httpapi.form.input.name.label')}
                validateStatus={formStatus.name}
              >
                <Input
                  placeholder={t('httpapi.form.input.name.placeholder')}
                  className={styles.formItem}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                required
                name="description"
                label={t('httpapi.form.input.desc.label')}
                validateStatus={formStatus.description}
              >
                <Input
                  placeholder={t('httpapi.form.input.desc.placeholder')}
                  className={styles.formItem}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  const renderTestForm = () => {
    const menu = (
      <Menu selectedKeys={[formValues.apiMethod as string]} onClick={handleMethodChange}>
        {METHOD_OPTIONS.map((item) => (
          <Menu.Item key={item.value}>{item.label}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <div className={styles.testForm}>
        <Form.Item validateStatus={formStatus.apiUrlAddress}>
          <Input.Group compact>
            <Dropdown overlay={menu}>
              <Button className="ant-btn-green" style={{width: 90}}>
                {formValues.apiMethod} <DownOutlined/>
              </Button>
            </Dropdown>
            <Input
              style={{width: 'calc(100% - 180px)'}}
              value={formValues.apiUrlAddress}
              placeholder={t('common.input.placeholder')}
              onChange={handleUrlChange}
            />
            <Button
              type="primary"
              style={{width: 90}}
              loading={testExecuteRequest.loading}
              onClick={handleTestExecute}
            >
              {t('httpapi.form.button.send')}
            </Button>
          </Input.Group>
        </Form.Item>
      </div>
    );
  };

  /**
   * 请求参数
   */
  const renderRequestParams = useMemo(() => {
    const {pathVariable, requestParam} = configData;
    const getTypeAndIndex = (record, index): [string, number] => {
      const listType = record.from === 'path' ? 'pathVariable' : 'requestParam';
      if (listType === 'requestParam') {
        index -= pathVariable?.length || 0;
      }

      return [listType, index];
    };

    const columns: TableColumnsType<KeyValues> = [
      {
        title: t('httpapi.form.params.column.key'),
        dataIndex: 'code',
        render: (code: string, record: any, index: number) => (
          <Input
            size="small"
            value={code}
            readOnly={record.from === 'path'}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('code', ...getTypeAndIndex(record, index))}
          />
        )
      },
      {
        title: t('httpapi.form.params.column.desc'),
        dataIndex: 'name',
        render: (name, record: any, index: number) => (
          <Input
            size="small"
            value={name}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('name', ...getTypeAndIndex(record, index))}
          />
        )
      },
      {
        title: t('httpapi.form.params.column.value'),
        dataIndex: 'value',
        render: (value, record: any, index: number) => (
          <Input
            size="small"
            value={value}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('value', ...getTypeAndIndex(record, index))}
          />
        )
      },
      {
        title: () => (
          <span className="b-button" onClick={addListItem('requestParam')}>
            <PlusOutlined/> {t('httpapi.form.params.link.add')}
          </span>
        ),
        width: 80,
        align: 'center',
        dataIndex: 'key',
        render: (key, record: any, index: number) => (
          <Popconfirm
            title={t('common.text.delete_confirmation')}
            onConfirm={deleteListItem(...getTypeAndIndex(record, index))}
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

    const dataSource = _.map(pathVariable, (item: ConfigData) => ({
      ...item,
      from: 'path'
    })).concat(requestParam as []);

    return (
      <Table
        size="small"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{
          y: 320
        }}
      />
    );
  }, [configData.pathVariable, configData.requestParam]);

  /**
   * 请求头
   */
  const renderRequestHeaders = useMemo(() => {
    const columns: TableColumnsType<KeyValues> = [
      {
        title: t('httpapi.form.params.column.key'),
        dataIndex: 'code',
        render: (code: string, record: any, index: number) => (
          <Input
            size="small"
            value={code}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('code', 'requestHeader', index)}
          />
        )
      },
      {
        title: t('httpapi.form.params.column.desc'),
        dataIndex: 'name',
        render: (name: string, record: any, index: number) => (
          <Input
            size="small"
            value={name}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('name', 'requestHeader', index)}
          />
        )
      },
      {
        title: t('httpapi.form.params.column.value'),
        dataIndex: 'value',
        render: (value: string, record: any, index: number) => (
          <Input
            size="small"
            value={value}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('value', 'requestHeader', index)}
          />
        )
      },
      {
        title: () => (
          <span className="b-button" onClick={addListItem('requestHeader')}>
            <PlusOutlined/> {t('httpapi.form.params.link.add')}
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
            onConfirm={deleteListItem('requestHeader', index)}
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
        dataSource={[].concat(configData.requestHeader as [])}
        pagination={false}
        scroll={{
          y: 320
        }}
      />
    );
  }, [configData.requestHeader]);

  /**
   * 请求体
   */
  const renderRequestBody = useMemo(() => {
    const columns: TableColumnsType<KeyValues> = [
      {
        title: t('httpapi.form.params.column.key'),
        dataIndex: 'code',
        render: (code: string, record: any, index: number) => (
          <Input
            size="small"
            value={code}
            readOnly={hasBodyTemplate}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('code', 'requestBody', index)}
          />
        )
      },
      {
        title: t('httpapi.form.params.column.desc'),
        dataIndex: 'name',
        render: (name: string, record: any, index: number) => (
          <Input
            size="small"
            value={name}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('name', 'requestBody', index)}
          />
        )
      },
      {
        title: t('httpapi.form.params.column.value'),
        dataIndex: 'value',
        render: (value: string, record: any, index: number) => (
          <Input
            size="small"
            value={value}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('value', 'requestBody', index)}
          />
        )
      },
      {
        title: () => (
          <span
            className={cls('b-button', {
              disabled: hasBodyTemplate
            })}
            onClick={addListItem('requestBody')}
          >
            <PlusOutlined/> {t('httpapi.form.params.link.add')}
          </span>
        ),
        width: 80,
        align: 'center',
        dataIndex: 'key',
        render: (key, record: any, index: number) => (
          <Popconfirm
            onConfirm={deleteListItem('requestBody', index)}
            title={t('common.text.delete_confirmation')}
            okText={t('common.button.confirm')}
            cancelText={t('common.button.cancel')}
          >
            <span
              className={cls('g-button', {
                disabled: hasBodyTemplate
              })}
            >
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
        dataSource={[].concat(configData.requestBody as [])}
        pagination={false}
        scroll={{
          y: 320
        }}
      />
    );
  }, [configData.requestBody]);

  const renderRequestBodyTemplate = useMemo(() => {
    return (
      <Input.TextArea
        value={bodyTemplate}
        style={{height: 188}}
        placeholder={t('common.input.placeholder')}
        onChange={(event) => {
          setBodyTemplate(event.target.value);
        }}
      />
    );
  }, [bodyTemplate]);

  const renderScriptData = (type: 'prev' | 'post') => {
    return (
      <Input.TextArea
        style={{height: 188}}
        value={scriptData[type]}
        placeholder={t('common.input.placeholder')}
        onChange={(event) => {
          scriptData[type] = event.target.value;
          setScriptData({
            ...scriptData
          })
        }}
      />
    );
  };

  const renderAuthForm = () => {
    return (
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
          label={t('httpapi.form.select.auth_type.label')}
          rules={[{required: true}]}
        >
          <Select placeholder={t('common.select.placeholder')} options={AUTH_OPTIONS}/>
        </Form.Item>
        {formValues.authType === 'BASIC_AUTH' && (
          <>
            <Form.Item
              name="username"
              label={t('httpapi.form.input.username.label')}
              rules={[
                {
                  required: true,
                  message: t('httpapi.form.input.username.error_message')
                }
              ]}
            >
              <Input placeholder={t('httpapi.form.input.username.placeholder')}/>
            </Form.Item>
            <Form.Item
              name="password"
              label={t('httpapi.form.input.password.label')}
              rules={[
                {
                  required: true,
                  message: t('httpapi.form.input.password.error_message')
                }
              ]}
            >
              <Input.Password placeholder={t('httpapi.form.input.password.placeholder')}/>
            </Form.Item>
          </>
        )}
        {formValues.authType === 'BEARER_TOKEN' && (
          <>
            <Form.Item
              name="bearerToken"
              label="Token"
              rules={[
                {
                  required: true,
                  message: t('httpapi.form.input.token.error_message')
                }
              ]}
            >
              <Input placeholder={t('httpapi.form.input.token.placeholder')}/>
            </Form.Item>
          </>
        )}
      </Form>
    );
  };

  const renderRequestForms = () => {
    return (
      <Tabs
        size="small"
        activeKey={requestTabKey}
        onChange={handleTabChange}
        items={_.map([
          'query_params',
          // 'auth',
          'headers',
          'body',
          'body_template',
          'pre_script',
          'post_script'
        ], (key, index) => {
          let children;

          if (key === 'query_params') {
            children = renderRequestParams;
          } else if (key === 'auth') {
            children = renderAuthForm();
          } else if (key === 'headers') {
            children = renderRequestHeaders;
          } else if (key === 'body') {
            children = renderRequestBody;
          } else if (key === 'body_template') {
            children = renderRequestBodyTemplate;
          } else if (key === 'pre_script') {
            children = renderScriptData('prev');
          } else if (key === 'post_script') {
            children = renderScriptData('post');
          }

          return {
            key: `${index + 1}`,
            label: t(`httpapi.form.params.${key}`),
            forceRender: key === 'auth',
            children
          }
        })}
      />
    );
  };

  const renderResponseBody = () => {
    return (
      <>
        <div>
          <NiceSwitch
            dataSource={[
              {
                value: '1',
                label: t('httpapi.form.response.raw')
              },
              {
                value: '2',
                label: t('httpapi.form.response.pretty')
              }
            ]}
            value={responseViewType}
            onChange={(value: string) => setResponseViewType(value)}
          />
        </div>
        <div className={styles.originalJson}>
          {responseViewType === '2' ? (
            // @ts-ignore
            <ReactJson name={false} src={responseData.body} displayDataTypes={false} iconStyle="square"  />
          ) : (
            JSON.stringify(responseData.body, null, '\t')
          )}
        </div>
      </>
    );
  };

  const renderResponseHeader = () => {
    const columns = [
      {
        title: t('httpapi.form.response.key'),
        dataIndex: 'field'
      },
      {
        title: t('httpapi.form.response.value'),
        dataIndex: 'data'
      }
    ];

    return (
      <div style={{height: 274}}>
        <Table
          size="small"
          columns={columns}
          dataSource={[{}]}
          pagination={false}
          scroll={{
            y: 238
          }}
        />
      </div>
    );
  };

  const renderResponseContent = () => {
    if (!responseData.testResult) {
      return (
        <div>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('httpapi.form.response.info.empty')}
          />
        </div>
      );
    }

    return (
      <Tabs defaultActiveKey="1" size="small">
        <TabPane tab={t('httpapi.form.response.body')} key="1">
          {renderResponseBody()}
        </TabPane>
        {/*响应头(3)*/}
        {/*<TabPane tab={t('httpapi.form.response.headers')} key="2">*/}
        {/*    { renderResponseHeader() }*/}
        {/*</TabPane>*/}
      </Tabs>
    );
  };

  const renderRequest = () => {
    return (
      <div
        className={cls(styles.configContainer, {
          [styles.visible]: formConfig.requestVisible
        })}
      >
        <Divider plain orientation="left">
          <span
            className="g-button"
            onClick={() => (formConfig.requestVisible = !formConfig.requestVisible)}
          >
            {formConfig.requestVisible ? <DownOutlined/> : <RightOutlined/>}{' '}
            {t('httpapi.form.params.title')}
          </span>
        </Divider>
        <div className={styles.configForm}>{renderRequestForms()}</div>
      </div>
    );
  };

  const renderResponse = () => {
    return (
      <div
        className={cls(styles.configContainer, {
          [styles.visible]: formConfig.responseVisible
        })}
      >
        <Divider plain orientation="left">
          <span
            className="g-button"
            onClick={() => (formConfig.responseVisible = !formConfig.responseVisible)}
          >
            {formConfig.responseVisible ? <DownOutlined/> : <RightOutlined/>}{' '}
            {t('httpapi.form.response.title')}
          </span>
        </Divider>
        <div className={styles.configForm}>{renderResponseContent()}</div>
      </div>
    );
  };

  return (
    <NiceModal
      width={740}
      destroyOnClose
      title={t(`httpapi.form.${modalType}.title`)}
      style={{top: 20}}
      visible={visible}
      okButtonProps={{
        loading: saveHttpApiRequest.loading,
        // disabled: !responseData.testResult,
        onClick: handleFormSubmit
      }}
      onCancel={modal.hide}
    >
      {renderBaseForm()}
      {renderTestForm()}
      {renderRequest()}
      {renderResponse()}
    </NiceModal>
  );
};

export default HttpApiModal;

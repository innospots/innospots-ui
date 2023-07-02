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

import React, { useMemo, useState, useEffect } from 'react';

import {
  Row,
  Col,
  Form,
  Steps,
  Input,
  Modal,
  Table,
  Select,
  Button,
  message,
  Typography,
} from 'antd';
import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi';

import {
  PlusOutlined,
  SearchOutlined,
  MinusCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { IconFont } from '@/components/Nice/NiceIcon';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import { randomString } from '@/common/utils';
import { DATA_TYPES } from '@/common/constants';

import styles from './index.less';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const defaultData = {
  readTopic: false,
};

const getDefaultField = (o) => ({
  key: randomString(4),
  ...o,
});

export const MODAL_NAME = 'KafkaTableModal';

/**
 * 新建、编辑Kafka注册表
 * @returns {JSX.Element}
 * @constructor
 */
const KafkaTableModal = (props) => {
  const { dataSource, confirmLoading, onSuccess, ...rest } = props;

  const {
    schemaFieldsParseRequest,
    fetchSchemaFieldsRequest,
    saveSchemaRegistryRequest,
    checkSchemaRegistryRequest,
    fetchSchemaRegistryTopicRequest,
    fetchSchemaRegistryTopicsRequest,
  } = useModel('Credential');

  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, modalType, initValues } = modalInfo;
  const { t } = useI18n(['datasource']);

  const [curForm] = Form.useForm();

  const [curStep, setCurStep] = useState(0);
  const [curPriKey, setCurPriKey] = useState('');
  const [formValue, setFormValue] = useState({});
  const [topicList, setTopicList] = useState([]);
  const [tableFields, setTableFields] = useState([]);
  const [topicKeywords, setTopicKeywords] = useState('');

  const [jsonError, setJsonError] = useState(false);
  const [jsonString, setJsonString] = useState('');
  const [dataFormat, setDataFormat] = useState('JSON');

  const curDataSource = useMemo(
    () => ({
      ...dataSource,
    }),
    [dataSource],
  );

  const filterTopics = useMemo(() => {
    if (topicKeywords === '') return topicList;
    return _.filter(topicList, item => item.name.indexOf(topicKeywords) > -1)
  }, [ topicKeywords, topicList ])

  useEffect(() => {
    let formValues = {
      ...defaultData,
    };

    const isUpdate = !!(modalType === 'edit' && initValues);
    if (isUpdate) {
      formValues = {
        code: initValues.code,
        description: initValues.description,
      };
    }

    if (visible) {
      curForm.setFieldsValue({
        ...formValues,
      });

      let configs;
      if (isUpdate && initValues.configs) {
        configs = initValues.configs;
        formValues.topic = configs.topic;
      }

      const format = _.get(configs, 'message.format', 'JSON');
      setDataFormat(format.toUpperCase());

      setFormValue({
        ...formValues,
      });

      if (isUpdate) {
        getDataFields();
      }
    } else {
      setCurStep(0);
    }
  }, [visible, modalType, initValues]);

  useEffect(() => {
    if (visible && curDataSource && curDataSource.credentialId) {
      getSchemaTable();
    }
  }, [visible, curDataSource.credentialId]);

  useEffect(() => {
    if (!visible) {
      curForm.resetFields();
      setTableFields([]);
      setJsonString('');
      setFormValue({});
    }
  }, [visible, curStep]);

  const changeStep = (step) => () => {
    if (step === 1) {
      curForm.validateFields().then(async (values) => {
        if (!formValue.topic) {
          message.error(t('datasource.kafka_schema.wizard.select.topic.placeholder'));
          return;
        }

        // if (modalType === 'create') {
        //   const checkResult = await checkSchemaRegistryRequest.runAsync(values.code);
        //   if (checkResult) {
        //     message.error(t('datasource.kafka_schema.wizard.input.code.error_message'));
        //     return
        //   }
        // }

        setFormValue({
          ...formValue,
          ...values,
        });
        setCurStep(step);
      });
    } else {
      setCurStep(step);
    }
  };

  const getSchemaTable = async () => {
    const resultData = await fetchSchemaRegistryTopicsRequest.runAsync(curDataSource.credentialId);
    if (resultData) {
      setTopicList(resultData);
    }
  };

  const readTopicMessage = async () => {
    const result = await fetchSchemaRegistryTopicRequest.runAsync(
      curDataSource.credentialId,
      formValue.topic,
    );

    if (result && result) {
      let s = !_.isString(result) ? JSON.stringify(result) : result;
      setJsonString(s || '');
    }
  };

  const getDataFields = async () => {
    const resData = await fetchSchemaFieldsRequest.runAsync({
      tableName: initValues.code,
      credentialId: initValues.credentialId,
    });

    if (resData) {
      setTableFields(
        _.map(resData, (item) => {
          const newItem = getDefaultField(item);
          if (newItem.pkey) {
            setCurPriKey(newItem.key);
          }

          return newItem;
        }),
      );
    }
  };

  const handleSubmit = () => {
    postData();
  };

  const postData = async () => {
    const topic = formValue.topic;
    const { credentialId, configCode } = curDataSource;
    let data = {
      configCode,
      credentialId,
      code: formValue.code,
      name: formValue.code,
      description: formValue.description,
      schemaFields: tableFields.map((item) => ({
        ...item,
        credentialId,
        pkey: curPriKey === item.key,
        registryCode: topic,
      })),
      registryType: 'TOPIC',
      configs: {
        topic,
        'message.format': dataFormat,
      },
    };

    if (modalType === 'edit' && initValues) {
      data = {
        ...initValues,
        ...data,
      };
    }

    const resData = await saveSchemaRegistryRequest.runAsync(data, modalType);
    if (resData) {
      message.success(t('common.error_message.save.success'));
      onSuccess && onSuccess(resData);
    }
  };

  const addTableFieldParam = () => {
    tableFields.push(getDefaultField());
    setTableFields([].concat(tableFields));
  };

  const updateTableFieldParam = (index, key, value) => {
    tableFields[index][key] = value;

    if (key === 'comment') {
      tableFields[index]['name'] = value;
    }

    setTableFields([].concat(tableFields));
  };

  const handleCheckedChange = (selectedRowKeys) => {
    setCurPriKey(selectedRowKeys[0]);
  };

  const formatJsonString = () => {
    try {
      let json = JSON.parse(jsonString.replace(/\'/g, '"'));
      json = JSON.stringify(json, null, '\t');

      setJsonError(false);
      setJsonString(json);
    } catch (e) {
      setJsonError(true);
    }
  };

  const parseJsonString = async () => {
    try {
      if (!jsonString) return;

      formatJsonString();

      // let json = JSON.parse(jsonString.replace(/\'/g, '"'))

      const fields = await schemaFieldsParseRequest.runAsync(curDataSource.sourceType, jsonString);
      if (fields) {
        setJsonError(false);
        setTableFields(_.map(fields, item => getDefaultField(item)));
      } else {
        setJsonError(true);
      }

      // setTableFields(_.map(json, (v, k) => (getDefaultField({
      //   code: k,
      //   valueType: _.isNumber(v) ? 'INTEGER' : 'STRING'
      // }))))
    } catch (e) {
      setJsonError(true);
    }
  };

  const toggleReadTopic = (e) => {
    setFormValue({
      ...formValue,
      readTopic: e.target.checked,
    });
    setJsonError(false);
  };

  const updateTopicKeywords = _.debounce((event) => {
    setTopicKeywords(event.target.value)
  }, 200)

  const steps = useMemo(() => {
    return (
      <Steps current={curStep}>
        <Step
          title={t('datasource.kafka_schema.wizard.step1.title')}
          description={t('datasource.kafka_schema.wizard.step1.subtitle')}
        />
        <Step
          title={t('datasource.kafka_schema.wizard.step2.title')}
          description={t('datasource.kafka_schema.wizard.step2.subtitle')}
        />
      </Steps>
    );
  }, [curStep, t]);

  const modalTitle = useMemo(() => {
    return (
      <div className={styles.modalTitle}>
        <Row>
          <Col flex="280px">
            <h1>{t('datasource.kafka_schema.wizard.title')}</h1>
          </Col>
          <Col flex="460px"> {steps} </Col>
        </Row>
      </div>
    );
  }, [curStep, t]);

  const modalFooter = () => {
    if (curStep === 0) {
      return [
        <Button
          key="next"
          type="primary"
          onClick={changeStep(1)}
          loading={checkSchemaRegistryRequest.loading}
        >
          {t('datasource.kafka_schema.wizard.button.next')}
        </Button>,
      ];
    } else {
      return [
        <Button key="prev" onClick={changeStep(0)}>
          {t('datasource.kafka_schema.wizard.button.prev')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={saveSchemaRegistryRequest.loading}
        >
          {t('common.button.confirm')}
        </Button>,
      ];
    }
  };

  const getBaseConfigForm = () => {
    return (
      <Form
        name="basic"
        form={curForm}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16, push: 2 }}
      >
        <Form.Item label={t('datasource.main.heading_title')}>
          {curDataSource.name || '--'}
        </Form.Item>
        <Form.Item
          name="code"
          label={t('datasource.kafka_schema.wizard.input.schema_name.label')}
          rules={[
            {
              required: true,
              message: t('datasource.kafka_schema.wizard.input.schema_name.placeholder'),
            },
          ]}
        >
          <Input maxLength={16} placeholder={t('common.input.placeholder')} />
        </Form.Item>
        <Form.Item
          name="description"
          label={t('datasource.kafka_schema.wizard.input.comment.label')}
        >
          <Input.TextArea style={{ height: 290 }} placeholder={t('common.input.placeholder')} />
        </Form.Item>
      </Form>
    );
  };

  const getTopicItems = () => {
    return (
      <div>
        {/*<Row justify="space-between">*/}
        {/*  <Col span={6} className="polaris-form-item-label">*/}
        {/*    <label className="polaris-form-item-required">Topic名称</label>*/}
        {/*  </Col>*/}
        {/*  <Col span={16} style={{paddingTop: 8}}>*/}
        {/*    <Switch*/}
        {/*      checkedChildren={t('base.topic.createValue.yes')}*/}
        {/*      unCheckedChildren={t('base.topic.createValue.no')}*/}
        {/*    />*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        <Row justify="space-between">
          <Col span={6} className="polaris-form-item-label">
            <label className="polaris-form-item-required">
              {t('datasource.kafka_schema.wizard.select.topic.label')}
            </label>
          </Col>
          <Col span={16}>
            <div className={styles.topicListWrap}>
              <div className={styles.searchInput}>
                <Input
                  bordered={false}
                  placeholder={t('common.input.placeholder')}
                  prefix={<SearchOutlined style={{ color: '#bdbdbd' }} />}
                  onChange={updateTopicKeywords}
                />
              </div>
              <div className={styles.topicList}>
                <ul>
                  {_.map(filterTopics, (topic) => (
                    <li
                      key={topic.code}
                      className={cls(styles.listItem, {
                        [styles.active]: formValue.topic === topic.name,
                      })}
                      onClick={() => {
                        setFormValue({
                          ...formValue,
                          topic: topic.name,
                        });
                      }}
                    >
                      <span>
                        <UnorderedListOutlined className={styles.icon} />
                      </span>
                      <span>{topic.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  const getBaseConfigNode = () => {
    return (
      <Row gutter={[20, 0]}>
        <Col span={12}>{getBaseConfigForm()}</Col>
        <Col span={12}>{getTopicItems()}</Col>
      </Row>
    );
  };

  const getTableConfigForm = () => (
    <div className={styles.tableConfigWrapper}>
      <Row justify="space-between">
        <Col>
          <h3 style={{ marginBottom: 0 }}>{t('datasource.kafka_schema.wizard.preview.label')}</h3>
        </Col>
        <Col>
          <Button
            size="small"
            className="ant-btn-green"
            onClick={readTopicMessage}
            loading={fetchSchemaRegistryTopicRequest.loading}
          >
            {t('datasource.kafka_schema.wizard.button.consume')}
          </Button>
        </Col>
      </Row>
      <Row style={{ marginTop: 20 }}>
        <Col flex="130px" className={styles.formLabel}>
          {t('datasource.kafka_schema.wizard.format.label')}：
        </Col>
        <Col flex="auto">
          <Select
            value={dataFormat}
            style={{ width: '100%' }}
            placeholder={t('common.select.placeholder')}
            onChange={(value) => {
              setDataFormat(value);
            }}
          >
            <Option value="JSON">JSON</Option>
            <Option value="STRING">STRING</Option>
          </Select>
        </Col>
      </Row>

      <div className={styles.example}>
        <Row justify="space-between">
          <Col>
            <Row align="middle">
              <Col style={{ lineHeight: '28px' }}>
                {t('datasource.kafka_schema.wizard.preview.label')}：
              </Col>
              <Col>
                {jsonError && (
                  <Text type="danger" style={{ paddingLeft: 8 }}>
                    {t('datasource.kafka_schema.format.error')}
                  </Text>
                )}
              </Col>
            </Row>
          </Col>
          <Col>
            {/*<Button*/}
            {/*  size="small"*/}
            {/*  className="cur-btn"*/}
            {/*  onClick={formatJsonString}*/}
            {/*>*/}
            {/*  <IconFont type="innospot-icon-geshihua" />{t('datasource.kafka_schema.wizard.button.pretty')}*/}
            {/*</Button>*/}
            <Button
              size="small"
              style={{ marginLeft: 8 }}
              className="ant-btn-green"
              loading={schemaFieldsParseRequest.loading}
              onClick={parseJsonString}
            >
              <IconFont type="innospot-icon-liandong" />
              {t('datasource.kafka_schema.wizard.button.parse')}
            </Button>
          </Col>
        </Row>
        <div>
          <TextArea
            bordered={false}
            value={jsonString}
            className={styles.exampleContent}
            placeholder={t('datasource.kafka_schema.wizard.consume.placeholder')}
            onChange={(event) => setJsonString(event.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const getTableConfigParams = () => {
    const columns = [
      {
        title: t('datasource.metadata.column.code'),
        dataIndex: 'code',
        render: (text, record, index) => (
          <Input
            size="small"
            value={text}
            style={{ width: '100%' }}
            placeholder={t('common.input.placeholder')}
            onChange={(event) => updateTableFieldParam(index, 'code', event.target.value)}
          />
        ),
      },
      {
        title: t('datasource.metadata.column.type'),
        dataIndex: 'valueType',
        render: (text, record, index) => (
          <Select
            size="small"
            value={text}
            style={{ width: '100%' }}
            placeholder={t('common.input.placeholder')}
            onChange={(value) => updateTableFieldParam(index, 'valueType', value)}
          >
            {_.map(DATA_TYPES, (type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        ),
      },
      {
        title: t('datasource.metadata.column.comment'),
        dataIndex: 'comment',
        render: (text, record, index) => (
          <Input
            size="small"
            value={text}
            style={{ width: '100%' }}
            placeholder={t('common.input.placeholder')}
            onChange={(event) => updateTableFieldParam(index, 'comment', event.target.value)}
          />
        ),
      },
      {
        title: '',
        width: 40,
        align: 'center',
        dataIndex: 'key',
        render: (text, record, index) => (
          <MinusCircleOutlined
            style={{ cursor: 'pointer', color: '#666' }}
            onClick={() => {
              tableFields.splice(index, 1);
              setTableFields([].concat(tableFields));
            }}
          />
        ),
      },
    ];

    return (
      <div>
        <Row justify="space-between">
          <Col className="polaris-form-item-label">
            <label>{t('datasource.kafka_schema.data_schema.title')}</label>
          </Col>
          <Col>
            <div className="cur-btn" style={{ marginTop: 6 }} onClick={addTableFieldParam}>
              <PlusOutlined style={{ fontSize: 12 }} />
              <span style={{ paddingLeft: 2 }}>{t('common.button.add')}</span>
            </div>
          </Col>
        </Row>
        <div className={styles.requestParams}>
          <Table
            size="small"
            columns={columns}
            dataSource={tableFields}
            scroll={{
              y: 320,
            }}
            rowSelection={{
              type: 'radio',
              columnWidth: 60,
              columnTitle: t('datasource.kafka_schema.column.primary_key'),
              selectedRowKeys: [curPriKey],
              onChange: handleCheckedChange,
            }}
            pagination={false}
          />
        </div>
      </div>
    );
  };

  const getTableConfigNode = () => {
    return (
      <Row gutter={[20, 0]}>
        <Col span={12}>{getTableConfigForm()}</Col>
        <Col span={12}>{getTableConfigParams()}</Col>
      </Row>
    );
  };

  return (
    <Modal
      centered
      width={1024}
      open={visible}
      title={modalTitle}
      maskClosable={false}
      footer={modalFooter()}
      onCancel={() => modal.hide()}
      {...rest}
    >
      <div className={styles.modalInner}>
        <span style={{ display: curStep === 0 ? '' : 'none' }}>{getBaseConfigNode()}</span>
        <span style={{ display: curStep === 1 ? '' : 'none' }}>{getTableConfigNode()}</span>
      </div>
    </Modal>
  );
};

export default KafkaTableModal;

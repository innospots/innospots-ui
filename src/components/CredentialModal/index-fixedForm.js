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

import React, { useState, useEffect } from 'react';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import _ from 'lodash';
import cls from 'classnames';
import map from 'lodash/map';
import styles from './index.less';

import { Row, Col, Spin, Form, Modal, Table, Input, Radio, Button, Switch } from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  CloseOutlined,
  CheckOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const dataSourceTypeList = [
  {
    icon: require('@/assets/images/dataSource/ApacheHive.png'),
    label: 'Apache Hive',
    value: 'HIVE',
  },
  {
    icon: require('@/assets/images/dataSource/postgresql-icon.svg'),
    label: 'PostgreSQL',
    value: 'POSTGRESQL',
  },
  {
    icon: require('@/assets/images/dataSource/Kudu.png'),
    disabled: true,
    label: 'Kudu',
    value: 'KUDU',
  },
  {
    icon: require('@/assets/images/dataSource/apache-kafka-icon.svg'),
    disabled: true,
    label: 'Kafka',
    value: 'KAFKA',
  },

  /**, {
  icon: require('@/assets/images/dataSource/mysql-icon.svg'),
  label: 'MySQL',
  value: 'MYSQL'
}, {
  icon: require('@/assets/images/dataSource/Parquet.png'),
  label: 'Parquet',
  value: 'PARQUET'
}, {
  icon: require('@/assets/images/dataSource/Clickhouse.png'),
  label: 'Clickhouse',
  value: 'CLICKHOUSE'
}, {
  icon: require('@/assets/images/dataSource/greenplum-icon.svg'),
  label: 'Greenplum',
  value: 'GREENPLUM'
} */
];

/**
 * 'name', 'id', 'username', 'password', 'url', 'desc'
 * @type {[*]}
 */
const formList = [
  {
    label: 'name',
    value: 'sourceName',
    required: true,
  },
  //   {
  //   label: 'id',
  //   value: 'sourceCode',
  //   required: true
  // },
  {
    label: 'username',
    value: 'authUser',
    required: true,
  },
  {
    label: 'password',
    value: 'authPass',
    required: true,
  },
  {
    label: 'url',
    value: 'jdbcUrl',
    required: true,
  },
  {
    label: 'kerberos',
    value: ['kerberosAuth', 'kerberosEnable'],
    required: false,
  },
  {
    label: 'krb5conf',
    value: ['kerberosAuth', 'krb5Conf'],
    required: false,
  },
  {
    label: 'keytab',
    value: ['kerberosAuth', 'keytabPath'],
    required: false,
  },
  {
    label: 'principal',
    value: ['kerberosAuth', 'principal'],
    required: false,
  },
  // , {
  //   label: 'desc',
  //   value: 'sourceDesc'
  // }
];

const loadingIcon = <LoadingOutlined style={{ fontSize: 16, color: '#fdc465' }} spin />;

let configIndex = 0;
const getNewConfig = () => ({
  index: configIndex++,
  key: '',
  value: '',
  isEdit: true,
});

const DataSourceModal = ({
  onSubmit,
  onTest,
  onCancel,
  testResult,
  testLoading,
  initialValues,
  ...rest
}) => {
  const [formIns] = Form.useForm();
  const [formError, setFormError] = useState({});
  const [configData, setConfigData] = useState([]);
  const [dataSource, setDataSource] = useState('HIVE');
  const [submitAble, setSubmitAble] = useState(false);
  const [kerberosEnable, setKerberosEnable] = useState(false);

  useEffect(() => {
    setSubmitAble(testResult);
  }, [testResult]);

  useEffect(() => {
    formIns.resetFields();
    formIns.setFieldsValue({
      linkType: 'JDBC',
      ...initialValues,
    });

    if (initialValues) {
      setDataSource(initialValues.sourceType || 'HIVE');
      if (initialValues.kerberosAuth) {
        setKerberosEnable(initialValues.kerberosAuth.kerberosEnable);
      }
    }
  }, [initialValues]);

  useEffect(() => {
    if (!rest.visible) {
      formIns.resetFields();
    }
  }, [rest.visible]);

  const handleUrlTest = () => {
    validate((value) => {
      if (onTest) {
        onTest(value);
      }
    });
  };

  const getFormValues = () => {
    validate((value) => {
      if (onSubmit) {
        value.kerberosAuth.kerberosEnable = kerberosEnable;
        onSubmit(value);
      }
    });
  };

  const handleValuesChange = (changedValues) => {
    setSubmitAble(false);

    _.each(_.keys(changedValues), (k) => {
      delete formError[k];
    });

    setFormError({
      ...formError,
    });
  };
  const onKeberosChange = (checked) => {
    setKerberosEnable(checked);
  };

  const validate = (callback) => {
    formIns
      .validateFields()
      .then((errorInfo) => {
        setFormError({});

        const errorFields = errorInfo.errorFields;
        if (!errorFields || !errorFields.length) {
          const values = formIns.getFieldsValue();

          if (callback) {
            callback({
              ...values,
              sourceType: dataSource,
            });
          }
        }
      })
      .catch((errorInfo) => {
        const error = {};
        _.each(errorInfo.errorFields, (field) => {
          error[field.name[0]] = field.errors[0];
        });

        setFormError(error);
      });
  };

  const getConfigData = () => {
    return _.map(configData, (item) => ({
      key: item.key,
      value: item.value,
    }));
  };

  const addConfigData = () => {
    const cd = getConfigData();
    cd.unshift(getNewConfig());

    setConfigData(cd);
  };

  const getDataSourceType = () => {
    return (
      <div className={styles.typeWrapper}>
        <div className={styles.inner}>
          <h3 className={styles.title}>
            <FormattedMessage id="component.datasource.modal.title" />
          </h3>
          <Row align="middle" gutter={[20, 26]}>
            {map(dataSourceTypeList, (item) => (
              <Col
                span={12}
                className={cls(styles.dsTypeItem, {
                  [styles.disabled]: item.disabled,
                })}
                key={['dsType', item.value].join('-')}
              >
                <div
                  className={cls(styles.inner, {
                    [styles.active]: dataSource === item.value,
                  })}
                  onClick={() => setDataSource(item.value)}
                >
                  <img src={item.icon} alt="" />
                  <p>{item.label}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  };

  const getFormItems = () => {
    return (
      <div className={styles.formItems}>
        <Form form={formIns} onValuesChange={handleValuesChange}>
          <Row>
            <Col span={24}>
              <Row gutter={[0, 20]}>
                <Col span={4} className={styles.formLabel}>
                  <span className={styles.x}>* </span>名称：
                </Col>
                <Col span={8}>
                  <div
                    className={cls(styles.formItem, {
                      [styles.hasError]: !!formError['sourceName'],
                    })}
                  >
                    <Form.Item
                      noStyle
                      name="sourceName"
                      rules={[
                        {
                          required: true,
                          message: '请输入数据源名称',
                        },
                      ]}
                    >
                      <Input placeholder="请输入数据源名称" />
                    </Form.Item>
                    <div className={styles.error}>{formError['sourceName']}</div>
                  </div>
                </Col>
                <Col span={4} className={styles.formLabel}>
                  <span className={styles.x}>* </span>连接方式：
                </Col>
                <Col span={8}>
                  <div className={styles.formItem}>
                    <Form.Item
                      noStyle
                      name="linkType"
                      rules={[
                        {
                          required: true,
                          message: '请输入连接方式',
                        },
                      ]}
                    >
                      <Radio.Group style={{ marginTop: 8 }}>
                        <Radio value="JDBC">JDBC</Radio>
                        <Radio value="CDC">CDC</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </div>
                </Col>
              </Row>
              <Row gutter={[0, 20]}>
                <Col span={4} className={styles.formLabel}>
                  <span className={styles.x}>* </span>用户名称：
                </Col>
                <Col span={8}>
                  <div
                    className={cls(styles.formItem, { [styles.hasError]: !!formError['authUser'] })}
                  >
                    <Form.Item
                      noStyle
                      name="authUser"
                      rules={[
                        {
                          required: true,
                          message: '请输入用户名称',
                        },
                      ]}
                    >
                      <Input placeholder="请输入用户名称" />
                    </Form.Item>
                    <div className={styles.error}>{formError['authUser']}</div>
                  </div>
                </Col>
                <Col span={4} className={styles.formLabel}>
                  <span className={styles.x}>* </span>密码：
                </Col>
                <Col span={8}>
                  <div
                    className={cls(styles.formItem, { [styles.hasError]: !!formError['authPass'] })}
                  >
                    <Form.Item
                      noStyle
                      name="authPass"
                      rules={[
                        {
                          required: true,
                          message: '请输入密码',
                        },
                      ]}
                    >
                      <Input.Password placeholder="请输入密码" />
                    </Form.Item>
                    <div className={styles.error}>{formError['authPass']}</div>
                  </div>
                </Col>
              </Row>
              <Row gutter={[0, 20]}>
                <Col span={4} className={styles.formLabel}>
                  <span className={styles.x}>* </span>链接URL：
                </Col>
                <Col span={20}>
                  <div
                    className={cls(styles.formItem, { [styles.hasError]: !!formError['jdbcUrl'] })}
                  >
                    <Form.Item
                      noStyle
                      name="jdbcUrl"
                      rules={[
                        {
                          required: true,
                          message: '请输入链接URL',
                        },
                      ]}
                    >
                      <Input placeholder="请输入链接URL" />
                    </Form.Item>
                    <div className={styles.error}>{formError['jdbcUrl']}</div>
                  </div>
                </Col>
              </Row>
              <Row gutter={[0, 20]}>
                <Col span={4} className={styles.formLabel}>
                  描述：
                </Col>
                <Col span={20}>
                  <div className={styles.formItem}>
                    <Form.Item name="sourceDesc" noStyle>
                      <TextArea placeholder="请输入描述" />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  const getConfigList = () => {
    const columns = [
      {
        title: '键(key)',
        dataIndex: 'key',
        render: (key, record, index) => {
          if (record.isEdit) {
            return (
              <Input
                size="small"
                value={key}
                placeholder="请输入"
                onChange={(e) => {
                  configData[index].key = e.target.value;
                  setConfigData([].concat(configData));
                }}
              />
            );
          } else {
            return key;
          }
        },
      },
      {
        title: '值(value)',
        dataIndex: 'value',
        render: (value, record, index) => {
          if (record.isEdit) {
            return (
              <Input
                size="small"
                value={value}
                placeholder="请输入"
                onChange={(e) => {
                  configData[index].value = e.target.value;
                  setConfigData([].concat(configData));
                }}
              />
            );
          } else {
            return value;
          }
        },
      },
      {
        width: 80,
        align: 'center',
        title: '操作',
        render: (value, record, index) => {
          return (
            <div className={styles.configEdit}>
              {record.isEdit ? (
                <>
                  <span
                    onClick={() => {
                      configData[index].isEdit = false;
                      setConfigData([].concat(configData));
                    }}
                  >
                    <CheckOutlined />
                  </span>
                  {/*<span*/}
                  {/*onClick={() => {*/}
                  {/*configData[index].isEdit = false*/}
                  {/*setConfigData([].concat(configData))*/}
                  {/*}}*/}
                  {/*><CloseOutlined /></span>*/}
                </>
              ) : (
                <>
                  <span
                    onClick={() => {
                      configData[index].isEdit = true;
                      setConfigData([].concat(configData));
                    }}
                  >
                    <EditOutlined />
                  </span>
                  <span
                    onClick={() => {
                      // if (configData.length > 1) {
                      configData.splice(index, 1);
                      setConfigData([].concat(configData));
                      // }
                    }}
                  >
                    <DeleteOutlined />
                  </span>
                </>
              )}
            </div>
          );
        },
      },
    ];

    return (
      <div className={styles.configList}>
        <Row gutter={[0, 20]}>
          <Col>
            <h3 className={styles.configTitle}>配置信息：</h3>
          </Col>
          <Col>
            <Button
              size="small"
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              style={{ transform: 'scale(.7)' }}
              onClick={addConfigData}
            />
          </Col>
        </Row>
        <div>
          <Table
            size="small"
            rowKey="index"
            scroll={{ y: 100 }}
            columns={columns}
            pagination={false}
            dataSource={configData}
          />
        </div>
      </div>
    );
  };

  const getTestAlert = () => {
    return testLoading ? (
      <div className={styles.testAlert}>
        <Spin indicator={loadingIcon} />
        <span>检查数据库链接…</span>
      </div>
    ) : null;
  };

  const getFooterButtons = () => {
    return (
      <Row justify="end" gutter={[10, 0]} style={{ marginTop: 24 }}>
        <Col>
          <Button
            className="ant-btn-green"
            onClick={handleUrlTest}
            loading={testLoading}
            disabled={testLoading}
          >
            测试链接
          </Button>
        </Col>
        <Col>
          <Button onClick={onCancel}>取消</Button>
        </Col>
        <Col>
          <Button type="primary" disabled={!submitAble}>
            确定
          </Button>
        </Col>
      </Row>
    );
  };

  const getFormNode = () => {
    return (
      <div className={styles.formWrapper}>
        <h3 className={styles.title}>MySQL</h3>
        {getFormItems()}
        {getConfigList()}
        {getTestAlert()}
        {getFooterButtons()}
      </div>
    );
  };

  return (
    <Modal
      width={960}
      style={{ top: 40 }}
      title={null}
      footer={null}
      maskClosable={false}
      onOk={getFormValues}
      onCancel={onCancel}
      {...rest}
      className={styles.modal}
    >
      <div>
        <Row>
          <Col flex="274px">{getDataSourceType()}</Col>
          <Col flex="686px">{getFormNode()}</Col>
        </Row>
      </div>
    </Modal>
  );
};

export default React.memo(DataSourceModal);

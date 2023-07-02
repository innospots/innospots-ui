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

import React, { useRef, useState, useEffect } from 'react';
import cls from 'classnames';
import _ from 'lodash';
import { useModel } from 'umi';

import { Row, Col, Spin, Form, Table, Input, Radio, Button, message, TableColumnsType } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import Blowfish from '@/common/utils/Blowfish';

import NiceModal from '../Nice/NiceModal';

import { fetchSecretKey } from '@/services/DataSource';

import IconButton from '@/components/IconButton';

import styles from './style.less';

const { TextArea } = Input;

const loadingIcon = <LoadingOutlined style={{ fontSize: 16, color: '#fdc465' }} spin />;

let configIndex = 0;
const getNewConfig = () => ({
  index: configIndex++,
  key: '',
  value: '',
  isEdit: true,
});

type DataSourceType = {
  sourceType?: string;
  dbType?: string;
  icon?: string;
  enabled?: boolean;
  elements?: any[];
  sourceName?: string;
};

let configDataClone;

export const MODAL_NAME = 'DataSourceModal';

const DataSourceModal: React.FC = () => {
  const { t } = useI18n(['datasource', 'common']);

  const blowfishRef = useRef(null);
  const [formIns] = Form.useForm();
  const [formError, setFormError] = useState({});
  const [defaultValue, setDefaultValue] = useState<any>({});
  const [testResult, setTestResult] = useState<boolean | undefined>();
  const [configData, setConfigData] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceType>({});
  const [submitAble, setSubmitAble] = useState(false);
  const [metaSources, setMetaSources] = useState<DataSourceType[]>([]);

  const {
    metaSources: mss,
    metaSourcesRequest,
    connectionTestRequest,
    saveDataSourceRequest,
  } = useModel('DataSource');

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const { visible, modalType, initValues } = modalInfo;

  const testLoading = connectionTestRequest.loading;
  const confirmLoading = saveDataSourceRequest.loading;

  useEffect(() => {
    setSubmitAble(!!testResult);
  }, [testResult]);

  useEffect(() => {

    if (visible) {
      setFormError({});
      setConfigData([]);
      formIns.resetFields();

      if (!mss.length) {
        setInitData();
      } else {
        setMetaSources(mss);
        updateDataSource(mss);
      }
    }
  }, [visible, mss]);

  useEffect(() => {
    if (visible && dataSource.dbType) {
      setFormValues();
    }
  }, [visible, initValues, dataSource, modalType]);

  useEffect(() => {
    if (visible) {
      if (modalType === 'edit' && initValues.encryptFormValues) {
        encryptFormValues(initValues.encryptFormValues)
      } else {
        createBlowfish()
      }
    }
  }, [visible, modalType, initValues]);

  const createBlowfish = () => new Promise<any>(async (resolve) => {
    const key = await fetchSecretKey();
    // @ts-ignore
    blowfishRef.current = new Blowfish(key);
    resolve(blowfishRef.current)
  })

  const encryptFormValues = async (text: string) => {
    try {
      const bf = await createBlowfish();

      if (text) {
        let formValues = bf.base64Decode(text);
        formValues = bf.decrypt(formValues);
        formValues = bf.trimZeros(formValues);
        formValues = _.trim(formValues);
        formValues = JSON.parse(formValues);
        const _defaultValue = {
          linkType: 'JDBC',
          ...formValues,
        };
        setDefaultValue(_defaultValue);
        formIns.setFieldsValue(_defaultValue);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateDataSource = (ms) => {
    let ds = ms[0];
    if (initValues && initValues.dbType) {
      ds = _.find(ms, (item) => item.dbType.toUpperCase() === initValues.dbType.toUpperCase());
      if (!ds) {
        ds = _.find(ms, (item) => item.dbType.toUpperCase() === 'MYSQL');
      }
    }

    setDataSource(ds);
  };

  const setFormValues = () => {
    formIns.resetFields();

    if (modalType === 'edit' && initValues) {
      let configs: any[] = [];
      if (initValues.configs) {
        for (let key in initValues.configs) {
          configs.push({
            key: key,
            value: initValues.configs[key],
          });
        }
      }
      setConfigData(configs);
    }
  };

  const handleValuesChange = (changedValues: any) => {
    setSubmitAble(false);

    _.each(_.keys(changedValues), (k) => {
      delete formError[k];
    });

    setFormError({
      ...formError,
    });
  };

  const getConfigData = () => {
    return _.map(configData, (item) => ({
      key: item.key,
      value: item.value,
    }));
  };

  const handleAddConfigData = () => {
    const isEdit = _.find(configData, item => item.isEdit);

    if (isEdit) {
      message.error(t('common.error_message.save.config'));
      return;
    }

    const cd = getConfigData();
    cd.unshift(getNewConfig());

    setConfigData(cd);
  };

  const strMapToObj = (strMap: any) => {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
      obj[k] = v;
    }
    return obj;
  };

  const encryptString = (text: string) => {
    const bf = blowfishRef.current;
    if (!bf) return '';

    // @ts-ignore
    return bf.base64Encode(bf.encrypt(text))
  }

  const testData = async (data: any) => {
    setTestResult(false);
    const result = await connectionTestRequest.runAsync(data);
    if (result) {
      message.success(t('datasource.form.msg.test_success'));
    }

    setTestResult(!!result);
  };

  const submitData = async (data: any) => {
    const type = modalType || 'add';
    const resultData = await saveDataSourceRequest.runAsync(
      {
        ...initValues,
        ...data,
      },
      type,
    );

    if (resultData) {
      message.success(t('common.error_message.save.success'));
      modal.hide();
    }
  };

  const handleUrlTest = () => {
    validate((value) => {
      testData(value);
    });
  };

  const handleSubmit = () => {
    validate((value) => {
      submitData(value);
    });
  };

  const validate = (callback: (val: any) => void) => {
    formIns
      .validateFields()
      .then((errorInfo) => {
        setFormError({});

        const errorFields = errorInfo.errorFields;
        if (!errorFields || !errorFields.length) {
          const values = formIns.getFieldsValue();

          let configs = new Map();
          _.forEach(configData, (item) => {
            let k = item.key;
            let v = item.value;
            configs.set(k, v);
          });
          const sourceType = dataSource.sourceType;
          const configsJson = JSON.parse(JSON.stringify(strMapToObj(configs)));

          if (callback) {
            callback({
              sourceType,
              name: values.name,
              dbType: dataSource.dbType,
              configs: configsJson,
              encryptFormValues: encryptString(JSON.stringify(values)),
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

  const setInitData = async () => {
    const ms = (await metaSourcesRequest.runAsync()) as DataSourceType[];
    if (ms) {
      setMetaSources(ms);
      updateDataSource(ms);
    }
  };

  const renderTypeList = () => {
    return (
      <div className={styles.leftContent}>
        <div className={styles.header}>
          <span>{t(`datasource.form.${modalType}.title`)}</span>
        </div>
        <div className={styles.dsTypeList}>
          {metaSources?.map((item) => {
            return (
              <div
                className={cls(styles.item, {
                  [styles.disabled]: !item.enabled || (modalType === 'edit'),
                  [styles.active]: dataSource.dbType === item.dbType,
                })}
                key={['dsType', item.dbType].join('-')}
                onClick={() => {
                  if (modalType === 'edit') return;

                  setFormError({});
                  setDataSource(item);
                }}
              >
                {/*icons[(item.dbType || '').toLowerCase()]*/}
                <img src={item.icon} alt="" />
                <span className={styles.label}>{item.sourceName}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFormContent = () => {
    return (
      <div className={styles.formItems}>
        <Form form={formIns} initialValues={defaultValue} onValuesChange={handleValuesChange}>
          <Row>
            <Col span={24}>
              <Row>
                {_.map(dataSource.elements, (item) => {
                  return getFormItem(item);
                })}
              </Row>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  const getFormItem = (formItem: any) => {
    let element;

    switch (formItem.type) {
      case 'RADIO':
        element = (
          <Radio.Group style={{ marginTop: 8 }}>
            {_.map(formItem.options, (option) => {
              return <Radio value={option.value}>{option.name}</Radio>;
            })}
          </Radio.Group>
        );
        break;

      case 'PASSWORD':
        element = <Input.Password placeholder={formItem.placeholder} />;
        break;

      case 'TEXTAREA':
        element = <TextArea placeholder={formItem.placeholder} />;
        break;

      default:
        element = <Input placeholder={formItem.placeholder} />;
        break;
    }

    return (
      <React.Fragment key={formItem.name}>
        <Col className={styles.formLabel} span={Math.max(formItem.labelGrid, 4)}>
          {formItem.required ? <span className={styles.x}>* </span> : null}
          {formItem.label}：
        </Col>
        <Col span={Math.max(formItem.gridSize, 8)}>
          <div className={cls(styles.formItem, { [styles.hasError]: !!formError[formItem.name] })}>
            <Form.Item
              noStyle
              name={formItem.name}
              rules={[
                {
                  message: formItem.tips,
                  required: formItem.required,
                },
              ]}
            >
              {element}
            </Form.Item>
            <div className={styles.error}>{formError[formItem.name]}</div>
          </div>
        </Col>
      </React.Fragment>
    );
  };

  const renderConfigList = () => {
    const columns: TableColumnsType<any> = [
      {
        title: t('datasource.form.column.key'),
        dataIndex: 'key',
        render: (key: string, record: any, index: number) => {
          if (record.isEdit) {
            return (
              <Input
                size="small"
                value={key}
                placeholder={t('common.input.placeholder')}
                onChange={(e) => {
                  configData[index].key = e.target.value;
                  setConfigData([...configData]);
                }}
              />
            );
          } else {
            return key;
          }
        },
      },
      {
        title: t('datasource.form.column.value'),
        dataIndex: 'value',
        render: (value: string, record: any, index: number) => {
          if (record.isEdit) {
            return (
              <Input
                size="small"
                value={value}
                placeholder={t('common.input.placeholder')}
                onChange={(e) => {
                  configData[index].value = e.target.value;
                  setConfigData([...configData]);
                }}
              />
            );
          } else {
            return value;
          }
        },
      },
      {
        width: 100,
        align: 'center',
        title: t('datasource.form.column.action'),
        render: (value: string, record: any, index: number) => {
          return (
            <div className={styles.configEdit}>
              {record.isEdit ? (
                <>
                  <span
                    onClick={() => {
                      if(_.isEmpty(configData[index].key?.trim()) || _.isEmpty(configData[index].value?.trim())){
                        message.warning(`${t('datasource.form.column.key')}或${t('datasource.form.column.value')}不能为空！`)
                        return
                      }
                      configDataClone = null;
                      configData[index].isEdit = false;
                      setConfigData([...configData]);
                    }}
                  >
                    <IconButton icon={<CheckOutlined />} />
                  </span>
                  <span
                    onClick={() => {
                      setConfigData(configDataClone || []);
                    }}
                  >
                    <IconButton icon={<CloseOutlined />} />
                  </span>
                </>
              ) : (
                <>
                  <span
                    onClick={() => {
                      configDataClone = _.cloneDeep(configData);
                      configData[index].isEdit = true;
                      setConfigData([...configData]);
                    }}
                  >
                    <IconButton icon="edit" />
                  </span>
                  <span
                    onClick={() => {
                      // if (configData.length > 1) {
                      configData.splice(index, 1);
                      setConfigData([...configData]);
                      // }
                    }}
                  >
                    <IconButton icon="delete" />
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
        <Row justify="space-between" className={styles.configTitle}>
          <Col>
            <h3>{t('datasource.form.title.config')}：</h3>
          </Col>
          <Col className={styles.configOp}>
            <Button size="small" type="link" onClick={handleAddConfigData}>
              <PlusOutlined /> {t('common.button.add')}
            </Button>
          </Col>
        </Row>
        <div>
          <Table
            size="small"
            rowKey="index"
            scroll={{ y: 260 }}
            columns={columns}
            pagination={false}
            dataSource={configData}
          />
        </div>
      </div>
    );
  };

  const renderTestAlert = () => {
    // let resultNode;
    //
    // if (testResult === true) {
    //     resultNode = (
    //         <>
    //             <Spin indicator={loadingIcon} /> <span>测试成功</span>
    //         </>
    //     )
    // } else if (testResult === false) {
    //     resultNode = (
    //         <>
    //             <Spin indicator={loadingIcon} /> <span>测试失败</span>
    //         </>
    //     )
    // }

    return (
      <div
        className={cls(styles.testAlert, {
          [styles.visible]: testLoading,
        })}
      >
        {testLoading ? (
          <>
            <Spin indicator={loadingIcon} />{' '}
            <span>{t('datasource.form.msg.check_connection')}</span>
          </>
        ) : null}
      </div>
    );
  };

  const renderConfigContent = () => {
    return (
      <div className={styles.rightContent}>
        <div className={styles.header}>
          <span>{dataSource?.sourceName}</span>
        </div>
        <div className={styles.formWrapper}>
          {renderFormContent()}
          {renderConfigList()}
          {renderTestAlert()}
        </div>
        {renderFooter()}
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className={styles.footer}>
        <Button
          className={`ant-btn-green`}
          onClick={handleUrlTest}
          loading={testLoading}
          disabled={testLoading}
        >
          {t('datasource.form.button.test_connection')}
        </Button>
        <Button onClick={() => modal.hide()}>{t('common.button.cancel')}</Button>
        <Button
          type="primary"
          disabled={!submitAble}
          loading={confirmLoading}
          onClick={handleSubmit}
        >
          {t('common.button.confirm')}
        </Button>
      </div>
    );
  };

  return (
    <NiceModal
      title={null}
      footer={null}
      width={1024}
      visible={visible}
      style={{ top: 20 }}
      onCancel={() => modal.hide()}
      wrapClassName={styles.layeredModal}
    >
      <div className={styles.modalBody}>
        {renderTypeList()}
        {renderConfigContent()}
      </div>
    </NiceModal>
  );
};

export default DataSourceModal;

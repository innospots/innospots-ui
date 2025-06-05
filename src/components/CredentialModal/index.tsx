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

import React, { useRef, useState, useEffect, useMemo } from 'react';
import cls from 'classnames';
import _ from 'lodash';
import { useModel } from 'umi';

import {
  Row,
  Col,
  Empty,
  Modal,
  Typography,
  Spin,
  Form,
  Table,
  Select,
  Switch,
  Input,
  Radio,
  Button,
  message,
  TableColumnsType,
} from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import Blowfish from '@/common/utils/Blowfish';
import Steps from '@/components/Steps';
import IconButton from '@/components/IconButton';
import { renderNodeIcon } from '@/pages/Workflow/Builder/components/NodeIcon';

import { fetchSecretKey } from '@/services/DataSource';
import { getCredentialDetail } from '@/services/Credential';
import { BASE_URL, GRID_LAYOUT_CONFIG } from '@/common/constants';

import styles from './style.less';

const { TextArea } = Input;
const { Paragraph } = Typography;

const loadingIcon = <LoadingOutlined style={{ fontSize: 16, color: '#fdc465' }} spin />;

let configIndex = 0;
const getNewConfig = () => ({
  index: configIndex++,
  key: '',
  value: '',
  isEdit: true,
});

let configDataClone;

export const MODAL_NAME = 'CredentialModal';

const CredentialModal: React.FC<{
  onSuccess?: (result) => void
}> = ({ onSuccess }) => {
  const { t } = useI18n(['datasource', 'credential', 'common']);

  const {
    appCategories,
    appCategoriesRequest,
    credentialTypes,
    credentialTypesRequest,
    saveCredentialRequest,
    connectionTestRequest,
  } = useModel('Credential');

  const blowfishRef = useRef(null);
  const [formIns] = Form.useForm();
  const [baseFormIns] = Form.useForm();
  const [baseFormValue, setBaseFormValue] = useState<any>({});
  const [curStep, setCurStep] = useState<number>(-1);
  const [readOnlyList, setReadOnlyList] = useState({});
  const [formError, setFormError] = useState({});
  const [modalLoading, setModalLoading] = useState<boolean>(
    credentialTypesRequest.loading || appCategoriesRequest.loading,
  );
  const [testResult, setTestResult] = useState<boolean | undefined>();
  const [configData, setConfigData] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any>();
  const [submitAble, setSubmitAble] = useState(false);
  const [credentialDetail, setCredentialDetail] = useState<any>({});

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const { visible, modalType, initValues } = modalInfo;
  const isEdit = modalType === 'edit';

  const testLoading = connectionTestRequest.loading;
  const confirmLoading = saveCredentialRequest.loading;

  const steps = useMemo(
    () => (
      <Steps
        items={[
          {
            title: t('credential.form.tab.base'),
            description: t('credential.form.tab.base_desc'),
          },
          {
            title: t('credential.form.tab.auth'),
            description: t('credential.form.tab.auth_desc'),
          },
        ]}
        current={curStep}
      />
    ),
    [curStep],
  );

  const modalTitle = useMemo(() => {
    return (
      <div className={styles.modalTitle}>
        <Row align="middle">
          <Col flex="290px">
            <h1>{t(`credential.form.${modalType}.title`)}</h1>
          </Col>
          <Col flex="auto"> {steps} </Col>
        </Row>
      </div>
    );
  }, [curStep, modalType]);

  useEffect(() => {
    setSubmitAble(!!testResult);
  }, [testResult]);

  useEffect(() => {
    setFormError({});
  }, [baseFormValue?.credentialType?.typeCode]);

  useEffect(() => {
    if (visible) {
      appCategoriesRequest.run();
      credentialTypesRequest.run();
    } else {
      setCurStep(-1);
      setFormError({});
      setConfigData([]);
      setBaseFormValue({});
      setReadOnlyList({});
      setCredentialDetail({});
      formIns.resetFields();
      baseFormIns.resetFields();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (isEdit) {
        if (initValues?.credentialKey) {
          fetchCredentialDetail(initValues?.credentialKey);
        }
      } else {
        setCurStep(0);
        createBlowfish();
      }
    }
  }, [visible, isEdit, initValues]);

  useEffect(() => {
    if (!credentialDetail.credentialKey) return;

    const { name, credentialTypeCode } = credentialDetail;

    const curCredentialType = _.find(
      credentialTypes || [],
      (c) => c.typeCode === credentialTypeCode,
    );
    baseFormIns.setFieldsValue({
      name,
      credentialType: { ...curCredentialType },
    });
    setBaseFormValue({
      name,
      credentialType: { ...curCredentialType },
    });

    encryptFormValues(credentialDetail);
  }, [credentialDetail.credentialKey, credentialTypes]);

  const fetchCredentialDetail = async (credentialKey: number) => {
    const originLoading = modalLoading;
    setModalLoading(true);

    const result = (await getCredentialDetail(credentialKey)) as any;
    if (result) {
      setCredentialDetail(result);
      setCurStep(isEdit ? 1 : 0);
    }
    setModalLoading(originLoading || false);
  };

  const createBlowfish = () =>
    new Promise<any>(async (resolve) => {
      if (!blowfishRef.current) {
        const key = await fetchSecretKey();
        // @ts-ignore
        blowfishRef.current = new Blowfish(key);
      }

      resolve(blowfishRef.current);
    });

  const encryptFormValues = async (formData: any) => {
    try {
      const bf = await createBlowfish();
      const text = formData.encryptFormValues;

      let formValues = '';

      if (text) {
        formValues = bf.base64Decode(text);
        formValues = bf.decrypt(formValues);
        formValues = bf.trimZeros(formValues);
        formValues = _.trim(formValues);
        formValues = JSON.parse(formValues);

        const configJson = formData?.props || {};
        const configs: any[] = [];
        for (let key in configJson) {
          configs.push({
            key: key,
            value: configJson[key],
          });
        }
        setConfigData(configs);
      }

      const newFormValues = {
        ...formData,
      };

      newFormValues.formValues = {
        ...(newFormValues.formValues || {}),
        // @ts-ignore
        ...(formValues || {}),
      };
      console.log(newFormValues, 'encryptFormValues');
      formIns.setFieldsValue(newFormValues.formValues);
    } catch (e) {
      console.error(e);
    }
  };

  const handleValuesChange = (changedValues: any) => {
    if ('name' in changedValues) {
      baseFormIns.setFieldsValue({
        ...baseFormValue,
        name: changedValues.name,
      });
      setBaseFormValue({
        ...baseFormValue,
        name: changedValues.name,
      });
    }
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
      index: item.index,
    }));
  };

  const handleAddConfigData = () => {
    const isEdit = _.find(configData, (item) => item.isEdit);

    if (isEdit) {
      message.error(t('common.error_message.save.config'));
      return;
    }
    configDataClone = _.cloneDeep(configData);

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
    return bf.base64Encode(bf.encrypt(text));
  };

  const testData = async (data: any) => {
    setTestResult(false);
    const result = (await connectionTestRequest.runAsync(data)) as any;

    if (result?.authority_url) {
      window.open(result?.authority_url, '_blank', 'width=600,height=640');
      // @ts-ignore
      window.__authCallback = (result: boolean) => {
        if (result) {
          // @ts-ignore
          window.__authCallback = null;
          validate((value) => {
            testData(value);
          });
        }
      };
    } else {
      if (result) {
        message.success(t('datasource.form.msg.test_success'));
      } else {
        message.success('Test failed');
      }
      setTestResult(!!result);
    }
  };

  const submitData = async (data: any) => {
    const type = modalType || 'add';
    const resultData = await saveCredentialRequest.runAsync(
      {
        ...credentialDetail,
        ...data,
      },
      type,
    );

    if (resultData) {
      message.success(t('common.error_message.save.success'));
      modal.hide();
      onSuccess?.(resultData)
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
        console.log(baseFormValue);
        const errorFields = errorInfo.errorFields;
        if (!errorFields || !errorFields.length) {
          const formValues = formIns.getFieldsValue();
          let configs = new Map();
          _.forEach(configData, (item) => {
            let k = item.key;
            let v = item.value;
            configs.set(k, v);
          });
          const configsJson = JSON.parse(JSON.stringify(strMapToObj(configs)));

          if (callback) {
            callback({
              name: baseFormValue.name,
              props: configsJson,
              credentialTypeCode: baseFormValue?.credentialType?.typeCode,
              connectorName: baseFormValue?.credentialType?.connectorName,
              encryptFormValues: encryptString(JSON.stringify(formValues)),
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

  const handleToConfig = () => {
    baseFormIns.validateFields().then((values) => {
      if (!isEdit) {
        setAuthConfigData(baseFormValue.credentialType);
      }
      setTimeout(() => setCurStep(1), 0);
    });
  };

  // 格式化鉴权设置下的表单数据和列表数据
  const setAuthConfigData = (data: any) => {
    const { props, formValues } = data;

    const formValue: any = {};
    const readList: any = [];
    formValues.map((form: any) => {
      formValue[form.name] = form.value;
      readList[form.name] = form.readOnly;
    });

    setDataSource(formValue);
    setReadOnlyList(readList);
    setConfigData(
      Object.keys(props || {}).map((key) => {
        return {
          key,
          value: props[key],
          index: configIndex++,
        };
      }),
    );
    console.log(setAuthConfigData, formValues, readList);
  };

  const renderFormContent = () => {
    const { connectorName, authOption } = baseFormValue.credentialType || {};

    const curApp = _.find(appCategories || [], (app) => app.name === connectorName);
    const nodeConfig = _.find(curApp?.authOptions || [], (auth) => auth.code === authOption);

    return (
      <div className={styles.formItems}>
        <Form form={formIns} initialValues={dataSource} onValuesChange={handleValuesChange}>
          <Row>
            <Col span={24}>
              <Row>{_.map(nodeConfig?.elements, (item) => getFormItem(item))}</Row>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  const getFormItem = (formItem: any) => {
    let element;

    const props = {
      SWITCH: {
        valuePropName: 'checked',
      },
    };
    let { name, readOnly, placeholder } = formItem;
    readOnly = readOnlyList[name] || readOnly;
    const elProps = {
      placeholder,
      disabled: readOnly,
      autoComplete: 'off',
    };

    switch (formItem.type) {
      case 'RADIO':
        element = (
          <Radio.Group style={{ marginTop: 8 }}>
            {_.map(formItem.options, (option) => {
              return (
                <Radio disabled={readOnly} value={option.value}>
                  {option.name}
                </Radio>
              );
            })}
          </Radio.Group>
        );
        break;

      case 'SELECT':
        const options = formItem.options || []
        element = <Select style={{ width: '100%' }} options={options.map(obj => {
          return {
            value: obj.value,
            label: obj.label || obj.name
          }
        })} {...elProps} />;
        break;

      case 'SWITCH':
        element = <Switch disabled={readOnly} style={{ marginTop: 8 }} />;
        break;

      case 'APP_TYPE':
        element = (
          <Row gutter={8} style={{ height: 38 }} align="middle">
            <Col flex="28px">{renderNodeIcon(formItem)}</Col>
            <Col>{formItem.value}</Col>
          </Row>
        );
        break;

      case 'PASSWORD':
        element = <Input.Password {...elProps} />;
        break;

      case 'TEXTAREA':
        element = <TextArea {...elProps} />;
        break;

      default:
        element = <Input {...elProps} />;
        break;
    }
    const itemKey = _.isArray(formItem.name) ? formItem.name.join('-') : formItem.name;
    const layout = GRID_LAYOUT_CONFIG

    return (
      <React.Fragment key={itemKey}>
        <Col className={styles.formLabel} span={layout[formItem.gridSize]?.labelCol || 4}>
          {formItem.required && <span className={styles.x}>* </span>}
          {formItem.label}：
        </Col>
        <Col span={layout[formItem.gridSize]?.wrapperCol || 8}>
          <div className={cls(styles.formItem, { [styles.hasError]: !!formError[formItem.name] })}>
            <Form.Item
              noStyle
              name={formItem.name}
              initialValue={formItem.value}
              rules={[
                {
                  message: formItem.tips,
                  required: formItem.required,
                },
              ]}
              {...props[formItem.type]}
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
    // if (!configData.length) return null;

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
                      if (
                        _.isEmpty(configData[index].key?.trim()) ||
                        _.isEmpty(configData[index].value?.trim())
                      ) {
                        message.warning(
                          `${t('datasource.form.column.key')}或${t(
                            'datasource.form.column.value',
                          )}不能为空！`,
                        );
                        return;
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
        {testLoading && (
          <>
            <Spin indicator={loadingIcon} />{' '}
            <span>{t('datasource.form.msg.check_connection')}</span>
          </>
        )}
      </div>
    );
  };

  const renderConfigContent = () => {
    const curCredentialType = baseFormValue.credentialType || {};
    return (
      <div className={styles.rightContent}>
        <Row style={{ flexWrap: 'nowrap' }}>
          <Col flex="auto">
            <div className={styles.formWrapper}>{renderFormContent()}</div>
          </Col>

          <Col flex="92px" className={styles.curApp}>
            <div className={styles.appItem}>
              <div className={cls(styles.inner)}>
                {renderNodeIcon(curCredentialType, { baseUrl: BASE_URL })}

                <Paragraph ellipsis className={styles.label}>
                  {curCredentialType.name}
                </Paragraph>
              </div>
            </div>
          </Col>
        </Row>

        {renderConfigList()}
        {renderTestAlert()}
      </div>
    );
  };

  const renderCredentialTypes = () => {
    return (
      <div className={styles.appList}>
        {!credentialTypes.length ? (
          <Row
            key={['empty', 'categoryCode'].join('-')}
            justify="center"
            align="middle"
            style={{ width: '100%' }}
          >
            <Col>
              <Empty />
            </Col>
          </Row>
        ) : (
          <Row
            key={['configs', 'categoryCode'].join('-')}
            gutter={[0, 12]}
            justify="start"
            align="top"
          >
            {_.map(credentialTypes, (item, index) => (
              <Col
                span={4}
                key={['config', index].join('')}
                onClick={() => {
                  const baseInfo = baseFormIns.getFieldsValue();
                  baseFormIns.setFieldsValue({
                    ...baseInfo,
                    credentialType: item,
                  });
                  setBaseFormValue({
                    ...baseInfo,
                    credentialType: item,
                  });
                }}
              >
                <Row align="middle">
                  <Col span={24}>
                    <div className={styles.appItem}>
                      <div
                        className={cls(styles.inner, {
                          [styles.active]:
                            baseFormValue?.credentialType?.typeCode === item.typeCode,
                        })}
                      >
                        {renderNodeIcon(item, { baseUrl: BASE_URL })}
                        <Paragraph ellipsis className={styles.label}>
                          {item.name}
                        </Paragraph>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        )}
      </div>
    );
  };

  /*const renderSelectApplication = () => {
    return (
      <div className={styles.applications}>
        { renderHeader() }
        <div className={styles.appTabs}>
          <Tabs
            tabPosition="left"
            style={{ height: 508 }}
            items={credentialTypes.map(item => ({
              label: (
                <div className={styles.tabLabel}>{item.name}</div>
              ),
              key: item.code,
              children: renderApplications(item.nodes)
            }))}
          />
        </div>
      </div>
    )
  }

  const renderHeader = () => {
    return (
      <Row align="middle" justify="space-between" style={{width: '100%'}}>
        <Col><span className={styles.headerTitle}>应用列表</span></Col>
        <Col>
          <Input
            size="small"
            prefix={<SearchOutlined style={{color: '#262626'}} />}
            onChange={event => setAppKeywords(event.target.value)}
          />
        </Col>
      </Row>
    )
  }*/

  const renderFooter = () => {
    return (
      <div className={styles.footer}>
        {curStep === 0 ? (
          <Button type="primary" onClick={handleToConfig}>
            {t('common.button.next')}
          </Button>
        ) : (
          <>
            {
              !isEdit && (
                <Button onClick={() => setCurStep(0)}>{t('common.button.prev')}</Button>
              )
            }
            <Button
              color="cyan"
              variant="solid"
              onClick={handleUrlTest}
              loading={testLoading}
              disabled={testLoading}
            >
              {t('datasource.form.button.test_connection')}
            </Button>
            <Button
              type="primary"
              disabled={!submitAble}
              loading={confirmLoading}
              onClick={handleSubmit}
            >
              {t('common.button.confirm')}
            </Button>
          </>
        )}
      </div>
    );
  };

  const renderBaseConfig = () => {
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 16 },
    };

    return (
      <Spin spinning={modalLoading}>
        <div className={styles.formItems}>
          <Form form={baseFormIns} {...formItemLayout} onValuesChange={handleValuesChange}>
            <Row>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label={t('credential.form.label.name')}
                  rules={[{ required: true, max: 50, message: t('credential.form.error.name') }]}
                >
                  <Input placeholder={t('credential.form.error.name')} style={{ width: '80%' }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="credentialType"
                  label={t('credential.form.label.type')}
                  rules={[{ required: true, message: t('credential.form.error.type') }]}
                >
                  {renderCredentialTypes()}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Spin>
    );
  };

  return (
    <Modal
      width={908}
      open={visible}
      title={modalTitle}
      footer={renderFooter()}
      style={{ top: 20 }}
      styles={{
        body: {
          minHeight: 400,
        },
      }}
      wrapClassName={styles.layeredModal}
      onCancel={() => modal.hide()}
    >
      {curStep > -1 && (
        <div className={styles.modalBody}>
          {curStep === 0 ? renderBaseConfig() : renderConfigContent()}
        </div>
      )}
    </Modal>
  );
};

export default CredentialModal;

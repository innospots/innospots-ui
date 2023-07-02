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

import React, {useRef, useState, useEffect, useMemo} from 'react';
import cls from 'classnames';
import _ from 'lodash';
import { useModel } from 'umi';

import {Row, Col, Tabs, Empty, Modal, Typography, Spin, Form, Table, Select, Switch, Input, Radio, Button, message, TableColumnsType} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import Blowfish from '@/common/utils/Blowfish';
import Steps from "@/components/Steps";
import IconButton from "@/components/IconButton";
import { renderNodeIcon } from '@/pages/Workflow/Builder/components/NodeIcon';

import { fetchSecretKey } from '@/services/DataSource';
import { getCredentialDetail } from '@/services/Credential';

import styles from './style.less';

const defaultPic = require('@/assets/images/common/s_logo.png');

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

type CredentialType = {
  name: string;
  code: string;
  nodeId: number;
  configCode: string;
  connectType: string;
  credentialType: string;
  icon?: string;
  config: boolean;
  enabled?: boolean;
  elements?: any[];
};

type NodeType = {
  defaults?: Record<string, any>;
  elements?: any[];
};

let configDataClone;

const STEPS = [{
  title: '选择应用',
  description: '选择需要接入平台的应用',
}, {
  title: '凭据设置',
  description: '应用连接参数和账户鉴权信息',
}];

const DEFAULT_FORM_ITEMS = [{
  name: 'name',
  label: '凭据名称',
  required: true,
  placeholder: '请输入'
}];

export const MODAL_NAME = 'CredentialModal';

const getImage = (src, style?: any) => <img src={src || defaultPic} style={style} onError={(event) => ((event.target as any).src = defaultPic)} alt=""/>

const CredentialModal: React.FC<{
  initNodeId?: number
}> = ({ initNodeId }) => {
  const { t } = useI18n(['datasource', 'credential', 'common']);

  const blowfishRef = useRef(null);
  const [formIns] = Form.useForm();
  const [curStep, setCurStep] = useState<number>(-1);
  const [appInfo, setAppInfo] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState({});
  const [appKeywords, setAppKeywords] = useState<string>('');
  // const [defaultValue, setDefaultValue] = useState<any>({});
  const [testResult, setTestResult] = useState<boolean | undefined>();
  const [configData, setConfigData] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<CredentialType | undefined>();
  const [submitAble, setSubmitAble] = useState(false);
  const [nodeConfig, setNodeConfig] = useState<NodeType | undefined>();
  const [nodeConfigEls, setNodeConfigEls] = useState<any[]>([]);
  const [credentialDetail, setCredentialDetail] = useState<any>({});

  const {
    appCategories,
    appCategoriesRequest,
    nodeConfigsRequest,
    saveCredentialRequest,
    connectionTestRequest
  } = useModel('Credential');

  const {
    appInfoRequest
  } = useModel('App', model => ({
    appInfoRequest: model.appInfoRequest
  }));

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const { visible, modalType, initValues } = modalInfo;
  const isEdit = modalType === 'edit';

  const testLoading = connectionTestRequest.loading;
  const confirmLoading = saveCredentialRequest.loading;

  const steps = useMemo(() => <Steps items={STEPS} current={curStep} />, [curStep]);
  const isShowPrevBtn = useMemo(() => (!isEdit && !initNodeId), [ isEdit, initNodeId ]);

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
    setFormError({})
  }, [dataSource?.configCode]);

  useEffect(() => {
    if (curStep === 1 && dataSource?.nodeId) {
      fetchNodeConfigs(dataSource.nodeId)
    } else if (curStep === 0) {
      setNodeConfig({
        elements: []
      })
    }
  }, [ curStep, dataSource?.nodeId ]);

  useEffect(() => {
    if (visible) {
      appCategoriesRequest.run();
    } else {
      setNodeConfig({});
      setCurStep(-1);
      setFormError({});
      setConfigData([]);
      formIns.resetFields();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && appCategories.length) {
      if (isEdit) {
        if (initValues?.credentialId) {
          fetchCredentialDetail(initValues?.credentialId)
        }
      } else {
        if (initNodeId) {
          getDefaultDataSource();
        } else {
          setCurStep(0);
          setDataSource(undefined);
        }
        createBlowfish()
      }
    }
  }, [visible, isEdit, initNodeId, initValues, appCategories]);

  const fetchCredentialDetail = async (credentialId: number) => {
    const result = await getCredentialDetail(credentialId) as any;
    if (result) {
      setCredentialDetail(result);
      const ds = _.find(appCategories[0].nodes, item => item.code === result.appNodeCode);
      if (ds) {
        setCurStep(1);
        setDataSource(ds);
        encryptFormValues(result)
      } else {
        setCurStep(0);
        setDataSource(undefined);
        createBlowfish()
      }
    }
  }

  const getDefaultDataSource = () => {
    const findResult = getDataSource(initNodeId);
    if (findResult) {
      setCurStep(1);
    } else {
      setCurStep(0);
    }
    setDataSource(findResult);
  }

  const getDataSource = (nodeId) => {
    let findResult;
    _.find(appCategories, category => {
      if (category.code === 'all') {
        findResult = _.find(category.nodes, node => node.nodeId === nodeId);
        return true;
      }
    });

    return findResult
  }

  const updateConfigs = (info = appInfo, configCode?: string) => {
    const connectorConfigs = info.connectorConfigs;
    const curConfig = configCode ? _.find(connectorConfigs, item => item.configCode === configCode) : connectorConfigs[0];

    if (curConfig) {
      setConfigData(_.map(curConfig.props, (value, key) => ({
        key,
        value,
        index: configIndex++,
      })))
    }
  }

  const updateConfigForms = (configs = nodeConfigEls, configCode?: string) => {
    const appTypeItem = {
      type: 'APP_TYPE',
      name: 'appNodeCode',
      label: '应用类型',
      icon: dataSource?.icon,
      value: dataSource?.code
    };
    let otherElements: any[] = [];
    const elements: any[] = [ ...DEFAULT_FORM_ITEMS ];

    elements.push(appTypeItem);

    let curConfig: any = {};
    if (configs && configs.length) {
      curConfig = configCode ? (_.find(configs, item => item.code === configCode) || configs[0]) : configs[0];
      if (configs.length > 1) {
        elements.push({
          type: 'SELECT',
          name: 'configCode',
          label: '授权类型',
          required: true,
          value: curConfig.code,
          options: _.map(configs, item => ({ value: item.code, label: item.name })),
          placeholder: '请选择授权类型'
        });
        otherElements = _.map(curConfig.elements, item => ({
          ...item,
          name: ['formValues', curConfig.code, item.name]
        }));
      } else {
        otherElements = _.map(curConfig.elements, item => ({
          ...item,
          name: ['formValues', item.name]
        }));
      }
    }

    const configData = {
      ...nodeConfig,
      code: curConfig.code,
      defaults: curConfig.defaults,
      elements: elements.concat(otherElements)
    };

    try {
      _.each(configData.elements, item => {
        if (['SWITCH', 'SELECT', 'RADIO'].includes(item.type)) {
          const formName = item.name.join(',');
          if (_.isUndefined(configData.defaults[formName]) && _.isUndefined(item.value)) {
            // @ts-ignore
            item.value = false;
          }
        }
      })
    } catch (e) {}

    setNodeConfig(configData);
  }

  const fetchNodeConfigs = async (nodeId: number) => {
    const result = await nodeConfigsRequest.runAsync(nodeId);
    const infoResult = await appInfoRequest.runAsync(nodeId);

    updateConfigForms(result, initValues?.configCode);

    if (!isEdit) {
      updateConfigs(infoResult)
    }

    setAppInfo(infoResult);
    setNodeConfigEls(result);
  }

  const createBlowfish = () => new Promise<any>(async (resolve) => {
    if (!blowfishRef.current) {
      const key = await fetchSecretKey();
      // @ts-ignore
      blowfishRef.current = new Blowfish(key);
    }

    resolve(blowfishRef.current)
  })

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
        ...formData
      };

      if (newFormValues.configCode) {
        newFormValues.formValues = {
          [newFormValues.configCode]: formValues || {}
        }
      }

      newFormValues.formValues = {
        ...(newFormValues.formValues || {}),
        // @ts-ignore
        ...(formValues || {})
      }

      formIns.setFieldsValue(newFormValues);
    } catch (e) {
      console.error(e);
    }
  };

  const handleValuesChange = (changedValues: any) => {
    setSubmitAble(false);
    
    if ('configCode' in changedValues) {
      updateConfigs(appInfo, changedValues.configCode);
      updateConfigForms(nodeConfigEls, changedValues.configCode);
    }

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
      index: item.index
    }));
  };

  const handleAddConfigData = () => {
    const isEdit = _.find(configData, item => item.isEdit);

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
    return bf.base64Encode(bf.encrypt(text))
  }

  const testData = async (data: any) => {
    setTestResult(false);
    const result = await connectionTestRequest.runAsync(data);
    if (result) {
      message.success(t('datasource.form.msg.test_success'));
    } else {
      message.success('Test failed');
    }

    setTestResult(!!result);
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
          const formValues = values.configCode ? values.formValues?.[values.configCode] : values.formValues;

          let configs = new Map();
          _.forEach(configData, (item) => {
            let k = item.key;
            let v = item.value;
            configs.set(k, v);
          });
          const configsJson = JSON.parse(JSON.stringify(strMapToObj(configs)));

          if (callback) {
            callback({
              props: configsJson,
              // @ts-ignore
              configCode: nodeConfig.code,
              connectorName: appInfo.connectorName,
              encryptFormValues: encryptString(JSON.stringify(formValues)),
              ..._.pick(values, ['name', 'configCode', 'appNodeCode'])
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
    setCurStep(1);
  }

  const renderFormContent = () => {
    return (
      <div className={styles.formItems}>
        <Form form={formIns} initialValues={nodeConfig?.defaults} onValuesChange={handleValuesChange}>
          <Row>
            <Col span={24}>
              <Row>
                {_.map(nodeConfig?.elements, (item) => getFormItem(item))}
              </Row>
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
        valuePropName: 'checked'
      }
    };
    const { readOnly, placeholder } = formItem;
    const elProps = {
      placeholder,
      disabled: readOnly,
      autoComplete: 'off'
    };

    switch (formItem.type) {
      case 'RADIO':
        element = (
          <Radio.Group style={{ marginTop: 8 }}>
            {_.map(formItem.options, (option) => {
              return <Radio disabled={readOnly} value={option.value}>{option.name}</Radio>;
            })}
          </Radio.Group>
        );
        break;

      case 'SELECT':
        element = (
          <Select style={{width: '100%'}} options={formItem.options} { ...elProps } />
        );
        break;

      case 'SWITCH':
        element = <Switch disabled={readOnly} style={{marginTop: 8}} />;
        break;

      case 'APP_TYPE':
        element = (
          <Row gutter={8} style={{height: 38}} align="middle">
            <Col flex="28px">{ renderNodeIcon(formItem) }</Col>
            <Col>{ formItem.value }</Col>
          </Row>
        );
        break;

      case 'PASSWORD':
        element = <Input.Password { ...elProps } />;
        break;

      case 'TEXTAREA':
        element = <TextArea { ...elProps } />;
        break;

      default:
        element = <Input { ...elProps } />;
        break;
    };

    return (
      <React.Fragment key={formItem.name}>
        <Col className={styles.formLabel} span={4}>
          {formItem.required && <span className={styles.x}>* </span>}
          {formItem.label}：
        </Col>
        <Col span={8}>
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
              { ...props[formItem.type] }
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
    if (!configData.length) return null;

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
        <div className={styles.formWrapper}>
          {renderFormContent()}
          {renderConfigList()}
          {renderTestAlert()}
        </div>
      </div>
    );
  };

  const renderApplications = (nodes: any[]) => {
    const configs = _.filter(nodes, item => (item.name || '').toLowerCase().indexOf(appKeywords.toLowerCase()) > -1);

    return (
      <div className={styles.appList}>
        {
          !configs.length ? (
            <Row key={['empty', 'categoryCode'].join('-')} justify="center" align="middle" style={{width: '100%'}}>
              <Col><Empty /></Col>
            </Row>
          ) : (
            <Row key={['configs', 'categoryCode'].join('-')} gutter={[0, 12]} justify="start" align="top">
              {
                _.map(configs, (item, index) => (
                  <Col span={4} key={['config', index].join('')} onClick={() => setDataSource(item)}>
                    <Row align="middle">
                      <Col span={24}>
                        <div className={styles.appItem}>
                          <div className={cls(styles.inner, {
                            [styles.active]: dataSource?.code === item.code
                          })}>
                            { renderNodeIcon(item) }
                            <Paragraph ellipsis className={styles.label}>{ item.name }</Paragraph>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                ))
              }
            </Row>
          )
        }
      </div>
    )
  }

  const renderSelectApplication = () => {
    return (
      <div className={styles.applications}>
        { renderHeader() }
        <div className={styles.appTabs}>
          <Tabs
            tabPosition="left"
            style={{ height: 508 }}
            items={appCategories.map(item => ({
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
  }

  const renderFooter = () => {
    return (
      <div className={styles.footer}>
        {
          curStep === 0 ? (
            <Button
              type="primary"
              disabled={!dataSource}
              onClick={handleToConfig}
            >
              {t('common.button.next')}
            </Button>
          ) : (
            <>
              {
                isShowPrevBtn && (
                  <Button onClick={() => setCurStep(0)}>
                    {t('common.button.prev')}
                  </Button>
                )
              }
              <Button
                className={`ant-btn-green`}
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
          )
        }
      </div>
    );
  };

  return (
    <Modal
      width={1008}
      open={visible}
      title={modalTitle}
      footer={renderFooter()}
      style={{ top: 20 }}
      bodyStyle={{ minHeight: 500 }}
      wrapClassName={styles.layeredModal}
      onCancel={() => modal.hide()}
    >
      {
        curStep > -1 && (
          <div className={styles.modalBody}>
            { curStep === 0 ? renderSelectApplication() : renderConfigContent() }
          </div>
        )
      }
    </Modal>
  );
};

export default CredentialModal;

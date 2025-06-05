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

import React, {useEffect, useMemo, useState} from 'react';
import cls from 'classnames';
import _ from 'lodash';
import {useModel} from 'umi';

import {
  Avatar,
  TableColumnsType
} from 'antd';
import {
  Button,
  Checkbox,
  Col,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Spin,
  Switch,
  Table,
  Tabs,
  Typography,
  Upload
} from 'antd';
import {CheckOutlined, CloseOutlined, LoadingOutlined, PlusOutlined, SyncOutlined,} from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import Steps from "@/components/Steps";
import IconButton from "@/components/IconButton";
import {renderNodeIcon} from '@/pages/Workflow/Builder/components/NodeIcon';

import styles from './style.less';
import {usePermission} from "@/components/PermissionSection";
import {useMemoizedFn} from 'ahooks';
import {BASE_URL, NAME_VALID_REGEX, GRID_LAYOUT_CONFIG} from "@/common/constants";
import {formatImagePath} from "@/common/utils";

const {TextArea} = Input;
const {Paragraph} = Typography;

const loadingIcon = <LoadingOutlined style={{fontSize: 16, color: '#fdc465'}} spin/>;

let configIndex = 0;
const getNewConfig = () => ({
  index: configIndex++,
  key: '',
  value: '',
  isEdit: true,
});

let configDataClone;

export const MODAL_NAME = 'CredentialTypeModal';

const CredentialTypeModal: React.FC = () => {
  const {t} = useI18n(['datasource', 'credential', 'common']);

  // const [uploadAuth] = usePermission('SysConfig-uploadImage');

  const [imgData, setImgData] = useState<any>({
    imgUrl: null,
    loading: false,
  });

  const [formIns] = Form.useForm();
  const [baseFormIns] = Form.useForm();
  const [curStep, setCurStep] = useState<number>(-1);
  // 已启用的配置code
  const [openKey, setOpenKey] = useState<any>(null);

  // 当前选中的凭据类型应用
  const [baseFormValue, setBaseFormValue] = useState<any>({});
  const [curAuthOption, setCurAuthOption] = useState<any>({});

  const [readOnlyList, setReadOnlyList] = useState({});
  const [formError, setFormError] = useState({});
  const [configData, setConfigData] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any>();

  // 鉴权配置表单集合
  const [authFormObj, setAuthFormObj] = useState<any>({})

  const {
    appCategories,
    appCategoriesRequest,
    saveCredentialTypeRequest
  } = useModel('CredentialType');

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const {visible, modalType, initValues} = modalInfo;

  const confirmLoading = saveCredentialTypeRequest.loading;

  const steps = useMemo(() => <Steps items={[{
    title: t('credentialType.form.tab.base'),
    description: t('credentialType.form.tab.base_desc'),
  }, {
    title: t('credentialType.form.tab.auth'),
    description: t('credentialType.form.tab.auth_desc'),
  }]} current={curStep}/>, [curStep]);

  const modalTitle = useMemo(() => {
    return (
      <div className={styles.modalTitle}>
        <Row align="middle">
          <Col flex="290px">
            <h1>{t(`credentialType.form.title.${modalType}`)}</h1>
          </Col>
          <Col flex="auto"> {steps} </Col>
        </Row>
      </div>
    );
  }, [curStep, modalType]);

  useEffect(() => {
    setFormError({})
  }, [dataSource?.typeCode]);

  useEffect(() => {
    if (visible) {
      appCategoriesRequest.run();
      if (initValues && initValues.icon) {
        const curIcon = formatImagePath(initValues.icon, BASE_URL);
        setImgData({
          imgUrl: curIcon,
          loading: false
        });
      }
      if (initValues && modalType === 'edit') {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        initFormValue()
      } else {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        initModal()
      }
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      initModal()
    }
  }, [visible, modalType, initValues]);

  useEffect(() => {
    if (initValues && modalType === 'edit') {
      initFormValue()
    }
  }, [appCategories]);

  useEffect(() => {
    formIns.resetFields()
    formIns.setFieldsValue(authFormObj[curAuthOption.code] || {})
  }, [curAuthOption.code]);

  const initModal = () => {
    setCurStep(0);
    setOpenKey(null);
    setImgData({
      imgUrl: null,
      loading: false,
    });
    setReadOnlyList({});
    setFormError({});
    setDataSource({});
    setConfigData([]);
    setBaseFormValue({});
    setCurAuthOption({});
    setAuthFormObj({});
    formIns.resetFields();
    baseFormIns.resetFields();
  }

  const initFormValue = () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const baseFormValue: any = _.pick(initValues, ['name', 'icon', 'typeCode'])
    const curApp = _.find(appCategories, app => app.name === initValues.connectorName) || {}
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const curAuthOption = _.find(curApp.authOptions || [], option => option.code === initValues.authOption) || {}
    console.log(initValues, 'initFormValue');
    baseFormValue.appType = {...curApp}
    baseFormIns.setFieldsValue({...baseFormValue});
    setBaseFormValue({...baseFormValue});
    setCurAuthOption({...curAuthOption});
    setOpenKey(initValues.authOption);
  }

  const handleValuesChange = (changedValues: any, formValues: any) => {
    console.log(changedValues, formValues, curAuthOption.code, 'handleValuesChange');
    setAuthFormObj({
      ...authFormObj,
      [curAuthOption.code]: formValues
    })

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
    // eslint-disable-next-line @typescript-eslint/no-shadow
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
    const obj = Object.create(null);
    for (const [k, v] of strMap) {
      obj[k] = v;
    }
    return obj;
  };

  const submitData = async (data: any) => {
    const type = modalType || 'add';
    const resultData = await saveCredentialTypeRequest.runAsync(
      {
        ...data,
      },
      type,
    );

    if (resultData) {
      message.success(t('common.error_message.save.success'));
      modal.hide();
    }
  };

  const handleSubmit = () => {
    const curAppAuthOptions = baseFormValue.appType?.authOptions || []
    // 有多个鉴权类型时，必须要有一项为开启状态才可以保存，如果没有开启状态，则确定按钮提示，没有开启的鉴权设置
    // console.log(curAppAuthOptions, openKey, !openKey);
    if (curAppAuthOptions.length > 1 && !openKey) {
      message.warning('没有开启的鉴权设置');
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    validate((value) => {
      submitData(value);
    });
  };

  const validate = (callback: (val: any) => void) => {
    const curApp = baseFormValue.appType
    formIns
      .validateFields()
      .then((values) => {
        setFormError({});

        const errorFields = values.errorFields;
        if (!errorFields || !errorFields.length) {
          const formData: any [] = [];
          for (let key in values) {
            if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
              formData.push({
                name: key,
                value: values[key],
                readOnly: readOnlyList[key]
              })
            }
          }

          const configs = new Map();
          _.forEach(configData, (item) => {
            const k = item.key;
            const v = item.value;
            configs.set(k, v);
          });
          const configsJson = JSON.parse(JSON.stringify(strMapToObj(configs)));
          if (callback) {
            const params: any = {
              props: configsJson,
              connectorName: curApp?.name,
              icon: imgData?.imgUrl || curApp?.icon,
              authOption: curAuthOption.code || curApp?.authOptions[0]?.code,
              formValues: formData,
              name: baseFormValue?.name,
              typeCode: baseFormValue?.typeCode,
            }
            // @ts-ignore
            callback(params);
          }
        }
      })
      .catch((errorInfo) => {
        const error = {};
        _.each(errorInfo.errorFields, (field) => {
          error[field.name[0]] = field.errors[0];
        });
        console.log(errorInfo, 'errorInfo');
        setFormError(error);
      });
  };

  const handleToConfig = () => {
    baseFormIns.validateFields().then((values) => {
      setBaseFormValue(values || {})

      if (initValues.formValues) {
        const formValue: any = {}
        const readList: any = []
        initValues.formValues.map((form) => {
          formValue[form.name] = form.value
          readList[form.name] = form.readOnly
        })
        formIns.setFieldsValue(formValue);
        setReadOnlyList(readList);
        setDataSource(formValue);
        setAuthFormObj({
          [initValues.authOption]: {...formValue}
        })
        setConfigData(Object.keys(initValues.props || {}).map((key) => {
          return {
            key,
            value: initValues.props[key],
            index: configIndex++,
          }
        }));
      }

      if (initValues.connectorName === baseFormValue?.appType?.name) {
        const curApp = _.find(appCategories, app => app.name === initValues.connectorName) || {}
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const curAuthOption = _.find(curApp.authOptions || [], option => option.code === initValues.authOption) || {}
        console.log(initValues, 'initFormValue');
        baseFormValue.appType = {...curApp}
        baseFormIns.setFieldsValue({...baseFormValue});
        setBaseFormValue({...baseFormValue});
        setCurAuthOption({...curAuthOption});
        setOpenKey(initValues.authOption);
      } else {
        setCurAuthOption(values?.appType?.authOptions[0])
        setOpenKey(values?.appType?.authOptions[0].code)
        setAuthFormObj({})
      }

      setTimeout(() => setCurStep(1), 100)
    });
  }

  const renderFormContent = () => {
    return (
      <div className={styles.formItems} style={{ marginTop: 32 }}>
        <Form form={formIns} initialValues={curAuthOption?.defaults || {}} onValuesChange={handleValuesChange}>
          <Row>
            <Col span={24}>
              <Row>
                {/* eslint-disable-next-line @typescript-eslint/no-shadow,@typescript-eslint/no-use-before-define */}
                {_.map(curAuthOption?.elements, (item) => getFormItem(item))}
              </Row>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  const handleClickBox = (event, item) => {
    const value = event.target.checked

    setReadOnlyList({
      ...readOnlyList,
      [item.name]: value
    })
  }

  const getFormItem = (formItem: any) => {
    let element;
    const curAppAuthOptions = baseFormValue.appType?.authOptions || []
    const props = {
      SWITCH: {
        valuePropName: 'checked'
      }
    };
    const {readOnly, placeholder} = formItem;

    // 判断当前配置是否启用
    const isOpen = curAuthOption.code === openKey
    // 当表单项的为空时，只读的项不可勾选；
    const readDisabled = !(authFormObj[curAuthOption.code] || {})[formItem.name]
    const isReadOnly = readOnly || (curAppAuthOptions.length > 1 && !isOpen)

    const elProps = {
      placeholder,
      style: {width: 'calc(100% - 72px)'},
      disabled: isReadOnly,
      autoComplete: 'off'
    };
    const layout = GRID_LAYOUT_CONFIG

    switch (formItem.type) {
      case 'RADIO':
        element = (
          <Radio.Group style={{width: 'calc(100% - 72px)', marginTop: 8}}>
            {_.map(formItem.options, (option) => {
              return <Radio value={option.value} disabled={isReadOnly}>{option.name}</Radio>;
            })}
          </Radio.Group>
        );
        break;

      case 'SELECT':
        let options = formItem.options || []
        element = (
          <Select options={options.map(obj => {
            return {
              value: obj.value,
              label: obj.label || obj.name
            }
          })} {...elProps} />
        );
        break;

      case 'SWITCH':
        element = <Switch style={{marginTop: 8}} disabled={isReadOnly}/>;
        break;

      case 'APP_TYPE':
        element = (
          <Row gutter={8} style={{width: 'calc(100% - 72px)', height: 38}} align="middle">
            <Col flex="28px">{renderNodeIcon(formItem, {
              baseUrl: BASE_URL
            })}</Col>
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

    const itemRules = formItem.expression ? [
      {
        message: formItem.tips,
        pattern: formItem.expression ? new RegExp(formItem.expression) : null,
        // required: formItem.required,
      },
    ] : [];

    return (
      <React.Fragment key={itemKey}>
        <Col className={styles.formLabel} span={layout[formItem.gridSize]?.labelCol || 4}>
          {/*{formItem.required && <span className={styles.x}>* </span>}*/}
          {formItem.label}：
        </Col>
        <Col span={layout[formItem.gridSize]?.wrapperCol || 8}>
          <div className={cls(styles.formItem, {[styles.hasError]: !!formError[formItem.name]})}>
            <Form.Item
              noStyle
              name={formItem.name}
              initialValue={formItem.value}
              rules={itemRules}
              {...props[formItem.type]}
            >
              {element}
            </Form.Item>
            <div style={{
              width: '72px',
              minHeight: 38,
              float: 'right',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Checkbox
                checked={readOnlyList[formItem.name]}
                onChange={(e) => handleClickBox(e, formItem)}
                disabled={readDisabled || isReadOnly}
              >只读</Checkbox>
            </div>
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
                      if (_.isEmpty(configData[index].key?.trim()) || _.isEmpty(configData[index].value?.trim())) {
                        message.warning(`${t('datasource.form.column.key')}或${t('datasource.form.column.value')}不能为空！`)
                        return
                      }
                      configDataClone = null;
                      configData[index].isEdit = false;
                      setConfigData([...configData]);
                    }}
                  >
                    <IconButton icon={<CheckOutlined/>}/>
                  </span>
                  <span
                    onClick={() => {
                      setConfigData(configDataClone || []);
                    }}
                  >
                    <IconButton icon={<CloseOutlined/>}/>
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
                    <IconButton icon="edit"/>
                  </span>
                  <span
                    onClick={() => {
                      // if (configData.length > 1) {
                      configData.splice(index, 1);
                      setConfigData([...configData]);
                      // }
                    }}
                  >
                    <IconButton icon="delete"/>
                  </span>
                </>
              )}
            </div>
          );
        },
      },
    ];

    return (
      <div className={styles.configList} style={{padding: '0 36px'}}>
        <Row justify="space-between" className={styles.configTitle}>
          <Col>
            <h3>{t('datasource.form.title.config')}：</h3>
          </Col>
          <Col className={styles.configOp}>
            <Button size="small" type="link" onClick={handleAddConfigData}>
              <PlusOutlined/> {t('common.button.add')}
            </Button>
          </Col>
        </Row>
        <div>
          <Table
            size="small"
            rowKey="index"
            scroll={{y: 260}}
            columns={columns}
            pagination={false}
            dataSource={configData}
          />
        </div>
      </div>
    );
  };

  const renderConfigContent = () => {
    const curApp = baseFormValue.appType || {}
    const nodeIcon = {
      icon: imgData.imgUrl || curApp.icon
    }

    return (
      <div className={styles.rightContent}>
        <Row style={{flexWrap: 'nowrap'}}>
          <Col flex="auto" style={{padding: '0 36px'}}>
            {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
            {renderAuthConfig()}
          </Col>

          <Col flex="92px" className={styles.curApp}>
            <div className={styles.appItem}>
              <div className={cls(styles.inner)}>
                {renderNodeIcon(nodeIcon, {
                  baseUrl: BASE_URL
                })}

                <Paragraph ellipsis className={styles.label}>{curApp.name}</Paragraph>
              </div>
            </div>
          </Col>
        </Row>

        {renderConfigList()}
      </div>
    );
  };

  const renderAuthConfig = () => {
    const curAppAuthOptions = baseFormValue.appType?.authOptions || []

    if (curAppAuthOptions.length > 1) {
      return (
        <Tabs
          destroyInactiveTabPane={true}
          activeKey={curAuthOption.code || curAppAuthOptions[0]?.code}
          items={curAppAuthOptions.map((item, index) => ({
            label: (
              <div className={styles.tabLabel} key={['tab-item', index].join('-')} onClick={() => {
                setCurAuthOption(item)
              }}>{item.name}</div>
            ),
            key: item.code,
            children: (
              <>
                <Row>
                  <Col>启用： </Col>
                  <Col>
                    <Switch checked={item.code === openKey} onClick={(checked) => {
                      if (checked) {
                        setOpenKey(item.code)
                      } else {
                        setOpenKey(null)
                      }
                    }}/>
                  </Col>
                </Row>
                <div className={styles.formWrapper}>
                  {renderFormContent()}
                </div>
              </>
            )
          }))}
        />
      )
    } else {
      return (
        <div className={styles.formWrapper}>
          {renderFormContent()}
        </div>
      )
    }
  }

  const renderApplications = () => {

    return (
      <div className={styles.appList}>
        {
          !appCategories.length ? (
            <Row key={['empty', 'categoryCode'].join('-')} justify="center" align="middle" style={{width: '100%'}}>
              <Col><Empty/></Col>
            </Row>
          ) : (
            <Row key={['configs', 'categoryCode'].join('-')} gutter={[0, 12]} justify="start" align="top">
              {
                _.map(appCategories, (item, index) => (
                  <Col span={4} key={['config', index].join('')} onClick={() => {
                    baseFormIns.setFieldsValue({
                      ...baseFormValue,
                      appType: item
                    })
                    setBaseFormValue({
                      ...baseFormValue,
                      appType: item
                    })
                    const curIcon = formatImagePath(item.icon, BASE_URL);
                    setImgData({
                      imgUrl: curIcon,
                      loading: false
                    });
                  }}>
                    <Row align="middle">
                      <Col span={24}>
                        <div className={styles.appItem}>
                          <div className={cls(styles.inner, {
                            [styles.active]: baseFormValue?.appType?.name === item.name
                          })}>
                            {renderNodeIcon(item, {
                              baseUrl: BASE_URL
                            })}
                            <Paragraph ellipsis className={styles.label}>{item.name}</Paragraph>
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

  /**
   获取file，通过FileReader获取图片的 base64
   */
  function customRequest(option) {
    const formData = new FormData();
    formData.append("files[]", option.file);
    const reader = new FileReader();
    reader.readAsDataURL(option.file);
    reader.onloadend = function (e) {
      // @ts-ignore
      const base64Url = e.target.result
      setImgData({
        loading: false,
        imgUrl: base64Url,
      });
      if (e && e.target && e.target.result) {
        option.onSuccess();
      }
    };
  }

  const handleImgChange = useMemoizedFn((type: string) => (info: any) => {
    if (info.file.status === 'error') {
      setImgData({
        imgUrl: null,
        loading: false,
      });
      return;
    }

    if (info.file.status === 'uploading') {
      setImgData({
        ...imgData,
        loading: true,
      });
      return;
    }

    if (info.file.status === 'done') {
      setImgData({
        ...imgData,
        loading: false,
      });
    }
  });

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('请上传jpg或png格式文件!');
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('上传图片大于1MB!');
    }
    return isJpgOrPng;
  };

  const renderBaseConfig = () => {

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 16},
    };

    const uploadButton = () => (
      <div>
        {imgData.loading ? <SyncOutlined spin/> : <PlusOutlined/>}
        <div className="polaris-upload-text">Upload</div>
      </div>
    );

    return (
      <Spin spinning={appCategoriesRequest.loading}>
        <div className={styles.formItems} style={{ marginTop: 32 }}>
          <Form form={baseFormIns} {...formItemLayout}>
            <Row>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label={t('credentialType.main.list.type_name')}
                  rules={[
                    {required: true, max: 50, message: t('credentialType.form.error.name')},
                  ]}
                >
                  <Input placeholder={t('credentialType.form.error.name')}/>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="typeCode"
                  label={t('凭据类型标识')}
                  rules={[
                    {
                      required: true,
                      pattern: /^[0-9a-zA-Z_]{1,}$/,
                      message: t('请输入字母、数字+下划线，不可重复')
                    },
                  ]}
                >
                  <Input placeholder={t('请输入字母、数字+下划线，不可重复')} disabled={modalType === 'edit'}/>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="icon"
                  label={t('credentialType.form.label.icon')}
                >
                  <Upload
                    name="image"
                    // disabled={!uploadAuth}
                    showUploadList={false}
                    listType="picture-card"
                    className={styles.upload}
                    beforeUpload={beforeUpload}
                    customRequest={customRequest}
                    onChange={handleImgChange('icon')}
                  >
                    {imgData.imgUrl ? (
                      <img src={imgData.imgUrl} alt="avatar" style={{width: '100%'}}/>
                    ) : (
                      uploadButton()
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="appType"
                  label={t('credentialType.main.list.link_type')}
                  rules={[
                    {required: true, message: t('credentialType.form.error.link')},
                  ]}
                >
                  {renderApplications()}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Spin>
    );
  }

  const renderFooter = () => {
    return (
      <div className={styles.footer}>
        {
          curStep === 0 ? (
            <Button
              type="primary"
              disabled={appCategoriesRequest.loading}
              onClick={handleToConfig}
            >
              {t('common.button.next')}
            </Button>
          ) : (
            <>
              <Button onClick={() => setCurStep(0)}>
                {t('common.button.prev')}
              </Button>
              {/*<Button
                color="cyan"
                variant="solid"
                onClick={handleUrlTest}
                loading={testLoading}
                disabled={testLoading}
              >
                {t('datasource.form.button.test_connection')}
              </Button>*/}
              <Button
                type="primary"
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
      style={{top: 20}}
      bodyStyle={{minHeight: 500}}
      wrapClassName={styles.layeredModal}
      onCancel={() => modal.hide()}
    >
      {
        curStep > -1 && (
          <div className={styles.modalBody}>
            {curStep === 0 ? renderBaseConfig() : renderConfigContent()}
          </div>
        )
      }
    </Modal>
  );
};

// @ts-ignore
export default CredentialTypeModal;

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

import React, {useContext, useMemo, useEffect, useState} from 'react';
import { Form, Row, Col, Input, Checkbox, Switch, Tabs, Button } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { randomString } from '@/common/utils';
import ListTable from '@/components/ListTable';

import DataContext from '../../DataContext';

import { Config } from '../ConnectorConfig';

import styles from './style.less';

const FormItem = Form.Item;

type ConfigDataItem = {
  k: string
  key?: string
  value?: string
  isEdit?: boolean
  newKey?: string
  newValue?: string
  keyStatus?: string
  valueStatus?: string
}

const formatTabsForm = (configs, filters) => {
  const authType = {
    name: 'authType',
    label: '鉴权方式',
    type: 'CHECKBOX',
    hidden: configs.length === 1,
    options: [{
      //展示的文字
      label: 'None',
      //表单选中的值
      value: 'none'
    }],
  };
  const tabs: any[] = [];

  _.each(configs, item => {
    const { code, name, defaults = {}, elements } = item;

    authType.options.push({
      value: code,
      label: name
    });

    if (filters?.includes(code)) {
      tabs.push({
        key: code,
        label: name,
        children: _.map(elements, element => ({
          ...element,
          name: [code, element.name],
          initialValue: defaults[element.name]
        }))
      })
    }
  });

  return [ authType, { type: 'TABS', items: tabs } ];
}

const getConfigData = (data = {}): ConfigDataItem => {
  return {
    k: randomString(4),
    ...data
  }
}

const LinkForm:React.FC<{ connectorData: Config }> = ({ connectorData }) => {
  const { appValue, onAppValueChange } = useContext(DataContext);

  const [formRef] = Form.useForm();
  const [appTypeFormRef] = Form.useForm();
  const [tabKey, setTabKey] = useState<string>('');
  const [authTypes, setAuthTypes] = useState<string[]>([]);
  const [configDataSource, setConfigDataSource] = useState<Record<string, ConfigDataItem[]>>({});

  useEffect(() => {
    const connectorConfigs = appValue.connectorConfigs || [];
    _.each(connectorConfigs, currentConfig => {
      configDataSource[currentConfig.configCode] = _.map(currentConfig.props, (value, key) => getConfigData({
        key, value
      }))
    })

    setConfigDataSource(configDataSource)
  }, []);

  useEffect(() => {
    if (connectorData?.name) {
      formRef.resetFields()
    }
  }, [connectorData?.name]);

  useEffect(() => {
    if (!connectorData?.name || connectorData.name !== appValue.connectorName) {
      return
    }

    const configs = connectorData.configs || [];
    if (configs.length > 0) {
      const connectorConfigs = appValue.connectorConfigs || [];
      if (!connectorConfigs.length) {
        const configItem = configs[0];
        appValue.connectorConfigs = [{
          configCode: configItem.code,
          configName: configItem.name,
          formValues: {
            ...(configItem.defaults || {}),
            readOnly: {}
          },
          props: getConfigProps(configItem.code)
        }];
        onAppValueChange(appValue)
      } else {
        const findTabKey = _.find(connectorConfigs, item => item.configCode !== 'none');
        setTabKey(findTabKey?.configCode || configs[0].code);
        if (configs.length === 1) {
          setAuthTypes([configs[0].code])
        } else {
          // setAuthTypes(_.map(configs, item => item.code));
        }
      }
    }
  }, [connectorData?.name, appValue?.connectorName, appValue.connectorConfigs]);

  useEffect(() => {
    if (appValue.nodeType) {
      appTypeFormRef.setFieldsValue({
        nodeType: appValue.nodeType
      });
    }
  }, [appValue.nodeType]);

  const authOptions = useMemo(() => {
    return [{
      label: 'None',
      value: 'none'
    }].concat(_.map(connectorData.configs, item => ({
      value: item.code,
      label: item.name
    })))
  }, [ connectorData.configs ]);

  const formatConfigs = useMemo(() => {
    const configs = connectorData.configs || [];
    if (configs.length > 0) {
      return formatTabsForm(connectorData.configs, authTypes)
    } else if (configs.length === 1) {
      const { elements, defaults = {} } = configs[0] || {};
      return _.map(elements, element => ({
        ...element,
        initialValue: defaults[element.name]
      }))
    }

    return configs
  }, [ connectorData, authTypes ]);

  useEffect(() => {
    const formValues: Record<string, any> = {};
    let authTypeValues: string[] | undefined;
    const connectorConfigs = appValue.connectorConfigs || [];
    if (connectorConfigs.length) {
      if (connectorConfigs[0].configCode) {
        authTypeValues = _.map(connectorConfigs, item => {
          const readOnlyValues = item.formValues?.readOnly || {};
          formValues[item.configCode] = {
            ...item.formValues
          };
          formValues.readOnly = {
            ...formValues.readOnly,
            [item.configCode]: readOnlyValues
          }
          delete formValues[item.configCode].readOnly;

          return item.configCode || item;
        });
        if (authTypeValues !== authTypes) {
          setAuthTypes(authTypeValues)
        }
        _.merge(formValues, { authType: authTypeValues })
      } else {
        _.merge(formValues, connectorConfigs[0].formValues)
      }
    }

    formRef.setFieldsValue(formValues);
    appTypeFormRef.setFieldsValue(formValues);
  }, [ appValue.connectorConfigs ]);

  useEffect(() => {
    _.each(configDataSource, (configs, key) => {
      let curConfig = appValue.connectorConfigs[key] || _.find(appValue.connectorConfigs, item => item.configCode === key);
      if (curConfig) {
        curConfig.props = getConfigProps(key)
      }
    })
    onAppValueChange(appValue)
  }, [configDataSource]);

  const getFormProps = (item) => {
    const props: any = {
      name: item.name,
      label: item.label,
      tooltip: item.tips,
      hidden: item.hidden
    };
    if (item.required) {
      props.rules = [{
        required: true,
        message: item.tips
      }]
    }

    if (item.initialValue) {
      props.initialValue = item.initialValue
    }

    return props;
  }

  const getElementProps = (item) => {
    return _.pick(item, ['readOnly', 'placeholder', 'options'])
  }

  const getConfigProps = (tabKey: string, configs?: ConfigDataItem[]) => {
    return _.reduce(configs || configDataSource[tabKey] as ConfigDataItem[], (result: any, item) => {
      if (item.key) {
        result[item.key] = item.value;
      }
      return result
    }, {})
  }

  const handleValuesChange = (changedValues, allValues) => {
    const newAllValues = { ...allValues };

    if ('nodeType' in changedValues) {
      appValue.nodeType = changedValues.nodeType;
    } else if ('authType' in newAllValues) {
      if ('authType' in changedValues) {
        setAuthTypes(newAllValues.authType);
        newAllValues.authType = _.filter(authOptions, item => newAllValues.authType.includes(item.value));
        appValue.connectorConfigs = _.map(newAllValues.authType, item => ({
          configCode: item.value,
          configName: item.label,
          formValues: {
            ...newAllValues[item.value],
            readOnly: newAllValues.readOnly?.[item.value] || {}
          },
          props: getConfigProps(item.value)
        }));
      } else {
        let changedFormValues = { ...changedValues };
        if ('readOnly' in changedValues) {
          changedFormValues = changedValues.readOnly;
        }
        _.each(changedFormValues, (value, key) => {
          _.find(appValue.connectorConfigs, item => {
            if (key === item.configCode) {
              if ('readOnly' in changedValues) {
                item.formValues.readOnly = {
                  ...item.formValues.readOnly,
                  ...value
                }
              } else {
                _.merge(item.formValues, value)
              }
              return true;
            }
          })
        })
      }
    } else {
      appValue.connectorConfigs = [ { configCode: tabKey, formValues: newAllValues, props: getConfigProps(tabKey) } ];
    }

    onAppValueChange(appValue);
  }

  const updateConfigProps = (configs) => {
    const connectorConfigs = appValue.connectorConfigs;
    const currentConfig = _.find(connectorConfigs, item => item.configCode === tabKey) || connectorConfigs[0];
    if (currentConfig) {
      if (!currentConfig.configCode) {
        currentConfig.configCode = tabKey
      }
      currentConfig.props = getConfigProps(tabKey, configs);
      onAppValueChange(appValue);
    }
  }

  const handleAddConfigData = () => {
    const configs = [
      ...(configDataSource[tabKey] || [])
    ];
    configs.push(getConfigData({
      isEdit: true
    }));

    configDataSource[tabKey] = configs;
    setConfigDataSource({
      ...configDataSource
    })
  }

  const updateConfigData = (index, key) => (event) => {
    const configs = [
      ...(configDataSource[tabKey] || [])
    ];
    configs[index][`new${_.upperFirst(key)}`] = event.target.value;
    configDataSource[tabKey] = configs;
    setConfigDataSource({
      ...configDataSource
    })
  }

  const deleteConfigData = (index) => () => {
    const configs = [
      ...(configDataSource[tabKey] || [])
    ];
    configs.splice(index, 1);
    configDataSource[tabKey] = configs;
    setConfigDataSource({
      ...configDataSource
    });
    updateConfigProps(configs);
  }

  const updateConfigDataStatus = (index: number, isEdit: boolean, isCheck: boolean = false) => () => {
    const configs = [
      ...(configDataSource[tabKey] || [])
    ];
    const { key, value, newKey, newValue } = configs[index];
    if (isCheck) {
      if (!newKey) {
        configs[index].keyStatus = 'error';
      }
      if (!newValue) {
        configs[index].value = newValue;
        configs[index].valueStatus = 'error';
      }

      if (newKey && newValue) {
        configs[index].key = newKey;
        configs[index].value = newValue;

        delete configs[index].newKey;
        delete configs[index].newValue;
      }
    } else {
      if (isEdit) {
        configs[index].newKey = key;
        configs[index].newValue = value;
      } else {
        delete configs[index].newKey;
        delete configs[index].newValue;
        delete configs[index].keyStatus;
        delete configs[index].valueStatus;

        delete configs[index].isEdit;

        if (!key && !value) {
          configs.splice(index, 1);
          configDataSource[tabKey] = configs;
          setConfigDataSource({
            ...configDataSource
          });
          return
        }
      }
    }

    const {keyStatus, valueStatus} = configs[index];

    if (!keyStatus && !valueStatus) {
      configs[index].isEdit = isEdit;
    }

    if (isCheck) {
      updateConfigProps(configs)
    }

    configDataSource[tabKey] = configs;
    setConfigDataSource({
      ...configDataSource
    })
  }

  const renderFormItem = (item) => {
    let formItem;

    switch (item.type) {
      case 'TABS':
        return renderTabs(item.items)
        break

      case 'CHECKBOX':
        return (
          <FormItem
            { ...getFormProps(item) }
          >
            <Checkbox.Group { ...getElementProps(item) } />
          </FormItem>
        )
        break

      case 'SWITCH':
        formItem = (
          <FormItem  { ...getFormProps(item) } valuePropName="checked" labelCol={{ span: 8 }}>
            <Switch />
          </FormItem>
        )
        break

      case 'PASSWORD':
        formItem = (
          <FormItem { ...getFormProps(item) } labelCol={{ span: 8 }}>
            <Input.Password { ...getElementProps(item) } />
          </FormItem>
        )
        break

      default:
        formItem = (
          <FormItem { ...getFormProps(item) } labelCol={{ span: 8 }}>
            <Input { ...getElementProps(item) } />
          </FormItem>
        )
        break
    }

    let readOnlyName = ['readOnly'];

    if (_.isArray(item.name)) {
      readOnlyName = readOnlyName.concat(item.name)
    } else {
      readOnlyName.push(item.name)
    }

    return (
      <FormItem noStyle>
        <Row gutter={8} align="middle" style={{width: '100%'}}>
          <Col span={16}>
            { formItem }
          </Col>
          <Col style={{paddingLeft: 30}}>
            <FormItem name={readOnlyName} valuePropName="checked">
              <Checkbox>只读</Checkbox>
            </FormItem>
          </Col>
        </Row>
      </FormItem>
    );
  }

  const renderFormItems = (items) => _.map(items, (item, index) => (
    <React.Fragment key={[item.name || 'f', index].join('-')}>
      { renderFormItem(item) }
    </React.Fragment>
  ))

  const renderTabs = (tabItems) => {

    if (!tabItems?.length) return null;

    return (
      <Tabs
        type="card"
        size="small"
        activeKey={tabKey}
        items={_.map(tabItems, item => {
          return {
            key: item.key,
            label: item.label,
            children: (
              <div className={styles.forms}>
                { renderFormItems(item.children) }
              </div>
            )
          };
        })}
        onChange={setTabKey}
      />
    )
  }

  const renderForms = () => {
    return (
      <div className={styles.forms}>
        <Form form={formRef} onValuesChange={handleValuesChange}>
          { renderFormItems(formatConfigs) }
        </Form>
      </div>
    )
  }

  const renderNodeTypeForm = () => {
    const item = {
      name: 'nodeType',
      label: '处理代码',
      placeholder: '请输入处理代码',
      initialValue: appValue.nodeType
    };
    return (
      <div className={styles.forms}>
        <Form form={appTypeFormRef} onValuesChange={handleValuesChange}>
          <FormItem { ...getFormProps(item) } labelCol={{ span: 5 }} wrapperCol={{span: 17}}>
            <Input { ...getElementProps(item) } style={{width: 584}} />
          </FormItem>
        </Form>
      </div>
    )
  }

  const renderTableCell = (key: string) => (value: string, record: ConfigDataItem, index: number) => {
    switch (key) {
      case 'action':
        return record.isEdit ? (
            <Row gutter={6} justify="center">
              <Col>
                <Button
                  type="text"
                  size="small"
                  onClick={updateConfigDataStatus(index, false, true)}
                ><CheckOutlined /></Button>
              </Col>
              <Col>
                <Button
                  type="text"
                  size="small"
                  onClick={updateConfigDataStatus(index, false)}
                ><CloseOutlined /></Button>
              </Col>
            </Row>
        ) : (
          <Row gutter={6} justify="center">
            <Col>
              <Button
                type="text"
                size="small"
                onClick={updateConfigDataStatus(index, true)}
              ><EditOutlined /></Button>
            </Col>
            <Col>
              <Button
                type="text"
                size="small"
                onClick={deleteConfigData(index)}
              ><DeleteOutlined /></Button>
            </Col>
          </Row>
        )
        break

      default:
        return (
          <div>
            {
              record.isEdit ? (
                <Input
                  size="small"
                  style={{width: 200}}
                  placeholder="请输入"
                  status={record[`${key}Status`]}
                  value={record[`new${_.upperFirst(key)}`]}
                  onChange={updateConfigData(index, key)}
                />
              ) : (
                <span>{ value.toString() }</span>
              )
            }
          </div>
        )
        break
    }
  }

  const renderConfigs = () => {
    return (
      <div className={styles.listTable}>
        <Row justify="space-between" align="middle" style={{marginBottom: 16}}>
          <Col><strong>配置信息：</strong></Col>
          <Col><Button type="link" size="small" onClick={handleAddConfigData}><PlusCircleOutlined /> 新建</Button></Col>
        </Row>
        <ListTable
          noSpacing
          size="small"
          rowKey="k"
          columns={[{
            title: '键(key)',
            dataIndex: 'key',
            render: renderTableCell('key')
          }, {
            title: '值(value)',
            dataIndex: 'value',
            render: renderTableCell('value')
          }, {
            width: 120,
            title: '操作',
            align: 'center',
            dataIndex: 'k',
            render: renderTableCell('action')
          }]}
          dataSource={configDataSource[tabKey]} />
      </div>
    )
  }

  if (!formatConfigs?.length) return null;

  return (
    <div className={styles.container}>
      { renderNodeTypeForm() }
      <p className={styles.title}>请在下表中填入连接鉴权的默认值，当控件“只读”被勾选中时，改字段在凭据创建时只展示不能修改。</p>
      { renderForms() }
      { renderConfigs() }
    </div>
  )
}

export default LinkForm;
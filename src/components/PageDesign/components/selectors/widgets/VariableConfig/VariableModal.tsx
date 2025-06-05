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

import React, {useRef, useMemo, useState, useContext, useEffect, useCallback} from 'react';

import _ from 'lodash';
import {PlusOutlined, MinusOutlined} from '@ant-design/icons';
import {Row, Col, Form, Input, Modal, Select, Divider, Button} from 'antd';

import Calculator from '@/components/Calculator/index';

import useI18n from '@/common/hooks/useI18n';
import {VARIABLE_TYPES2} from '@/common/constants';

import {RuleForm} from '@/components/Rule';
import {getDefaultData} from '@/components/Rule/util';

import styles from './index.less';

let curComputeItems;

const VariableModal = ({initValues, inputFields, externalFields, onSubmit, visible, ...rest}) => {
  const [form] = Form.useForm();
  const ruleFormRef = useRef(null);
  const [ruleVisible, setRuleVisible] = useState(false);
  const [curRuleListData, setCurRuleListData] = useState();
  const [initRuleListData, setInitRuleListData] = useState();

  const {t} = useI18n(['workflow', 'common']);

  useEffect(() => {
    if (visible) {
      if (initValues) {
        form.setFieldsValue(_.pick(initValues, ['name', 'code', 'valueType']));

        if (initValues.condition) {
          setRuleVisible(true);
          setInitRuleListData(initValues.condition);
        } else {
          setInitRuleListData(null);
        }
      } else {
        form.resetFields();
        setRuleVisible(false);
        setInitRuleListData(null);
      }
    }
  }, [visible]);

  const formatInputFields = useMemo(() => {
    return _.map(inputFields, (item) => {
      return {
        title: item.nodeName,
        value: item.nodeKey,
        children: _.map(item.fields, (field) => ({
          title: field.label,
          dataType: field.type,
          value: [item.nodeKey, field.value].join('$$'),
        })),
      };
    });
  }, [inputFields]);

  const handleModalSubmit = () => {
    form.validateFields().then((values) => {
      const submitData = {
        ...values,
        computeItems: curComputeItems,
      };

      if (ruleVisible && curRuleListData) {
        submitData.condition = curRuleListData
      }

      if (_.isFunction(onSubmit)) {
        onSubmit(submitData);
      }
    });
  };

  const handleCalcChange = (resultList) => {
    curComputeItems = resultList;
  };

  const handleRuleFormChange = useCallback((ruleListData) => {
    setCurRuleListData(ruleListData);
  }, []);

  const toggleRuleForm = () => {
    const visible = !ruleVisible;
    setRuleVisible(visible);

    if (visible && !initRuleListData) {
      setInitRuleListData(getDefaultData())
    }
  }

  const renderBaseInfoForm = () => {
    return (
      <Form form={form}>
        <Row wrap gutter={24} className={styles.baseForm}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={t('workflow.derived_variables.input.name.label')}
              rules={[{
                required: true,
              },]}
            >
              <Input placeholder={t('common.input.placeholder')}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="code"
              label={t('workflow.derived_variables.input.code.label')}
              rules={[{
                required: true,
              },]}
            >
              <Input placeholder={t('common.input.placeholder')}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="valueType"
              label={t('workflow.derived_variables.input.data_type.label')}
              rules={[{
                required: true,
              },]}
            >
              <Select placeholder={t('common.select.placeholder')}>
                {_.map(VARIABLE_TYPES2, (value) => (<Select.Option key={value} value={value}>
                    {value}
                  </Select.Option>))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {
              ruleVisible ? (
                <Button
                  type="link"
                  icon={<MinusOutlined />}
                  onClick={toggleRuleForm}
                >
                  移除计算条件
                </Button>
              ) : (
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={toggleRuleForm}
                >
                  添加计算条件
                </Button>
              )
            }
          </Col>
        </Row>
      </Form>
    );
  };

  const renderRuleForm = () => {
    return visible && ruleVisible && (
      <div className={styles.ruleForm}>
        <div className={styles.ruleFormInner}>
          <RuleForm
            hideGroupBtn
            ref={ruleFormRef}
            treeData={inputFields}
            initRules={initRuleListData}
            onChange={handleRuleFormChange}
          />
        </div>
      </div>
    )
  }

  const renderCalculator = () => {
    const expression = (initValues || {}).computeItems || [];

    return (
      <div className={styles.variableForm}>
        <div>{t('workflow.derived_variables.input.expression.label')}</div>
        <Divider/>

        <div>
          {visible && (
            <Calculator
              fields={inputFields}
              externalFields={externalFields}
              defaultValues={{
                expression,
              }}
              onChange={handleCalcChange}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      width={840}
      open={visible}
      title={t('workflow.derived_variables.title')}
      maskClosable={false}
      {...rest}
      style={{top: 20}}
      onOk={handleModalSubmit}
    >
      {renderBaseInfoForm()}
      {renderRuleForm()}
      {renderCalculator()}
    </Modal>
  );
};

export default React.memo(VariableModal);

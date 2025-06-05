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

import _ from 'lodash';
import { useDebounceFn } from 'ahooks'
import {Modal, Form, Select, Cascader, Input} from 'antd';
import React, { useMemo, useEffect, useRef, useCallback } from 'react';

import RuleForm from '@/components/Rule/RuleForm';
import {getOperatorData, getDefaultData} from '@/components/Rule/util';

import styles from './index.less';

const VariableModal:React.FC<any> = ({ options, type, initValues, treeData, onSubmit, ...props }) => {

  const ruleFormRef = useRef<any>();
  const ruleDataRef = useRef<any>();
  const [form] = Form.useForm();

  const title = useMemo(() => type === 'create' ? '添加聚合变量' : '编辑聚合变量', [ type ]);

  useEffect(() => {
    if (props.open) {
      if (type === 'update') {
        try {
          form.setFieldsValue({
            name: initValues.name,
            comment: initValues.comment,
            functionType: initValues.functionType,
            weightField: initValues.weightField?.code,
            summaryField: initValues.summaryField?.code
          })
        } catch (e) {}
      }
    } else {
      form.resetFields()
      ruleFormRef.current = null
    }
  }, [type, initValues, props.open]);

  const handleRuleFormChange = useCallback((ruleListData) => {
    ruleDataRef.current = ruleListData;
  }, []);

  const getRuleListData = (condition) => {
    if (!condition) return undefined;

    const ruleData: any = {
      relation: condition.relation,
      children: [],
    };

    ruleData.children = _.map(condition.embeds, (embed) => ({
      relation: embed.relation,
      children: _.map(embed.factors, (factor) => ({
        field: {
          title: factor.name,
          value: factor.code,
          nodeKey: factor.nodeKey,
          dataType: factor.valueType,
        },
        term: {
          // @ts-ignore
          ...getOperatorData(factor.opt),
        },
        value: factor.value,
      })),
    }));

    if (ruleData.children.length) {
      return ruleData
    }

    return getDefaultData();
  }

  const formatConditions = (ruleListData) => {
    const conditions: any = {
      mode: 'SCRIPT',
      embeds: [],
      relation: ruleListData.relation,
    };

    conditions.embeds = _.map(ruleListData.children, (item) => {
      const embedData: any = {
        mode: 'SCRIPT',
        relation: item.relation,
      };
      embedData.factors = _.map(item.children, (embed) => {
        const field = embed.field || {};
        const term = embed.term || {};
        const value = _.isUndefined(embed.value) || _.isNull(embed.value) ? '' : embed.value;

        return {
          value,
          opt: term.value,
          name: field.title,
          code: field.value,
          nodeKey: field.nodeKey,
          valueType: field.dataType,
        };
      });

      return embedData;
    });

    return conditions;
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const postData:any = {
        comment: values.comment,
        valueType: 'INTEGER',
        functionType: values.functionType,
        condition: formatConditions(ruleDataRef.current)
      };
      const weightField = _.find(treeData, item => item.value === values.weightField);
      const summaryField = _.find(treeData, item => item.value === values.summaryField?.[0]);

      postData.name = postData.code = values.name;

      if (!['COUNT', 'DISTINCT'].includes(values.functionType) && summaryField) {
        postData.valueType = summaryField.type;
      }

      if (summaryField) {
        postData.summaryField = {
          code: summaryField.value,
          name: summaryField.label,
          valueType: summaryField.type
        }
      }

      if (weightField) {
        postData.weightField = {
          code: weightField.value,
          name: weightField.label,
          valueType: weightField.type
        }
      }

      onSubmit?.(postData)
    })
  }

  const getRuleFormRef = useDebounceFn((ref) => {
    if (ref) {
      if (initValues?.condition && !ruleFormRef.current) {
        ruleFormRef.current = ref
        ruleDataRef.current = getRuleListData(initValues.condition);
        ruleFormRef.current.updateListData(ruleDataRef.current)
      }
    } else {
      ruleFormRef.current = ref
    }
  }, {
    wait: 300
  })

  return (
    <Modal title={title} width={840} { ...props } onOk={handleSubmit}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 19 }}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="字段标识"
          rules={[{ required: true, message: '请输入变量名称!' }]}
        >
          <Input maxLength={20} placeholder="请输入" style={{width: 352}} />
        </Form.Item>
        <Form.Item required label="统计字段" style={{marginBottom: 0}}>
          <Form.Item
            name="summaryField"
            style={{display: 'inline-block'}}
            rules={[{ required: true, message: '请选择统计字段!' }]}
          >
            <Cascader
              showSearch
              allowClear
              options={treeData}
              style={{width: 220}}
              placeholder="请选择"
              dropdownMatchSelectWidth={false}
            />
          </Form.Item>
          <Form.Item
            name="functionType"
            style={{display: 'inline-block', marginLeft: 12}}
            rules={[{ required: true, message: '请选择操作类型!' }]}
          >
            <Select
              style={{width: 120}}
              placeholder="请选择"
              options={options}
              dropdownMatchSelectWidth={false}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item
          name="weightField"
          label="权重字段"
        >
          <Select
            showSearch
            allowClear
            options={treeData}
            style={{width: 352}}
            placeholder="请选择"
            dropdownMatchSelectWidth={false}
          />
        </Form.Item>
        <Form.Item
          name="comment"
          label="字段名称"
          rules={[{ required: true, message: '请输入备注!' }]}
        >
          <Input.TextArea maxLength={80} placeholder="请输入" style={{width: 352}} />
        </Form.Item>
        <Form.Item
          name="condition"
          label="筛选条件"
        >
          <div className={styles.ruleWrapper}>
            <RuleForm
              hideGroupBtn
              ref={getRuleFormRef.run}
              treeData={treeData}
              onChange={handleRuleFormChange}
            />
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default VariableModal;

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

import React, { useState, useEffect, forwardRef } from 'react';
import { Row, Col, Input, Select, Button, Cascader } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

import _ from 'lodash';
import { useModel } from 'umi'
import cls from 'classnames';

import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

// EQUAL, UNEQUAL , IN , NOT_IN , NULL , HASVAL , NOTNULL
const OPT_OPTIONS = [
  {
    value: 'EQUAL',
    label: '等于',
  },
  {
    value: 'UNEQUAL',
    label: '不等于',
  },
  {
    value: 'IN',
    label: '包含',
  },
  {
    value: 'HASVAL',
    label: '有值',
  },
  {
    value: 'NULL',
    label: '为空',
  },
];

const BOOLEAN_OPT_OPTIONS = [
  {
    value: 'EQUAL',
    label: '选中',
  },
  {
    value: 'UNEQUAL',
    label: '未选中',
  },
];

const getDefaultData = () => {
  return {
    relation: 'OR',
    children: [
      {
        source: {},
        opt: {},
        // value: ''
      },
    ],
  }
};

const RuleForm: React.FC<{
  treeData?: any[];
  defaultValue?: any;
  hideGroupBtn?: boolean;
  onChange?: (schema: any) => void;
}> = ({ treeData, hideGroupBtn, defaultValue, onChange }, ref) => {
  const [ruleList, setRuleList] = useState<Record<string, any>>([]);
  const { getWidgetById } = useModel('AppEditor', (model) => ({
    getWidgetById: model.getWidgetById
  }));

  const { t } = useI18n(['common', 'workflow']);

  useEffect(() => {
    if (_.isFunction(onChange)) {
      onChange(ruleList);
    }
  }, [ruleList]);

  useEffect(() => {
    setRuleList(defaultValue || []);
  }, []);

  const getRelation = (r) => (r === 'AND' ? 'OR' : 'AND');

  const getRuleFormItem = (value = {}) => {
    return {
      source: {},
      opt: {},
      ...value,
    };
  };

  const isSelectWidget = (widget: any) => {
    if (!widget) return false;

    return ['radio', 'select', 'Select', 'OptionPicker', 'AuthSelect', 'CustomRadio', 'MultiSelectPicker'].includes(
      widget.type
    );
  };

  const isSwitchWidget = (widget: any) => {
    if (!widget) return false;

    return widget.type === 'Switch'
  };

  const getWidgetOptions = (widget: any) => _.map(widget?.settings?.options, item => ({
    value: item.value,
    label: `${item.value} - ${item.label}`
  }));

  const updateRuleList = (list: any = ruleList) => {
    setRuleList([
      ...list
    ]);
  };

  const addGroup = () => {
    ruleList.push(getDefaultData())
    updateRuleList()
  };

  const updateRuleData = (ruleIndex, formIndex, value, column = 'source') => {
    const targetData = ruleList[ruleIndex].children[formIndex];
    if (_.isUndefined(value)) {
      delete targetData[column];
    } else {
      targetData[column] = value;
      const termValue = value.value || value;
      if (column === 'opt') {
        if (termValue === 'EQUAL') {
          if (_.isArray(targetData['value'])) {
            delete targetData['value'];
          }
        }
      } else if (column === 'target') {
        //每个规则的控制表单应该相同
        _.each(ruleList.children, (targetItem) => (targetItem.target = value));
      }

      if (targetData.source?.widgetId) {
        const widget = getWidgetById(targetData.source?.widgetId)
        if (isSwitchWidget(widget)) {
          const optValue = targetData.opt?.value
          if (optValue === 'EQUAL') {
            targetData.value = true
          } else if (optValue === 'UNEQUAL') {
            targetData.value = false
          }
        }
      }
    }

    updateRuleList(ruleList);
  };

  const getInputNode = (options) => {
    return (
      <Input
        size="small"
        style={options.style}
        value={options.value}
        className={styles.value}
        disabled={options.disabled}
        placeholder={t('common.input.placeholder')}
        onChange={(event) => options.onChange(event.target.value)}
      />
    );
  };

  const getSelectNode = (options) => {
    return (
      <Select
        size="small"
        mode={options.mode}
        value={options.value}
        style={options.style}
        className={styles.value}
        placeholder={t('common.select.placeholder')}
        options={options.options}
        disabled={options.disabled}
        onChange={(value, option) => {
          options.onChange(value);
        }}
      />
    );
  };

  const getFormValueNode = (ruleIndex, formIndex, form) => {
    const formTerm = form.opt || {};
    const formField = form.source || {};
    const termValue = formTerm.value;
    const formValue = form.value;
    const widgetId = formField.widgetId

    const handleValueChange = (value) => {
      updateRuleData(ruleIndex, formIndex, value, 'value');
    };

    const formProps: any = {
      value: formValue,
      disabled: ['HASVAL', 'NULL'].includes(termValue),
      onChange: handleValueChange,
    };

    const widget = getWidgetById(widgetId)

    if (['EQUAL', 'UNEQUAL'].includes(termValue) && isSwitchWidget(widget)) return null;

    if (termValue === 'IN' || isSelectWidget(widget)) {
      formProps.options = getWidgetOptions(widget);
      if (termValue === 'IN') {
        formProps.mode = 'tags';
      }
      return getSelectNode(formProps);
    }

    return getInputNode(formProps);
  };

  const renderRuleList = () => {
    // if (!ruleList.length) {
    //   return <div style={{ padding: '24px 0' }}>添加组件联动规则，来实现联动展示或隐藏效果</div>;
    // }

    // const sources = (item.children || []).map(s => s.source.value);
    return _.map(ruleList, (ruleData, index) => {
      const multi = !!(ruleData.children && ruleData.children.length > 1);
      return (
        <div key={`rule${index}`} className={styles.ruleFormNode}>
          <div className={styles.formInner}>
            <span className={styles.label}>如果</span>
            <div
              className={cls(styles.conditions, {
                [styles.multi]: multi,
                // [styles.indent]: isIndent
              })}
            >
              <div
                className={cls(styles.identifier, styles[ruleData.relation])}
                onClick={() => {
                  ruleData.relation = getRelation(ruleData.relation);
                  updateRuleList();
                }}
              >
                {multi && (
                  <span>
                    {t('workflow.derived_variables.' + (ruleData.relation || 'OR').toLowerCase())}
                  </span>
                )}
              </div>
              {(ruleData.children || []).map((form, formIndex) => {
                const formTerm = form.opt || {};
                const formSource = form.source || {};

                const widget = getWidgetById(formSource.widgetId)
                const isSwitch = isSwitchWidget(widget)
                const termValue = formTerm.value;
                const sourceValue = formSource.value;
                const termOptions = isSwitch ? BOOLEAN_OPT_OPTIONS : OPT_OPTIONS;

                return (
                  <Row
                    align="middle"
                    gutter={[8, 8]}
                    key={`form${formIndex}`}
                    style={{ marginBottom: multi ? 6 : 0 }}
                  >
                    <Col>
                      <Cascader
                        showSearch
                        allowClear
                        size="small"
                        value={sourceValue}
                        options={treeData}
                        className={styles.field}
                        dropdownMatchSelectWidth={false}
                        placeholder={t('common.select.placeholder')}
                        onChange={(value, option) => {
                          updateRuleData(
                            index,
                            formIndex,
                            {
                              ...option[0],
                            },
                            'source',
                          );
                        }}
                      />
                    </Col>
                    <Col>
                      <Select
                        size="small"
                        value={termValue}
                        options={termOptions}
                        className={styles.term}
                        placeholder={t('common.select.placeholder')}
                        onChange={(value, option) => {
                          updateRuleData(
                            index,
                            formIndex,
                            {
                              ...option,
                            },
                            'opt',
                          );
                        }}
                      />
                    </Col>
                    <Col>{ !isSwitch && getFormValueNode(index, formIndex, form) }</Col>
                    {ruleData.children.length && (
                      <Col>
                        <div
                          className={styles.removeBtn}
                          onClick={() => {
                            ruleData.children.splice(formIndex, 1);
                            if (!ruleData.children.length) {
                              ruleList.splice(index, 1)
                            }
                            updateRuleList();
                          }}
                        >
                          <MinusCircleOutlined />
                        </div>
                      </Col>
                    )}
                  </Row>
                );
              })}
            </div>
          </div>
          <div className={styles.insertBtn}>
            <Button
              type="link"
              icon={<PlusOutlined style={{ fontSize: 12 }} />}
              onClick={() => {
                ruleData.children.push(getRuleFormItem());
                updateRuleList();
              }}
            >
              {t('workflow.conditions.condition.add')}
            </Button>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div className={cls(styles.formWrapper)}>
        <div className={cls(styles.rightContent)}>{renderRuleList()}</div>
      </div>
      {!hideGroupBtn && (
        <div className={styles.addRuleGroup}>
          <Button ghost type="primary" size="small" icon={<PlusOutlined />} onClick={addGroup}>
            {t('workflow.conditions.button.add_group')}
          </Button>
        </div>
      )}
    </>
  );
};

export default forwardRef(RuleForm);

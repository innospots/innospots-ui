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

import React, {useMemo, useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {Row, Col, Input, Select, Button} from 'antd';
import {PlusOutlined, DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined} from '@ant-design/icons';

import _ from 'lodash';
import cls from 'classnames';

import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

const TERM_OPTIONS = [{
  value: 'equals',
  label: '等于'
}, {
  value: 'notequals',
  label: '不等于'
}, {
  value: 'includes',
  label: '包含'
}, {
  value: 'notnull',
  label: '有值'
}, {
  value: 'empty',
  label: '为空'
}];

const BOOLEAN_TERM_OPTIONS = [{
  value: 'true',
  label: '选中'
}, {
  value: 'false',
  label: '未选中'
}];

const RESULT_OPTIONS = [{
  value: 'hidden',
  label: '隐藏组件'
}, {
  value: 'visible',
  label: '展示组件'
}]

const getDefaultData = () => {
  return [
    {
      relation: 'OR',
      result: 'hidden',
      children: [
        {
          source: {},
          term: {}
          // value: ''
        }
      ]
    }
  ]
};

const RuleForm: React.FC<{
  schema: any,
  targetId: string,
  initRules?: any[],
  hideGroupBtn?: boolean,
  onChange?: (schema: any) => void
}> = ({targetId, schema, initRules, hideGroupBtn, onChange}, ref) => {
  const [listData, setListData] = useState<Record<string, any>[]>([]);

  const {t} = useI18n(['common', 'workflow']);

  useImperativeHandle(ref, () => ({
    addGroup: () => addGroup(),
    updateListData: (rules) => setListData(rules || getDefaultData())
  }));

  const widgets = useMemo(() => {
    if (schema) {
      const properties = {...schema.properties};
      delete properties[targetId];

      return _.map(properties, (data, value) => ({
        value,
        label: [data.title, value].join(' - ')
      }))
    }

    return []
  }, [schema, targetId]);

  useEffect(() => {
    onChange && onChange(listData);
  }, [listData]);

  useEffect(() => {
    setListData(initRules || []);
  }, []);

  useEffect(() => {
    return () => {
      setListData(getDefaultData());
    };
  }, []);

  const ruleList = useMemo(() => listData || [], [listData]);
  // const isIndent = useMemo(() => !!_.find(ruleList, (item) => item.children.length > 1), [ruleList]);
  const getRelation = (r) => (r === 'AND' ? 'OR' : 'AND');

  const getRuleFormItem = (defaultValue = {}) => {
    return {
      source: {},
      term: {},
      ...defaultValue
    };
  };

  const getWidgetFromSchema = (formId: string) => (schema?.properties?.[formId] || {});

  const isSelectWidget = (formId: string) => {
    if (!formId) return false;

    const s = getWidgetFromSchema(formId);
    return [
      'radio',
      'select',
      'Select',
      'AuthSelect',
      'CustomRadio',
    ].includes(s.widget)
  }

  const getWidgetOptions = (formId: string) => {
    const s = getWidgetFromSchema(formId);
    if (s.options) return s.options;

    return _.map(s.enum, (e, i) => ({
      value: e,
      label: [s.enumNames[i], e].join(' - ')
    }));
  }

  const getRuleForm = () => {
    return {
      result: 'hidden',
      relation: 'OR',
      children: [getRuleFormItem()]
    };
  };

  const addGroup = () => {
    const list = listData.concat([getRuleForm()]);
    updateListData(list);
  };

  const updateListData = (data) => {
    setListData([].concat(data));
  };

  const updateRuleList = (ruleIndex, formIndex, value, column = 'source') => {
    const targetData = ruleList[ruleIndex].children[formIndex];
    if (_.isUndefined(value)) {
      delete targetData[column];
    } else {
      targetData[column] = value;
      const termValue = value.value || value;
      if (column === 'term') {
        if (termValue === 'equals') {
          if (_.isArray(targetData['value'])) {
            delete targetData['value'];
          }
        }
      } else if (column === 'target') {
        //每个规则的控制表单应该相同
        _.each(ruleList[ruleIndex].children, targetItem => targetItem.target = value);
      }
    }

    updateListData(ruleList);
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
    const formTerm = form.term || {};
    const formField = form.source || {};
    const termValue = formTerm.value;
    const formValue = form.value;
    const sourceValue = formField.value;

    const handleValueChange = (value) => {
      updateRuleList(ruleIndex, formIndex, value, 'value');
    };

    const formProps: any = {
      value: formValue,
      disabled: ['notnull', 'empty'].includes(termValue),
      onChange: handleValueChange
    };

    if (['true', 'false'].includes(termValue)) return null;

    if (termValue === 'includes' || isSelectWidget(sourceValue)) {
      formProps.options = getWidgetOptions(sourceValue);
      if (termValue === 'includes') {
        formProps.mode = 'tags';
      }
      return getSelectNode(formProps)
    }

    return getInputNode(formProps);
  };

  const renderRuleList = () => {
    if (!ruleList.length) {
      return (
        <div style={{padding: '24px 0'}}>添加组件联动规则，来实现联动展示或隐藏效果</div>
      )
    }

    return (
      ruleList.map((item, ruleIndex) => {
        const multi = !!(item.children && item.children.length > 1);
        // const sources = (item.children || []).map(s => s.source.value);
        return (
          <div
            className={styles.ruleFormNode}
            key={['rule', ruleIndex].join('-')}
          >
            <div className={styles.formInner}>
              <div
                className={styles.closeBtn}
                onClick={() => {
                  listData.splice(ruleIndex, 1);
                  updateListData(listData);
                }}
              >
                <DeleteOutlined/>
              </div>
              <div className={cls(styles.result, styles.field)}>
                <Select
                  size="small"
                  style={{width: 200}}
                  value={item.result}
                  options={RESULT_OPTIONS}
                  placeholder={t(
                    'common.select.placeholder'
                  )}
                  onChange={(value) => {
                    listData[ruleIndex] = {
                      ...listData[ruleIndex],
                      result: value
                    };
                    updateListData(listData);
                  }}
                />
              </div>
              <span className={styles.label}>如果</span>
              <div
                className={cls(styles.conditions, {
                  [styles.multi]: multi
                  // [styles.indent]: isIndent
                })}
              >
                <div
                  className={cls(styles.identifier, styles[item.relation])}
                  onClick={() => {
                    listData[ruleIndex].relation = getRelation(
                      item.relation
                    );
                    updateListData(listData);
                  }}
                >
                  {item.children && item.children.length > 1 && (
                    <span>
                        {t('workflow.derived_variables.' + (item.relation || 'OR').toLowerCase())}
                      </span>
                  )}
                </div>
                {(item.children || []).map((form, formIndex) => {
                  const formTerm = form.term || {};
                  const formSource = form.source || {};

                  const termValue = formTerm.value;
                  const sourceValue = formSource.value;
                  const curSchema = getWidgetFromSchema(sourceValue) || {};
                  let termOptions = curSchema.type === 'boolean' ? BOOLEAN_TERM_OPTIONS : TERM_OPTIONS;

                  return (
                    <Row
                      align="middle"
                      gutter={[8, 8]}
                      style={{marginBottom: multi ? 6 : 0}}
                      key={['form', ruleIndex, formIndex].join('-')}
                    >
                      <Col>
                        <Select
                          showSearch
                          allowClear
                          size="small"
                          value={sourceValue}
                          options={widgets}
                          className={styles.field}
                          dropdownMatchSelectWidth={false}
                          placeholder={t(
                            'common.select.placeholder'
                          )}
                          onChange={(value, option) => {
                            updateRuleList(
                              ruleIndex,
                              formIndex,
                              {
                                ...option
                              },
                              'source'
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
                            updateRuleList(
                              ruleIndex,
                              formIndex,
                              {
                                ...option
                              },
                              'term'
                            );
                          }}
                        />
                      </Col>
                      <Col>
                        {getFormValueNode(ruleIndex, formIndex, form)}
                      </Col>
                      {item.children.length > 1 && (
                        <Col>
                          <div
                            className={styles.removeBtn}
                            onClick={() => {
                              item.children.splice(formIndex, 1);
                              updateListData(listData);
                            }}
                          >
                            <MinusCircleOutlined/>
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
                icon={<PlusOutlined style={{fontSize: 12}}/>}
                onClick={() => {
                  item.children.push(getRuleFormItem());
                  updateListData(listData);
                }}
              >
                {t('workflow.conditions.condition.add')}
              </Button>
            </div>
          </div>
        );
      })
    )
  }

  return (
    <>
      <div className={cls(styles.formWrapper, {[styles.multi]: ruleList.length > 1})}>
        <div
          className={cls(styles.rightContent, {
            [styles.hasChildren]: ruleList.length > 1
          })}
        >
          {renderRuleList()}
        </div>
      </div>
      {!hideGroupBtn && (
        <div className={styles.addRuleGroup}>
          <Button
            ghost
            type="primary"
            size="small"
            icon={<PlusOutlined/>}
            onClick={() => {
              addGroup();
            }}
          >
            {t('workflow.conditions.button.add_group')}
          </Button>
        </div>
      )}
    </>
  );
};

export default forwardRef(RuleForm);

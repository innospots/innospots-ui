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

import React, { useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Row, Col, Input, Select, Button, DatePicker, TreeSelect, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';

import _ from 'lodash';
import moment from 'moment';
import cls from 'classnames';
// import { useDeepCompareEffect } from 'ahooks';

import useI18n from '@/common/hooks/useI18n';

import {
    isDate,
    isNumber,
    isString,
    isBoolean,
    isMultiValue,
    isEmptyValue,
    isSelectField,
    getOperatorData,
    getOperatorListByType,
} from '../util';

import styles from './index.less';

const { RangePicker } = DatePicker;

const getDefaultData = () => {
    return {
        relation: 'OR',
        children: [
            {
                relation: 'AND',
                children: [
                    {
                        field: {},
                        term: {},
                        // value: ''
                    },
                ],
            },
        ],
    };
};

const RuleForm: React.FC<any> = ({ treeData, value, initRules, hideGroupBtn, onChange }, ref) => {
    const [listData, setListData] = useState<any>({});

    const { t } = useI18n(['common', 'workflow']);

    useImperativeHandle(ref, () => ({
        addGroup: () => addGroup(),
        updateListData: (listData) => setListData(listData || getDefaultData()),
    }));

    useEffect(() => {
        onChange && onChange(listData);
    }, [listData]);

    useEffect(() => {
        if (initRules && _.keys(initRules).length) {
            setListData(initRules);
        } else {
            setListData(getDefaultData());
        }
    }, []);

    useEffect(() => {
        return () => {
            setListData(getDefaultData());
        };
    }, []);

    const ruleList = useMemo(() => listData.children || [], [listData.children]);
    const isIndent = useMemo(() => !!_.find(ruleList, (item) => item.children.length > 1));
    const getRelation = (r) => (r === 'AND' ? 'OR' : 'AND');

    const getRuleFormItem = () => {
        return {
            field: {},
            term: {},
            // value: {}
        };
    };

    const getRuleForm = () => {
        return {
            relation: 'OR',
            children: [getRuleFormItem()],
        };
    };

    const addGroup = () => {
        listData.children = listData.children.concat([getRuleForm()]);
        updateListData(listData);
    };

    const updateListData = (data) => {
        setListData({
            ...data,
        });
    };

    const updateRuleList = (ruleIndex, formIndex, value, column = 'field') => {
        if (_.isUndefined(value)) {
            delete ruleList[ruleIndex].children[formIndex][column];
        } else {
            ruleList[ruleIndex].children[formIndex][column] = value;
        }

        listData.children = ruleList;

        updateListData(listData);
    };

    const getInputNode = (options) => {
        const form = options.form;
        const dataType = form.field.dataType;
        let formValue = form.value;

        if (!_.isUndefined(options.value)) {
            formValue = options.value;
        }

        if (dataType !== 'LONG' && isNumber(dataType)) {
            return (
                <InputNumber
                    size="small"
                    style={options.style}
                    value={formValue}
                    className={styles.value}
                    placeholder={t('common.input.placeholder')}
                    onChange={options.onChange}
                />
            );
        }

        return (
            <Input
                size="small"
                style={options.style}
                value={form.value}
                className={styles.value}
                placeholder={t('common.input.placeholder')}
                onChange={(event) => options.onChange(event.target.value)}
            />
        );
    };

    const getSelectNode = (options) => {
        return (
            <Select
                size="small"
                value={options.value}
                style={options.style}
                className={styles.value}
                placeholder={t('common.select.placeholder')}
                options={options.options}
                onChange={(value, option) => {
                    options.onChange(value);
                }}
                {...options.props}
            />
        );
    };

    const getDatePicker = (options) => {
        const props:any = {};

        /**
         * 最近几天
         */
        if (options.termValue === 'LATELY') {
            return (
                <Row gutter={[8, 0]}>
                    <Col>
                        <InputNumber
                            min={1}
                            size="small"
                            style={options.style}
                            value={options.value}
                            className={styles.value}
                            placeholder={t('common.input.placeholder')}
                            onChange={options.onChange}
                        />
                    </Col>
                    <Col style={{ lineHeight: '32px' }}>{t('workflow.scheduler.day')}</Col>
                </Row>
            );
        }

        if (options.termValue === 'BETWEEN') {
            if (options.value) {
                const vs = options.value || [];
                props.value = [moment(vs[0]), moment(vs[1])];
            }
            return (
                <RangePicker
                    size="small"
                    onChange={(dates, dateStrings) => {
                        options.onChange(dateStrings);
                    }}
                    className={styles.value}
                    {...props}
                />
            );
        }

        if (options.value) {
            props.value = moment(options.value);
        }

        return (
            <DatePicker
                size="small"
                onChange={(date, dateString) => {
                    options.onChange(dateString);
                }}
                className={styles.value}
            />
        );
    };

    const getBetweenNode = ({ form, isSelect, options, onChange }) => {
        const formTerm = form.term || {};
        const formField = form.field || {};
        const formValue = form.value || [];
        const style = { minWidth: 100 };

        return (
            <Row gutter={[8, 0]}>
                <Col flex="40px">
                    {!isSelect
                        ? getInputNode({
                              form,
                              style,
                              value: formValue[0],
                              onChange: (value) => {
                                  formValue[0] = value;

                                  if (!formValue[1] || formValue[1] <= value) {
                                      formValue[1] = value + 1;
                                  }

                                  onChange(formValue);
                              },
                          })
                        : getSelectNode({
                              style,
                              options,
                              value: formValue[0],
                              onChange: onChange,
                          })}
                </Col>
                <Col>{formTerm.display}</Col>
                <Col flex="40px">
                    {!isSelect
                        ? getInputNode({
                              form,
                              style,
                              value: formValue[1],
                              onChange: (value) => {
                                  formValue[1] = value;

                                  if (!formValue[0] || formValue[0] >= value) {
                                      formValue[0] = value - 1;
                                  }

                                  onChange(formValue);
                              },
                          })
                        : getSelectNode({
                              style,
                              options,
                              value: formValue[1],
                              onChange: onChange,
                          })}
                </Col>
            </Row>
        );
    };

    const getFormValueNode = (ruleIndex, formIndex, form) => {
        const formValue = form.value;
        const formTerm = form.term || {};
        const formField = form.field || {};
        const dataType = formField.dataType;
        const termValue = formTerm.value;

        let selectOptions;
        let isShowDictSelect = false;

        const handleValueChange = (value) => {
            updateRuleList(ruleIndex, formIndex, value, 'value');
        };

        /**
         * 字典中有值时，从字典中选择
         */
        if (isString(dataType) || isNumber(dataType)) {
            if (isSelectField(formField)) {
                isShowDictSelect = true;
                selectOptions = _.map(formField.tagEnum, (v) => ({
                    value: v,
                    label: v,
                }));
            }
        } else if (isDate(dataType)) {
            return getDatePicker({
                termValue,
                value: formValue,
                onChange: handleValueChange,
            });
        } else if (isBoolean(dataType)) {
            return null;
        }

        /**
         * 有几个操作符不需要输入值
         */
        if (isEmptyValue(termValue)) return null;

        if (termValue === 'BETWEEN') {
            //之间
            return getBetweenNode({
                form,
                isSelect: isShowDictSelect,
                options: selectOptions,
                onChange: handleValueChange,
            });
        }

        /**
         * 在下拉框中显示字典项
         */
        if (isShowDictSelect) {
            const selectProps: any = {};

            if (isMultiValue(termValue)) {
                selectProps.mode = 'multiple';
            }

            return getSelectNode({
                value: formValue,
                options: selectOptions,
                props: selectProps,
                onChange: handleValueChange,
            });
        }

        return getInputNode({
            form,
            onChange: handleValueChange,
        });
    };

    return (
        <>
            <div className={cls(styles.formWrapper, { [styles.multi]: ruleList.length > 1 })}>
                <div
                    className={cls(styles.identifier, styles[listData.relation])}
                    onClick={() => {
                        listData.relation = getRelation(listData.relation);
                        updateListData(listData);
                    }}
                >
                    <span>
                        {t(
                            'workflow.derived_variables.' +
                                (listData.relation || 'OR').toLowerCase(),
                        )}
                    </span>
                </div>
                <div
                    className={cls(styles.rightContent, {
                        [styles.hasChildren]: ruleList.length > 1,
                    })}
                >
                    {ruleList.map((item, ruleIndex) => {
                        const multi = !!(item.children && item.children.length > 1);
                        return (
                            <div
                                className={styles.ruleFormNode}
                                key={['rule', ruleIndex].join('-')}
                            >
                                {ruleList.length > 1 ? (
                                    <div
                                        className={styles.closeBtn}
                                        onClick={() => {
                                            listData.children.splice(ruleIndex, 1);
                                            updateListData(listData);
                                        }}
                                    >
                                        <DeleteOutlined />
                                    </div>
                                ) : null}
                                <div
                                    className={cls(styles.inner, {
                                        [styles.multi]: multi,
                                        [styles.indent]: isIndent,
                                    })}
                                >
                                    <div
                                        className={cls(styles.identifier, styles[item.relation])}
                                        onClick={() => {
                                            listData.children[ruleIndex].relation = getRelation(
                                                item.relation,
                                            );
                                            updateListData(listData);
                                        }}
                                    >
                                        {item.children && item.children.length > 1 ? (
                                            <span>
                                                {t(
                                                    'workflow.derived_variables.' +
                                                        (item.relation || 'OR').toLowerCase(),
                                                )}
                                            </span>
                                        ) : null}
                                    </div>
                                    {(item.children || []).map((form, formIndex) => {
                                        const formTerm = form.term || {};
                                        const formField = form.field || {};

                                        const termValue = formTerm.value;
                                        let fieldValue = formField.value || formField.tagId;

                                        if (formField.nodeKey) {
                                            fieldValue = [formField.nodeKey, fieldValue].join('$$');
                                        }

                                        return (
                                            <Row
                                                gutter={[8, 8]}
                                                style={{ marginBottom: 6 }}
                                                key={['form', ruleIndex, formIndex].join('-')}
                                            >
                                                <Col>
                                                    {treeData && treeData.length ? (
                                                        <TreeSelect
                                                            showSearch
                                                            size="small"
                                                            value={fieldValue}
                                                            treeData={treeData}
                                                            treeDefaultExpandAll
                                                            className={styles.field}
                                                            dropdownMatchSelectWidth={false}
                                                            placeholder={t(
                                                                'common.select.placeholder',
                                                            )}
                                                            filterTreeNode={(
                                                                inputValue,
                                                                treeNode,
                                                            ) =>
                                                                (treeNode.tagName || '').indexOf(
                                                                    inputValue,
                                                                ) === 0
                                                            }
                                                            onSelect={(value, node) => {
                                                                /**
                                                                 * 检测当前操作符是否适应当前字段
                                                                 * 如果不适用即重置操作符的值
                                                                 */
                                                                const result =
                                                                    getOperatorData(termValue);
                                                                if (!result) {
                                                                    updateRuleList(
                                                                        ruleIndex,
                                                                        formIndex,
                                                                        {},
                                                                        'term',
                                                                    );
                                                                }

                                                                if (
                                                                    isDate(formField.dataType) ||
                                                                    isDate(node.dataType) ||
                                                                    isSelectField(node) ||
                                                                    isSelectField(formField) ||
                                                                    node.dataType !==
                                                                        formField.dataType
                                                                ) {
                                                                    updateRuleList(
                                                                        ruleIndex,
                                                                        formIndex,
                                                                        undefined,
                                                                        'value',
                                                                    );
                                                                }

                                                                const values =
                                                                    node.value.split('$$');
                                                                if (values.length > 1) {
                                                                    node.value = values[1];
                                                                    node.nodeKey = values[0];
                                                                }

                                                                updateRuleList(
                                                                    ruleIndex,
                                                                    formIndex,
                                                                    {
                                                                        ...node,
                                                                    },
                                                                );
                                                            }}
                                                        />
                                                    ) : (
                                                        <TreeSelect
                                                            size="small"
                                                            className={styles.field}
                                                            placeholder={t(
                                                                'common.select.placeholder',
                                                            )}
                                                        />
                                                    )}
                                                </Col>
                                                <Col>
                                                    <Select
                                                        size="small"
                                                        value={termValue}
                                                        className={styles.term}
                                                        placeholder={t('common.select.placeholder')}
                                                        options={getOperatorListByType(
                                                            formField.dataType,
                                                        )}
                                                        onChange={(value, option) => {
                                                            if (
                                                                value === 'LATELY' ||
                                                                value === 'BETWEEN' ||
                                                                value === 'BOOLEAN' ||
                                                                isEmptyValue(value) ||
                                                                isMultiValue(termValue) !==
                                                                    isMultiValue(value)
                                                            ) {
                                                                updateRuleList(
                                                                    ruleIndex,
                                                                    formIndex,
                                                                    undefined,
                                                                    'value',
                                                                );
                                                            }
                                                            updateRuleList(
                                                                ruleIndex,
                                                                formIndex,
                                                                {
                                                                    ...option,
                                                                },
                                                                'term',
                                                            );
                                                        }}
                                                    />
                                                </Col>
                                                <Col>
                                                    {getFormValueNode(ruleIndex, formIndex, form)}
                                                </Col>
                                                <Col>
                                                    {item.children.length > 1 ? (
                                                        <div
                                                            className={styles.removeBtn}
                                                            onClick={() => {
                                                                item.children.splice(formIndex, 1);
                                                                updateListData(listData);
                                                            }}
                                                        >
                                                            <MinusCircleOutlined />
                                                        </div>
                                                    ) : null}
                                                </Col>
                                            </Row>
                                        );
                                    })}
                                </div>
                                <div className={styles.insertBtn}>
                                    <Button
                                        type="link"
                                        icon={<PlusOutlined style={{ fontSize: 12 }} />}
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
                    })}
                </div>
            </div>
            {!hideGroupBtn ? (
                <div className={styles.addRuleGroup}>
                    <Button
                        ghost
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            addGroup();
                        }}
                    >
                        {t('workflow.conditions.button.add_group')}
                    </Button>
                </div>
            ) : null}
        </>
    );
};

export default forwardRef(RuleForm);

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

import {
    Row,
    Col,
    Menu,
    Input,
    Select,
    Dropdown,
    // message
} from 'antd';
import { CloseOutlined, CheckOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';

import { ChangeIcon, ExtendIcon } from '@/components/Nice/NiceIcon';
import { dataRequest } from '@/common/request';
import { randomString } from '@/common/utils';
import * as $ from '@/common/utils/Dom';
import useI18n from '@/common/hooks/useI18n';

import { IconFont } from '@/components/Nice/NiceIcon';

import styles from './index.less';

const { Option } = Select;

const getItemId = () => randomString(4);

const curDefaultValues = {
    fnType: 'all',
};
const EXP_REGEX = /\$\{[^\$\{\}]+\}/g;

let sourceData = {};

//{"id":"CdYb","element":"field","data":{"value":"Customer ID","id":"Customer ID","displayValue":"Customer ID","name":"Customer ID"}},{"element":"operator","data":{"value":"+","displayValue":"+"},"id":"Ni3A"},{"id":"rBNM","element":"input","data":{"data-type":"text","value":"abc","displayValue":"abc"}},{"id":"Ea7S","element":"function","format":"UPPER($exp$)","data":[{"id":"TmDw","element":"expr","format":"($exp$)","data":[{"element":"input","data":{"type":"text","value":"abc","displayValue":"abcd"},"id":"rBNM"}]}]},{"element":"operator","data":{"value":"*","displayValue":"*"},"id":"hSzB"},{"id":"SQ6F","element":"function","format":"POSITION($exp$ IN $exp$)","data":[{"element":"input","data":{"displayValue":"12","type":"text","value":"12"},"id":"HEBw"},{"element":"input","data":{"displayValue":"34","type":"text","value":"34"},"id":"FBxA"}]},{"id":"4E85","element":"function","format":"UPPER($exp$)","data":[{"id":"Ck5w","element":"function","format":"POSITION($exp$ IN $exp$)","data":[{"id":"PDs7","element":"function","format":"LOWER($exp$)","data":[{"element":"input","data":{"value":"1","displayValue":"1"},"id":"4tsQ"}]},{"element":"input","data":{"value":"2","displayValue":"2"},"id":"nfWT"}]}]}

let sourceFieldRefs = {};

const getFieldData = (field, selectedField = {}) => {
    if (!field) return {};

    const id = getItemId();

    sourceFieldRefs[id] = {
        tableField: field,
        ...selectedField,
    };

    return {
        id,
        element: 'field',
        value: field.value,
        displayValue: field.label,
        nodeKey: selectedField.nodeKey,
        data: [],
    };
};

const Calculator = ({ calcType, fields, externalFields, defaultValues, onChange }) => {
    const exprLayerRef = useRef(null);

    const { t } = useI18n('common');

    const [allFns, setAllFns] = useState([]);
    const [flinkFns, setFlinkFns] = useState([]);
    const [errorTip, setErrorTip] = useState();
    const [curFnList, setCurFnList] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [fnKeywords, setFnKeywords] = useState('');
    const [fieldKeywords, setFieldKeywords] = useState('');
    const [editExpData, setEditExpData] = useState({});
    const [inputValue, setInputValue] = useState('');
    const [selectedField, setSelectedField] = useState({});
    const [fnType, setFnType] = useState(
        (defaultValues || curDefaultValues).fnType || curDefaultValues.fnType,
    );

    useEffect(() => {
        setResultList([]);
        setSelectedField({});
    }, [fields]);

    useEffect(() => {
        onChange && onChange(resultList, getSourceFieldRefs());
    }, [resultList]);

    useEffect(() => {
        let list = flinkFns || [];
        if (calcType === 'calc') {
            list = _.filter(flinkFns, (fn) => fn.type !== 'statistic');
        }

        setCurFnList(list);
        setAllFns(_.flatten(_.map(list, (item) => item.list)));
    }, [calcType, flinkFns]);

    useEffect(() => {
        try {
            addDefaultField(defaultValues.field);
            if (defaultValues.expression) {
                let expression = defaultValues.expression;

                if (_.isString(expression)) {
                    expression = JSON.parse(expression);
                }

                setResultList(expression);
            }
        } catch (e) {
            setResultList([]);
        }
    }, [defaultValues]);

    useEffect(() => {
        getFunctionList();

        return () => {
            setFnType('');
            setResultList([]);
            setFnKeywords('');
            setFieldKeywords('');
            setEditExpData({});
            setInputValue('');
            setSelectedField({});
            sourceFieldRefs = {};
        };
    }, []);

    useEffect(() => {
        const layer = exprLayerRef.current;

        if (editExpData.target && layer) {
            const spanOffset = $.getOffset(editExpData.target);
            const layerOffset = $.getOffset(layer);
            const layerWidth = layer.clientWidth;

            let wrapper = $.parentsUntil(layer, 'div.polaris-drawer', '.polaris-drawer-content-wrapper')[0];

            if (!wrapper) {
                wrapper = $.parentsUntil(layer, 'div.polaris-modal', '.polaris-modal-content')[0];
            }

            const wrapperOffset = $.getOffset(wrapper);
            const wrapperWidth = wrapper.clientWidth;

            if (layerOffset.left < wrapperOffset.left) {
                $.addClass(layer, styles.right);
            } else if (layerOffset.left + layerWidth > wrapperOffset.left + wrapperWidth) {
                $.addClass(layer, styles.left);
            }
        }
    }, [editExpData]);

    const getSourceFieldRefs = () => {
        const refs = [];
        loopResultList(resultList, (item) => {
            if (item && item.element === 'field') {
                const fieldData = item.data || {};
                const tableData = sourceFieldRefs[item.id]; //_.find(fields, field => !!_.find(field.tableColumns, col => col.fieldName === fieldData.fieldName))

                if (tableData) {
                    refs.push({
                        ...tableData,
                        tableField: fieldData,
                    });
                }
            }
        });

        return refs;
    };

    const getFunctionList = async () => {
        const result = await dataRequest('function/list');

        setFlinkFns(result?.body);
    };

    const getFlinkFns = (type, keywords) => {
        let list = [];
        if (type === 'all') {
            list = allFns;
        }

        const result = _.find(curFnList, (item) => item.type === type);
        if (result) {
            list = result.list;
        }

        return _.filter(
            list,
            (item) => (item.name || '').toLowerCase().indexOf((keywords || '').toLowerCase()) > -1,
        );
    };

    const addDefaultField = (field) => {
        if (field) {
            const { fieldType } = field;
            const fieldData = getFieldData(field, defaultValues.fieldTable);
            const isNumber =
                fieldType === 'INT4' || fieldType === 'INTEGER' || fieldType === 'CURRENCY';
            const fns = _.find(flinkFns, (item) => item.type === 'statistic') || {};
            const fn = _.find(fns.list, (item) => item.id === (isNumber ? 'SUM' : 'COUNT'));

            if (fn) {
                insertFunToList(fn, [fieldData]);
            }
        }
    };

    const loopResultList = (list, callback) => {
        if (!_.isArray(list)) return list;

        return _.each(list, (item) => {
            if (_.isArray(item)) {
                loopResultList(item, callback);
            }

            if (item) {
                callback && callback(item);

                if (item.data) {
                    loopResultList(item.data, callback);
                }
            }
        });
    };

    const getExtendNode = (item) => {
        return (
            <span
                className={styles.changeBtn}
                onClick={() => {
                    loopResultList(resultList, (result) => {
                        if (item.id === result.id) {
                            const source = sourceData[item.id];
                            const values = result.format.split(source.split);
                            result.format = [
                                values[0],
                                source.extendValue,
                                source.split,
                                values[1],
                            ].join(' ');
                        }
                    });
                    setResultList([...resultList]);
                }}
            >
                <ExtendIcon />
            </span>
        );
    };

    const getChangeDropdown = (item) => {
        const menu = (
            <Menu
                selectedKeys={[item.value]}
                onClick={({ key }) => {
                    loopResultList(resultList, (result) => {
                        if (item.id === result.id) {
                            result.value = key;
                        }
                    });
                    setResultList([...resultList]);
                }}
            >
                {_.map((sourceData[item.id] || {}).valueList, (data) => {
                    return <Menu.Item key={data.value}>{data.name}</Menu.Item>;
                })}
            </Menu>
        );

        return (
            <Dropdown overlay={menu}>
                <span className={styles.changeBtn}>
                    <ChangeIcon />
                </span>
            </Dropdown>
        );
    };

    const getResultListNode = (type, list) => {
        return _.map(list, (item) => {
            const value = item.value;
            const displayValue = item.displayValue;

            switch (item.element) {
                case 'operator':
                    return (
                        <div className={styles.item} key={item.id}>
                            <div
                                className={cls(styles.itemInner, styles.fh, {
                                    [styles.c]: value === '*',
                                })}
                            >
                                {displayValue}
                            </div>
                        </div>
                    );
                    break;

                case 'expr':
                case 'function':
                    let extendNode;
                    const source = sourceData[item.id];

                    if (type === 'total' && source) {
                        if (source.isChange) {
                            extendNode = getChangeDropdown(item);
                        } else if (source.isExtend) {
                            extendNode = getExtendNode(item);
                        }
                    }

                    return (
                        <div className={styles.item} key={item.id}>
                            {editExpData.id === item.id ? getExprLayer() : null}
                            <div className={styles.itemInner}>
                                {extendNode}
                                {getExprNode(type, item)}
                            </div>
                        </div>
                    );
                    break;

                default:
                    //field input
                    return (
                        <div className={styles.item} key={item.id}>
                            <div className={styles.itemInner}>
                                <div className={styles.text}>{displayValue}</div>
                            </div>
                        </div>
                    );
                    break;
            }
        });
    };

    const getExprNode = (type, item) => {
        const dataExpr = item.value || '';
        const dataValue = item.data || [];
        const exprList = dataExpr.split(EXP_REGEX);
        const exprNum = (dataExpr.match(EXP_REGEX) || []).length;

        const getExprInnerNode = (id, index) => {
            return (
                <span
                    key={index}
                    className={cls(styles.itemInner, styles.expr)}
                    onClick={(event) => {
                        if (type === 'total') {
                            showExprLayer(event.target, {
                                id,
                                index,
                                exprNum,
                                result: [],
                            });
                        }
                    }}
                >
                    {t('workflow.derived_variables.exp_builder.expression')}
                </span>
            );
        };

        if (!dataValue.length) {
            return _.map(exprList, (text, i) => {
                const id = item.id;

                return (
                    <React.Fragment key={[i, text].join('-')}>
                        {text}
                        {i < exprList.length - 1 ? getExprInnerNode(id, i) : null}
                    </React.Fragment>
                );
            });
        } else {
            return _.map(exprList, (text, i) => {
                const id = item.id;
                let resultNode;
                let dataItem = dataValue[i];

                if (dataItem) {
                    dataItem = _.isArray(dataItem) ? dataItem : [dataItem];
                    resultNode = getResultListNode(type, dataItem);
                } else if (i <= exprNum - 1) {
                    resultNode = getExprInnerNode(id, i);
                }

                return (
                    <React.Fragment key={[i, text].join('-')}>
                        {text}
                        {resultNode}
                    </React.Fragment>
                );
            });
        }
    };

    const showExprLayer = (target, data) => {
        setEditExpData({
            ...data,
            target,
        });
    };

    const updateResultList = (data = {}) => {
        const resultItem = {
            ...data,
        };

        if (!resultItem.id) {
            resultItem.id = getItemId();
        }

        if (editExpData.id) {
            let error;
            if (!!editExpData.result.length) {
                // error = formatMessage({
                //   id: 'component.calculator.num.error.message'
                // })
            } else if (resultItem.element === 'operator') {
                // error = formatMessage({
                //   id: 'component.calculator.type.error.message'
                // })
            }

            if (error) {
                // message.warning(error)
                setErrorTip(error);
                return;
            }

            editExpData.result.push(resultItem);
            setEditExpData({
                ...editExpData,
            });
        } else {
            resultList.push(resultItem);
            setResultList([...resultList]);
        }
    };

    const removeResult = (type = 'last') => {
        if (type === 'last') {
            let res;
            if (editExpData.id) {
                res = editExpData.result.pop();
                setEditExpData({
                    ...editExpData,
                });
            } else {
                res = resultList.pop();
                setResultList([...resultList]);
            }

            if (res && res.id) {
                sourceData[res.id] = null;
                sourceFieldRefs[res.id] = null;

                delete sourceData[res.id];
                delete sourceFieldRefs[res.id];
            }
        } else if (type === 'clear') {
            if (editExpData.id) {
                editExpData.result = [];
                setEditExpData({
                    ...editExpData,
                });
            } else {
                setResultList([]);
            }

            sourceData = {};
            sourceFieldRefs = {};
        }
    };

    const getExprItem = (list, itemId, oriData) => {
        if (!_.isArray(list)) return list;

        return _.find(list, (item) => {
            if (_.isArray(item)) {
                return getExprItem(item, itemId, oriData);
            }

            if (item.element !== 'expr' && item.element !== 'function') return false;

            if (item.id === itemId) {
                oriData.data = item;
                return true;
            } else {
                if (_.isArray(item)) {
                    return _.find(item, (d) => {
                        if (d.id === itemId) {
                            oriData.data = d;
                            return true;
                        }
                        return getExprItem(d, itemId, oriData);
                    });
                } else {
                    if (item.data) {
                        if (item.id === itemId) {
                            oriData.data = item;
                            return true;
                        } else {
                            return getExprItem(item.data, itemId, oriData);
                        }
                    }
                }

                return false;
            }
        });
    };

    const updateResultExprValue = () => {
        const cloneResultList = _.cloneDeep(resultList);
        const curItem = {};

        // getExprItem(cloneResultList, editExpData.id, curItem)
        loopResultList(cloneResultList, (result) => {
            if (editExpData.id === result.id) {
                curItem.data = result;
            }
        });

        const inputResult = editExpData.result;
        if (!inputResult || inputResult.length < 1) return;

        if (curItem.data) {
            curItem.data.data[editExpData.index] = _.cloneDeep(inputResult);

            // const curItemValue = curItem.data.value;
            //
            // if (curItemValue) {
            //   const exprList = curItemValue.split(EXP_REGEX);
            //   const valueMatches = curItemValue.match(EXP_REGEX);
            // }
        }

        setEditExpData({});
        setResultList(cloneResultList);
    };

    const clearExprResult = () => {
        editExpData.result = [];
        setEditExpData({
            ...editExpData,
        });

        sourceData = {};
    };

    const insertFunToList = (fun, defValue) => {
        const newResult = {
            id: getItemId(),
            element: 'function',
            value: fun.value,
            displayValue: fun.name,
            data: [],
        };

        if (defValue) {
            newResult.data.push(defValue);
        }

        let source;
        if (fun.isChange) {
            source = _.pick(fun, ['isChange', 'valueList']);
        } else if (fun.isExtend) {
            source = _.pick(fun, ['split', 'isExtend', 'extendValue']);
        }

        if (source) {
            sourceData[newResult.id] = source;
        }

        updateResultList(newResult);
    };

    const getResultNode = (type, list = resultList) => {
        const resultNode = (
            <div className={styles.result}>
                {!list || !list.length ? (
                    <span className={styles.placeholder}>{t('common.input.placeholder')}</span>
                ) : (
                    getResultListNode(type, list)
                )}
            </div>
        );

        if (type === 'expr') return resultNode;

        return (
            <Row gutter={[12, 0]} className={styles.resultWrap}>
                <Col flex="auto">{resultNode}</Col>
            </Row>
        );
    };

    const getExprLayer = () => {
        return (
            <div className={styles.exprLayer} ref={exprLayerRef}>
                <div className={styles.inner}>
                    {getResultNode('expr', editExpData.result)}
                    <div className={styles.btnGroup}>
                        <div
                            onClick={updateResultExprValue}
                            className={cls(styles.btn, styles.green)}
                        >
                            <CheckOutlined />
                        </div>
                        <div className={cls(styles.btn, styles.red)} onClick={clearExprResult}>
                            <ReloadOutlined />
                        </div>
                        <div className={styles.btn} onClick={() => setEditExpData({})}>
                            <CloseOutlined />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const getFieldNode = () => {
        const selectedFields = externalFields?.length ? externalFields : selectedField.fields;
        const filterFields = _.filter(
            selectedFields,
            (item) =>
                (item.label || '').toLowerCase().indexOf((fieldKeywords || '').toLowerCase()) > -1,
        );

        return (
            <div className={styles.fieldNode}>
                <p className={styles.title}>
                    {t('workflow.derived_variables.exp_builder.select.field.label')}
                </p>
                <div className={styles.select}>
                    <Select
                        placeholder={t('common.select.placeholder')}
                        value={(selectedField || {}).nodeKey}
                        disabled={!!externalFields?.length}
                        onChange={(value) => {
                            const curField = _.find(fields, (item) => item.nodeKey === value);
                            setSelectedField(curField || {});
                        }}
                    >
                        {_.map(fields, (item) => (
                            <Option key={item.nodeKey} value={item.nodeKey}>
                                {item.nodeName}
                            </Option>
                        ))}
                    </Select>
                </div>
                <div className={styles.filterInput}>
                    <Input
                        size="small"
                        bordered={false}
                        placeholder={t('common.input.placeholder')}
                        onChange={(event) => setFieldKeywords(event.target.value)}
                        prefix={<SearchOutlined style={{ color: '#999' }} />}
                    />
                </div>

                <div className={styles.listContainer}>
                    <div className={styles.inner}>
                        {filterFields && filterFields.length ? (
                            _.map(filterFields, (field, index) => {
                                return (
                                    <p
                                        key={['f', index].join('-')}
                                        onDoubleClick={() => {
                                            updateResultList(getFieldData(field, selectedField));
                                        }}
                                    >
                                        {field.label}
                                    </p>
                                );
                            })
                        ) : (
                            <span className={styles.empty}>
                                {/*{t('common.text.empty')}*/}
                                {t('workflow.derived_variables.exp_builder.select.field.empty')}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const getFunctionNode = () => {
        const fnList = getFlinkFns(fnType, fnKeywords);

        return (
            <div className={styles.fieldNode}>
                <p className={styles.title}>
                    {t('workflow.derived_variables.exp_builder.select.function.label')}
                </p>
                <div className={styles.select}>
                    <Select
                        value={fnType}
                        placeholder={t('common.select.placeholder')}
                        onSelect={(type) => setFnType(type)}
                    >
                        {_.map(
                            _.concat(
                                [
                                    {
                                        type: 'all',
                                        name: t(
                                            'workflow.derived_variables.exp_builder.select.function.all',
                                        ),
                                    },
                                ],
                                curFnList,
                            ),
                            (item) => (
                                <Option key={item.type} value={item.type}>
                                    {item.name}
                                </Option>
                            ),
                        )}
                    </Select>
                </div>
                <div className={styles.filterInput}>
                    <Input
                        size="small"
                        bordered={false}
                        placeholder={t('common.input.placeholder')}
                        onChange={(event) => setFnKeywords(event.target.value)}
                        prefix={<SearchOutlined style={{ color: '#999' }} />}
                    />
                </div>

                <div className={styles.listContainer}>
                    <div className={styles.inner}>
                        {fnList && fnList.length ? (
                            _.map(fnList, (fun, index) => {
                                return (
                                    <p
                                        key={['fun', index].join('-')}
                                        title={fun.comment}
                                        onDoubleClick={() => {
                                            insertFunToList(fun);
                                        }}
                                    >
                                        {fun.name}
                                    </p>
                                );
                            })
                        ) : (
                            <span className={styles.empty}>
                                {/*{t('common.text.empty')}*/}
                                {t('workflow.derived_variables.exp_builder.select.function.empty')}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const getCalcNode = () => {
        return (
            <div className={styles.calcNode}>
                <div className={styles.keyboard}>
                    <Row gutter={[12, 12]}>
                        <Col flex="48px">
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '=', 'operator')}
                            >
                                <span className={styles.fh}>=</span>
                            </div>
                        </Col>
                        <Col flex="48px">
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '<>', 'operator')}
                            >
                                <span className={styles.fh}>&lt;&gt;</span>
                            </div>
                        </Col>
                        <Col flex="48px">
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '+', 'operator')}
                            >
                                <span className={styles.fh}>+</span>
                            </div>
                        </Col>
                        <Col flex="48px">
                            <div
                                onClick={() => removeResult()}
                                className={cls(styles.btn, styles.yellow)}
                            >
                                <IconFont type="innospot-icon-backspace" style={{ fontSize: 24 }} />
                            </div>
                        </Col>
                        <Col flex="48px">
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '<', 'operator')}
                            >
                                <span className={styles.fh}>&lt;</span>
                            </div>
                        </Col>
                        <Col flex="48px">
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '>', 'operator')}
                            >
                                <span className={styles.fh}>&gt;</span>
                            </div>
                        </Col>
                        <Col flex="48px">
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '-', 'operator')}
                            >
                                <span className={styles.fh}>-</span>
                            </div>
                        </Col>
                        <Col flex="48px">
                            <div
                                className={cls(styles.btn, styles.yellow)}
                                onClick={() => removeResult('clear')}
                            >
                                {t('workflow.derived_variables.exp_builder.button.clear')}
                            </div>
                        </Col>
                        <Col flex="180px">
                            <Row style={{ marginBottom: 12 }}>
                                <Col span={24}>
                                    <Row gutter={[12, 12]}>
                                        <Col flex="48px">
                                            <div
                                                className={styles.btn}
                                                onClick={() =>
                                                    calcInputValue('operator', '<=', 'operator')
                                                }
                                            >
                                                <span className={styles.fh}>&lt;=</span>
                                            </div>
                                        </Col>
                                        <Col flex="48px">
                                            <div
                                                className={styles.btn}
                                                onClick={() =>
                                                    calcInputValue('operator', '>=', 'operator')
                                                }
                                            >
                                                <span className={styles.fh}>&gt;=</span>
                                            </div>
                                        </Col>
                                        <Col flex="48px">
                                            <div
                                                className={styles.btn}
                                                onClick={() =>
                                                    calcInputValue('operator', '*', 'operator')
                                                }
                                            >
                                                <span className={styles.fh}>x</span>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Row gutter={[12, 0]}>
                                        <Col flex="48px">
                                            <div
                                                className={styles.btn}
                                                onClick={() =>
                                                    calcInputValue('operator', '&&', 'operator')
                                                }
                                            >
                                                <span
                                                    className={styles.fh}
                                                    style={{ fontSize: 14 }}
                                                >
                                                    &&
                                                </span>
                                            </div>
                                        </Col>
                                        <Col flex="48px">
                                            <div
                                                className={styles.btn}
                                                onClick={() =>
                                                    calcInputValue('operator', '||', 'operator')
                                                }
                                            >
                                                <span className={styles.fh}>||</span>
                                            </div>
                                        </Col>
                                        <Col flex="48px">
                                            <div
                                                className={styles.btn}
                                                onClick={() =>
                                                    calcInputValue('operator', '/', 'operator')
                                                }
                                            >
                                                <span className={styles.fh}>÷</span>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                        <Col flex="48px">
                            <div
                                className={cls(styles.btn, styles.yellow, styles.expr)}
                                onClick={() =>
                                    updateResultList({
                                        id: getItemId(),
                                        element: 'expr',
                                        value: '(${arg})',
                                        displayValue: '(${arg})',
                                        data: [],
                                    })
                                }
                            >
                                {t('workflow.derived_variables.exp_builder.expression')}
                            </div>
                        </Col>
                    </Row>
                </div>
                <p className={styles.title}>
                    {t('workflow.derived_variables.exp_builder.input.value.label')}
                </p>
                <Row gutter={[12, 0]}>
                    <Col flex="180px">
                        <Input
                            value={inputValue}
                            placeholder={t('common.input.placeholder')}
                            onPressEnter={(e) => calcInputValue('input')}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </Col>
                    <Col flex="48px">
                        <div
                            className={cls(styles.btn, styles.yellow, styles.submit)}
                            onClick={() => calcInputValue('input')}
                        >
                            <span>{t('common.button.confirm')}</span>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    };

    const getOperationNode = () => {
        return (
            <div className={styles.operationList}>
                <Row gutter={[36, 0]}>
                    <Col flex="250px">
                      {getFieldNode()}
                    </Col>
                    <Col flex="300px" style={{ overflow: 'hidden' }}>
                        {getFunctionNode()}
                    </Col>
                    <Col flex="278px">{getCalcNode()}</Col>
                </Row>
            </div>
        );
    };

    const calcInputValue = (type, value = '', valueType = '') => {
        if (value === '' && inputValue === '') return;

        if (inputValue !== '') {
            let s = inputValue;
            if (type === 'input') {
                if (_.isNaN(inputValue * 1)) {
                    s = inputValue.replace(/^\'/, '').replace(/\'$/, '');
                    s = ["'", s, "'"].join('');
                }
            }

            updateResultList({
                value: s,
                element: type,
                displayValue: s,
                data: [],
            });
            setInputValue('');
        }

        if (type !== 'input') {
            updateResultList({
                value,
                element: type,
                displayValue: value,
                data: [],
            });
        }
    };

    const getMessageTip = () => {
        return <div className={styles.messageNode}>{errorTip}</div>;
    };

    return (
        <div className={styles.wrapper}>
            {getResultNode('total')}
            {getMessageTip()}
            {getOperationNode()}
        </div>
    );
};

export default React.memo(Calculator);

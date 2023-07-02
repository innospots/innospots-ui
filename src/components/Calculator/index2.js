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

import React, { useRef, Suspense, useState, useEffect } from 'react';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import cls from 'classnames';
import _ from 'lodash';

import {
    Row,
    Col,
    Menu,
    Input,
    Button,
    Select,
    Dropdown,
    // message
} from 'antd';
import { CloseOutlined, CheckOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';

import { ChangeIcon, ExtendIcon } from '@/components/Nice/NiceIcon';

import flinkFns, { expTpl } from '@/utils/flinkFns';
import { randomString } from '@/common/utils';
import * as $ from '@/utils/dom';

import styles from './index2.less';

const { Option } = Select;

const getItemId = () => randomString(4);

const curDefaultValues = {
    fnType: 'all',
};

let sourceData = {};

//{"id":"CdYb","element":"field","data":{"value":"Customer ID","id":"Customer ID","displayValue":"Customer ID","name":"Customer ID"}},{"element":"operator","data":{"value":"+","displayValue":"+"},"id":"Ni3A"},{"id":"rBNM","element":"input","data":{"data-type":"text","value":"abc","displayValue":"abc"}},{"id":"Ea7S","element":"function","format":"UPPER($exp$)","data":[{"id":"TmDw","element":"expr","format":"($exp$)","data":[{"element":"input","data":{"type":"text","value":"abc","displayValue":"abcd"},"id":"rBNM"}]}]},{"element":"operator","data":{"value":"*","displayValue":"*"},"id":"hSzB"},{"id":"SQ6F","element":"function","format":"POSITION($exp$ IN $exp$)","data":[{"element":"input","data":{"displayValue":"12","type":"text","value":"12"},"id":"HEBw"},{"element":"input","data":{"displayValue":"34","type":"text","value":"34"},"id":"FBxA"}]},{"id":"4E85","element":"function","format":"UPPER($exp$)","data":[{"id":"Ck5w","element":"function","format":"POSITION($exp$ IN $exp$)","data":[{"id":"PDs7","element":"function","format":"LOWER($exp$)","data":[{"element":"input","data":{"value":"1","displayValue":"1"},"id":"4tsQ"}]},{"element":"input","data":{"value":"2","displayValue":"2"},"id":"nfWT"}]}]}

let sourceFieldRefs = {};

const getFieldData = (field, selectedField = {}) => {
    if (!field) return {};

    const id = getItemId();

    sourceFieldRefs[id] = {
        tableField: field,
        tableName: selectedField.tableName,
        dataSourceId: selectedField.dataSourceInfo.dataSourceId,
    };

    return {
        id,
        element: 'field',
        data: {
            value: field.fieldName,
            displayValue: field.fieldName,
            ...field,
        },
    };
};

const Calculator = ({ calcType, fields, defaultValues, onChange }) => {
    const exprLayerRef = useRef(null);

    const [allFns, setAllFns] = useState([]);
    const [errorTip, setErrorTip] = useState();
    const [curFnList, setCurFnList] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [fnType, setFnType] = useState(
        (defaultValues || curDefaultValues).fnType || curDefaultValues.fnType,
    );
    const [fnKeywords, setFnKeywords] = useState('');
    const [fieldKeywords, setFieldKeywords] = useState('');
    const [editExpData, setEditExpData] = useState({});
    const [inputValue, setInputValue] = useState('');
    const [selectedField, setSelectedField] = useState({});

    useEffect(() => {
        setResultList([]);
        setSelectedField({});
    }, [fields]);

    useEffect(() => {
        onChange && onChange(resultList, getSourceFieldRefs());
    }, [resultList]);

    useEffect(() => {
        let list = flinkFns;
        if (calcType === 'calc') {
            list = _.filter(flinkFns, (fn) => fn.type !== 'statistic');
        }

        setCurFnList(list);
        setAllFns(_.flatten(_.map(list, (item) => item.list)));
    }, [calcType]);

    useEffect(() => {
        try {
            addDefaultField(defaultValues.field);
            if (defaultValues.expression) {
                setResultList(JSON.parse(defaultValues.expression));
            }
        } catch (e) {
            setResultList([]);
        }

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
            const wrapper = $.parentsUntil(
                layer,
                'div.ant-drawer',
                '.ant-drawer-content-wrapper',
            )[0];
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
                        tableName: tableData.tableName,
                        dataSourceId: tableData.dataSourceId,
                        tableField: _.pick(fieldData, ['fieldName', 'jdbcType', 'fieldType']),
                    });
                }
            }
        });

        return refs;
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
                selectedKeys={[item.format]}
                onClick={({ key }) => {
                    loopResultList(resultList, (result) => {
                        if (item.id === result.id) {
                            result.format = key;
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
            const data = item.data || {};
            const value = data.value;
            const displayValue = data['displayValue'];

            switch (item.element) {
                case 'operator':
                    return (
                        <div className={styles.item} key={item.id}>
                            <div
                                className={cls(styles.itemInner, styles.fh, {
                                    [styles.c]: data.value === '*',
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
        const dataExpr = item.format || '';
        const dataValue = item.data || [];
        const exprList = dataExpr.split(expTpl);
        const exprNum = (dataExpr.match(/\$exp\$/g) || []).length;

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
                    <FormattedMessage id="component.calculator.result.exp" />
                </span>
            );
        };

        if (!dataValue.length) {
            return _.map(exprList, (text, i) => {
                const id = item.id;

                return (
                    <>
                        {text}
                        {i < exprList.length - 1 ? getExprInnerNode(id, i) : null}
                    </>
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
                    <>
                        {text}
                        {resultNode}
                    </>
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
            format: fun.value,
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
                    <span className={styles.placeholder}>
                        <FormattedMessage id="component.calculator.result.placeholder" />
                    </span>
                ) : (
                    <>
                        {getResultListNode(type, list)}
                        {type !== 'expr' ? (
                            <div className={styles.backspace} onClick={() => removeResult()} />
                        ) : null}
                    </>
                )}
            </div>
        );

        if (type === 'expr') return resultNode;

        return (
            <Row gutter={[12, 0]} className={styles.resultWrap}>
                <Col flex="auto">{resultNode}</Col>
                {list && list.length ? (
                    <Col flex="72px">
                        <div className={styles.clearBtn} onClick={() => removeResult('clear')}>
                            <FormattedMessage id="component.calculator.calc.button.clear" />
                        </div>
                    </Col>
                ) : null}
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
        const filterFields = _.filter(
            selectedField.tableColumns,
            (item) =>
                (item.fieldName || '').toLowerCase().indexOf((fieldKeywords || '').toLowerCase()) >
                -1,
        );

        return (
            <div className={styles.fieldNode}>
                <p className={styles.title}>
                    <FormattedMessage id="component.calculator.field.title" />
                </p>
                <div className={styles.select}>
                    <Select
                        size="small"
                        placeholder={formatMessage({
                            id: 'component.calculator.field.select.placeholder',
                        })}
                        value={(selectedField || {}).tableName}
                        onChange={(value) => {
                            const curField = _.find(fields, (item) => item.tableName === value);
                            setSelectedField(curField || {});
                        }}
                    >
                        {_.map(fields, (item) => (
                            <Option key={item.tableName} value={item.tableName}>
                                {item.tableName}
                            </Option>
                        ))}
                    </Select>
                </div>
                <div className={styles.filterInput}>
                    <Input
                        size="small"
                        bordered={false}
                        placeholder={formatMessage({
                            id: 'component.calculator.field.input.placeholder',
                        })}
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
                                        {field.fieldName}
                                    </p>
                                );
                            })
                        ) : (
                            <span className={styles.empty}>
                                <FormattedMessage id="component.calculator.field.list.empty" />
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
                    <FormattedMessage id="component.calculator.function.title" />
                </p>
                <div className={styles.select}>
                    <Select
                        size="small"
                        value={fnType}
                        placeholder={formatMessage({
                            id: 'component.calculator.function.select.placeholder',
                        })}
                        onSelect={(type) => setFnType(type)}
                    >
                        {_.map(
                            _.concat(
                                [
                                    {
                                        type: 'all',
                                        name: '全部函数',
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
                        placeholder={formatMessage({
                            id: 'component.calculator.function.input.placeholder',
                        })}
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
                                <FormattedMessage id="component.calculator.function.list.empty" />
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
                <p className={styles.title}>
                    <FormattedMessage id="component.calculator.calc.title" />
                </p>
                <Row justify="space-between">
                    <Col span={20}>
                        <Input
                            size="small"
                            placeholder={formatMessage({
                                id: 'component.calculator.calc.input.placeholder',
                            })}
                            value={inputValue}
                            onPressEnter={(e) => calcInputValue('input')}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </Col>
                    <Col>
                        <Button
                            size="small"
                            className={styles.submitBtn}
                            onClick={() => calcInputValue('input')}
                        >
                            OK
                        </Button>
                    </Col>
                </Row>
                <div className={styles.keyboard}>
                    <Row gutter={[12, 12]}>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '+', 'operator')}
                            >
                                <span className={styles.fh}>+</span>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '-', 'operator')}
                            >
                                <span className={styles.fh}>-</span>
                            </div>
                        </Col>
                        {/*<Col span={8}>*/}
                        {/*<div className={styles.btn} onClick={() => removeResult()}>*/}
                        {/*<FormattedMessage id="component.calculator.calc.button.undo" />*/}
                        {/*</div>*/}
                        {/*</Col>*/}
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '*', 'operator')}
                            >
                                <span className={cls(styles.c, styles.fh)}>*</span>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '/', 'operator')}
                            >
                                <span className={styles.fh}>/</span>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '=', 'operator')}
                            >
                                <span className={styles.fh}>=</span>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '<>', 'operator')}
                            >
                                <span className={styles.fh}>&lt;&gt;</span>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '>', 'operator')}
                            >
                                <span className={styles.fh}>&gt;</span>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '>=', 'operator')}
                            >
                                <span className={styles.fh}>&gt;=</span>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '||', 'operator')}
                            >
                                <span className={styles.fh}>||</span>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '<', 'operator')}
                            >
                                <span className={styles.fh}>&lt;</span>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', '<=', 'operator')}
                            >
                                <span className={styles.fh}>&lt;=</span>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() =>
                                    updateResultList({
                                        id: getItemId(),
                                        element: 'expr',
                                        format: `(${expTpl})`,
                                        data: [],
                                    })
                                }
                            >
                                <FormattedMessage id="component.calculator.calc.button.exp" />
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', 'AND', 'operator')}
                            >
                                <span className={styles.fh} style={{ fontSize: 14 }}>
                                    AND
                                </span>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                className={styles.btn}
                                onClick={() => calcInputValue('operator', 'OR', 'operator')}
                            >
                                <span className={styles.fh} style={{ fontSize: 14 }}>
                                    OR
                                </span>
                            </div>
                        </Col>
                        {/*<Col span={8}>*/}
                        {/*<div*/}
                        {/*className={styles.btn}*/}
                        {/*onClick={() => updateResultList({*/}
                        {/*id: getItemId(),*/}
                        {/*element: 'expr',*/}
                        {/*format: `Max(${expTpl}, ${expTpl})`,*/}
                        {/*data: []*/}
                        {/*})}*/}
                        {/*>Max</div>*/}
                        {/*</Col>*/}
                        {/*<Col span={8}>*/}
                        {/*<div*/}
                        {/*className={styles.btn}*/}
                        {/*onClick={() => updateResultList({*/}
                        {/*id: getItemId(),*/}
                        {/*element: 'expr',*/}
                        {/*format: `Min(${expTpl}, ${expTpl})`,*/}
                        {/*data: []*/}
                        {/*})}*/}
                        {/*>Min</div>*/}
                        {/*</Col>*/}
                        {/*<Col span={8}>*/}
                        {/*<div className={styles.btn} onClick={() => removeResult('clear')}>*/}
                        {/*<FormattedMessage id="component.calculator.calc.button.clear" />*/}
                        {/*</div>*/}
                        {/*</Col>*/}
                    </Row>
                </div>
            </div>
        );
    };

    const getOperationNode = () => {
        return (
            <div className={styles.operationList}>
                <Row gutter={[36, 0]}>
                    <Col span={7}>{getFieldNode()}</Col>
                    <Col span={7}>{getFunctionNode()}</Col>
                    <Col span={10}>{getCalcNode()}</Col>
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
                element: type,
                data: {
                    value: s,
                    displayValue: s,
                },
            });
            setInputValue('');
        }

        if (type !== 'input') {
            updateResultList({
                element: type,
                data: {
                    value,
                    displayValue: value,
                },
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

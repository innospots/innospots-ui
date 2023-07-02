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

import React, { useMemo, useEffect, useContext } from 'react';
import { Row, Col, Typography, TreeSelect } from 'antd';
import _ from 'lodash';

import { useControllableValue } from 'ahooks';
import CurContext from '../../../../common/context';
import useI18n from '@/common/hooks/useI18n';

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import styles from './index.less';

const { Link } = Typography;

const getFieldData = () => ({
    left: {},
    right: {},
});

const JoinFields = ({ readOnly, ...rest }) => {
    const { inputFields } = useContext(CurContext);

    const { t } = useI18n(['workflow', 'common']);

    const [joinFields, setJoinFields] = useControllableValue(rest, {
        defaultValue: [getFieldData()],
    });

    useEffect(() => {
        if (!joinFields || !joinFields.length) {
            setJoinFields([getFieldData()]);
        }
    }, [joinFields]);

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

    const addJoinField = () => {
        joinFields.push(getFieldData());
        setJoinFields([...joinFields]);
    };

    const deleteFieldByIndex = (index) => () => {
        joinFields.splice(index, 1);
        setJoinFields([...joinFields]);
    };

    const changeJoinField = (type, index) => (value, node) => {
        const vs = value.split('$$');
        const d = {
            name: node.title,
            code: node.title,
            value: vs[1],
            nodeKey: vs[0],
            valueType: node.dataType,
        };

        if (!joinFields[index]) {
            joinFields[index] = {};
        }

        joinFields[index][type] = d;

        setJoinFields([...joinFields]);
    };

    const getJoinFields = () => {
        let span = 11;
        let DeleteIcon;

        if (!joinFields || !joinFields.length) return null;

        const count = joinFields.length;

        if (count > 1 && !readOnly) {
            span = 10;
            DeleteIcon = MinusCircleOutlined;
        }

        return (
            <div className={styles.keys}>
                {_.map(joinFields, (item, index) => {
                    const left = item.left || {};
                    const right = item.right || {};
                    let leftValue = left.value;
                    let rightValue = right.value;

                    if (left.nodeKey) {
                        leftValue = [left.nodeKey, leftValue].join('$$');
                    }

                    if (right.nodeKey) {
                        rightValue = [right.nodeKey, rightValue].join('$$');
                    }

                    return (
                        <Row
                            justify="space-between"
                            key={[left.code, right.code, index].join('-')}
                            style={{
                                marginBottom: index !== count - 1 ? 8 : 0,
                            }}
                        >
                            <Col span={span}>
                                {readOnly ? (
                                    <span>{left.name || '-'}</span>
                                ) : (
                                    <TreeSelect
                                        showSearch
                                        size="small"
                                        value={leftValue}
                                        treeDefaultExpandAll
                                        className={styles.field}
                                        treeData={formatInputFields}
                                        dropdownMatchSelectWidth={false}
                                        placeholder={t('workflow.join.input1_key.placeholder')}
                                        filterTreeNode={(inputValue, treeNode) =>
                                            (treeNode.tagName || '').indexOf(inputValue) === 0
                                        }
                                        onSelect={changeJoinField('left', index)}
                                    />
                                )}
                            </Col>
                            <Col style={{ color: '#666' }}>=</Col>
                            <Col span={span}>
                                {readOnly ? (
                                    <span>{right.name || '-'}</span>
                                ) : (
                                    <TreeSelect
                                        showSearch
                                        size="small"
                                        value={rightValue}
                                        treeDefaultExpandAll
                                        className={styles.field}
                                        treeData={formatInputFields}
                                        dropdownMatchSelectWidth={false}
                                        placeholder={t('workflow.join.input2_key.placeholder')}
                                        filterTreeNode={(inputValue, treeNode) =>
                                            (treeNode.tagName || '').indexOf(inputValue) === 0
                                        }
                                        onSelect={changeJoinField('right', index)}
                                    />
                                )}
                            </Col>
                            {DeleteIcon ? (
                                <Col>
                                    <DeleteIcon
                                        style={{
                                            color: '#666',
                                            marginTop: 8,
                                            cursor: 'pointer',
                                        }}
                                        onClick={deleteFieldByIndex(index)}
                                    />
                                </Col>
                            ) : null}
                        </Row>
                    );
                })}
            </div>
        );
    };

    return (
      <div className={!readOnly ? 'form-item-wrapper' : ''} style={{width: '100%'}}>
        <Row justify="end">
          <Col>
            {
              !readOnly && (
                <Link onClick={addJoinField}>
                  <PlusOutlined style={{ fontSize: 12 }} />
                  <span>{t('common.button.add')}</span>
                </Link>
              )
            }
          </Col>
        </Row>
        <div style={{marginTop: '0.5em'}}>
          { getJoinFields() }
        </div>
      </div>
    );
};

export default JoinFields;

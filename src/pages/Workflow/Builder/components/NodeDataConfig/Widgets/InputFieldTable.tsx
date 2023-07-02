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

import React, { useContext, useEffect, useMemo } from 'react';
import { Row, Col, Select, Typography } from 'antd';
import _ from 'lodash';

import { useControllableValue } from 'ahooks';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import type { FormItemProps } from './types';
import ListTable from '@/components/ListTable';
import CurContext from '../../../common/context';

import useI18n from '@/common/hooks/useI18n';
import { randomString } from '@/common/utils';

import styles from '../index.less';
import FormContext from './FormContext';

const { Link } = Typography;
const { Option, OptGroup } = Select;

const DEFAULT_COLUMNS = [
    {
        title: 'workflow.extract.field.label',
        dataIndex: 'code',
    },
    {
        width: 80,
        align: 'center',
        title: 'common.table.column.action',
        dataIndex: 'operate',
    },
];

const getDefaultField = (o?: any) => ({
    code: randomString(4),
    ...o,
});

const InputFieldTable: React.FC<FormItemProps> = ({ schema, readOnly, ...props }) => {
    const { t } = useI18n(['workflow', 'common']);
    const { inputFields } = useContext(CurContext);
    const { viewType } = useContext(FormContext);
    const isConfig = viewType === 'config';

    const [fields, setFields] = useControllableValue<Record<string, any>[]>(props, {
        defaultValue: [],
    });

    useEffect(() => {
      setFields(fields || []);
    }, [fields]);

    const updateFields = (index) => (value) => {
        let fieldData = {};
        if (value) {
            const vls = value.split('$$');
            fieldData = getDefaultField({
                opt: 'EQUAL',
                code: vls[2],
                value: '${' + vls[2] + '}',
                nodeKey: vls[0],
                valueType: vls[1],
            });

            if (index > -1) {
                fields[index] = fieldData;
            } else {
                fields.push(fieldData);
            }
        } else {
            fields.splice(index, 1);
        }

        setFields([...fields]);
    };

    const addField = () => {
      // if (!isConfig) return;

        fields.push(getDefaultField());
        setFields([...fields]);
    };

    const formatColumns = () => {
        const _render = (value) => {
            if (value === '' || _.isUndefined(value)) {
                return '-';
            }
            return value;
        };

        return _.map(DEFAULT_COLUMNS, (col) => {
            if (_.isString(col)) {
                col = {
                    title: col,
                    dataIndex: col,
                    render: _render,
                };
            } else if (col.title) {
                col.title = t(col.title);
            }

            if (col?.dataIndex === 'code') {
                col.render = (code, record, index) => {
                    if (col.isView) {
                        return <span style={{ wordBreak: 'break-all' }}>{code}</span>;
                    }

                    let curValue,
                        curField = _.find(fields, (item) => code && item.code === code);
                    let filedValue = curField?.code;
                    if (curField && curField.nodeKey && curField?.value) {
                        filedValue = curField?.value.replace(/\$|\{|\}/g, '');
                        curValue = [curField.nodeKey, curField.valueType, filedValue].join('$$');
                    }

                    if (readOnly) {
                        return <span style={{ wordBreak: 'break-all' }}>{filedValue || '-'}</span>;
                    }

                    return (
                        <Select
                            allowClear
                            size="small"
                            value={curValue}
                            style={{ width: '100%' }}
                            placeholder={t('common.select.placeholder')}
                            onChange={updateFields(index)}
                        >
                            {getOptionList}
                        </Select>
                    );
                };
            } else if (col?.dataIndex === 'operate') {
                col.render = (key, record, index) => {
                    return (
                        <span
                            className="g-button"
                            onClick={() => {
                                fields.splice(index, 1);
                                setFields([...fields]);
                            }}
                        >
                            <DeleteOutlined />
                        </span>
                    );
                };
            }

            return col;
        });
    };

    const getOptionList = useMemo(
        () => (
            <>
                {_.map(inputFields, (group) => (
                    <OptGroup key={group.nodeKey} label={group.nodeName}>
                        {_.map(group.fields, (field) => {
                            const v = [group.nodeKey, field.type, field.value].join('$$');
                            const isSelected = !!_.find(
                                fields,
                                (item) => item.code === field.value,
                            );
                            return (
                                <Option key={v} value={v} disabled={isSelected}>
                                    {field.label}
                                </Option>
                            );
                        })}
                    </OptGroup>
                ))}
            </>
        ),
        [inputFields, fields],
    );

    return (
        <div className={styles.fieldMapping}>
          <div className="form-item-wrapper">
            <Row justify="end">
              <Col>
                {
                  !readOnly && (
                    <Link onClick={addField}>
                      <PlusOutlined style={{ fontSize: 12 }} />
                      <span>{t('common.button.add')}</span>
                    </Link>
                  )
                }
              </Col>
            </Row>
            <div style={{ marginTop: 20 }}>
              <ListTable
                zebra
                size="small"
                rowKey="code"
                pagination={false}
                scroll={{
                  y: 194,
                }}
                columns={formatColumns()}
                dataSource={fields}
              />
            </div>
          </div>
        </div>
    );
};

export default InputFieldTable;

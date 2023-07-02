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

import React from 'react';
import useI18n from '@/common/hooks/useI18n';
import { useControllableValue } from 'ahooks';
import _ from 'lodash';
import { Col, Input, Row, Table, Typography, TableColumnsType } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import type { KeyValues } from '@/common/types/Types';
import type { FormItemProps } from './types';
import type { ResponseFieldItem } from './Webhook/ConfigModal';
import { getDefaultField } from './Webhook/ConfigModal';

const { Link } = Typography;

const TableFields: React.FC<FormItemProps> = ({ schema, readOnly, ...props }) => {
    const ps = {
        ...props,
    };
    const { t } = useI18n(['workflow', 'common']);
    const { codeTitle, valueTitle } = schema || {};

    if (ps.value === undefined) {
        delete ps.value;
    }

    const [fields, setFields] = useControllableValue<ResponseFieldItem[]>(ps, {
        defaultValue: [getDefaultField()],
    });

    const updateParam = (index, key, value) => {
        const list: ResponseFieldItem[] = _.cloneDeep(fields) || [];
        list[index][key] = value;
        setFields([...list]);
    };

    const addField = () => {
        const list: ResponseFieldItem[] = _.cloneDeep(fields) || [];
        list.push(getDefaultField());
        setFields([...list]);
    };

    const columns:TableColumnsType<KeyValues> = [
        {
            title: codeTitle || t('workflow.webhook.form.response.column.field'),
            dataIndex: 'code',
            render: (text, record, index) =>
                readOnly ? (
                    <span>{text || '-'}</span>
                ) : (
                    <Input
                        size="small"
                        value={text}
                        style={{ width: '100%' }}
                        placeholder={t('common.input.placeholder')}
                        onChange={(event) => updateParam(index, 'code', event.target.value)}
                    />
                ),
        },
        {
            title: valueTitle || t('workflow.webhook.form.response.column.value'),
            dataIndex: 'value',
            render: (text, record, index) =>
                readOnly ? (
                    <span>{text || '-'}</span>
                ) : (
                    <Input
                        size="small"
                        value={text}
                        style={{ width: '100%' }}
                        placeholder={t('common.input.placeholder')}
                        onChange={(event) => updateParam(index, 'value', event.target.value)}
                    />
                ),
        },
    ];

    if (!readOnly) {
        columns.push({
            title: '',
            width: 40,
            align: 'center',
            dataIndex: 'key',
            render: (text, record, index) => (
                <MinusCircleOutlined
                    style={{ cursor: 'pointer', color: '#666' }}
                    onClick={() => {
                        const list: ResponseFieldItem[] = _.cloneDeep(fields);
                        list.splice(index, 1);
                        setFields(list);
                    }}
                />
            ),
        });
    }

    return (
      <div className={!readOnly ? 'form-item-wrapper' : ''}>
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
        <div style={{marginTop: '0.5em'}}>
          <Table
            size="small"
            scroll={{
              y: 320,
            }}
            columns={columns}
            pagination={false}
            dataSource={fields}
          />
        </div>
      </div>
    );
};

export default TableFields;

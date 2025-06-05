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

import React, {useContext, useMemo, useRef, useState} from 'react';
import _ from 'lodash';
import cls from 'classnames';
import {useDeepCompareEffect, useSize} from 'ahooks';
import {useModel} from 'umi';
import {Input, Select, Typography} from 'antd';

import type {ExecutionItemProps} from './types';
import {formatListData} from '@/common/utils';
import ListTable from '@/components/ListTable';
import CurContext from '../../../common/context';

import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

const {Text} = Typography;

const FIELD_SCOPES = [
  {
    label: '输入字段',
    value: 'INPUT'
  },
  {
    label: '输出字段',
    value: 'OUTPUT'
  },
  {
    label: '参数字段',
    value: 'PARAM'
  },
  {
    label: '单一输出',
    value: 'BODY'
  }
]


const VALUE_TYPES = [
  'STRING',
  'INTEGER',
  'BOOLEAN',
  'LONG',
  'DATE',
  'TIME',
  'DATE_TIME',
  'TIMESTAMP',
  'DECIMAL',
  'YEAR_MONTH',
  'YEAR_MONTH_DATE',
  'MONTH',
  'MONTH_DATE',
  'DAY_OF_MONTH',
  'DOUBLE',
  'OBJECT',
  'LIST',
  'CURRENCY'
];

let fieldsCache: any = {};

const SchemaFields: React.FC<ExecutionItemProps & {
  onFieldsChange: (fileds: any[]) => void
}> = ({executeData, onFieldsChange}) => {
  const {t} = useI18n(['workflow']);

  const conRef = useRef<any>(null);
  const sizeRef = useSize(conRef);
  const {executeLoading} = useModel('Builder', (model) => ({
    executeLoading: model.executeLoading,
  }));
  const {node, onChange} = useContext(CurContext);
  const schemaFields = (executeData || {}).schemaFields || [];
  const [fields, setFields] = useState<any[]>([])

  useDeepCompareEffect(() => setFields(formatListData(schemaFields)), [schemaFields])

  useDeepCompareEffect(() => updateNodeData(fields), [fields])

  const changeFieldsValue = (type: string, index: number) => (event: any) => {
    fields[index][type] = event?.target ? event.target.value : event;
    setFields([
      ...fields
    ])
  }

  const updateNodeData = _.debounce(newFields => {
    const outputFields = _.map(newFields, item => _.pick(item, _.filter(_.keys(item), k => k !== '__key')))
    const nodeData = {
      ...node.data,
      outputFields
    };

    onChange(nodeData)
    onFieldsChange(outputFields)
  }, 200)

  const getDataList = useMemo(() => {
    const columns = [{
      title: '字段名',
      dataIndex: 'code',
      render: (value, record, index) => (
        <Input
          size="small"
          value={value}
          onChange={changeFieldsValue('code', index)}
        />
      )
    }, {
      title: '说明',
      dataIndex: 'name',
      render: (value, record, index) => (
        <Input
          size="small"
          value={value}
          onChange={changeFieldsValue('name', index)}
        />
      )
    }, {
      title: '类型',
      dataIndex: 'valueType',
      render: (value, record, index) => (
        <Select
          size="small"
          value={value}
          style={{width: '100%'}}
          dropdownMatchSelectWidth={false}
          options={_.map(VALUE_TYPES, type => ({
            label: type,
            value: type
          }))}
          onChange={changeFieldsValue('valueType', index)}
        />
      )
    }, {
      title: '来源',
      dataIndex: 'fieldScope',
      render: (value, record, index) => (
        <Select
          size="small"
          value={value}
          style={{width: '100%'}}
          dropdownMatchSelectWidth={false}
          options={_.map(FIELD_SCOPES, type => ({
            label: type.label,
            value: type.value
          }))}
          onChange={changeFieldsValue('fieldScope', index)}
        />
      )
    }, {
      title: '格式',
      dataIndex: 'format',
      render: (value, record, index) => (
        <Input
          size="small"
          value={value}
          onChange={changeFieldsValue('format', index)}
        />
      )
    }];

    const size = (sizeRef || {}) as any;

    return (
      <div ref={conRef} className={cls(styles.preview, styles.contentBox, 'content-box')}>
        {fields.length ? (
          <div className={styles.table}>
            <ListTable
              zebra
              noSpacing
              scroll={{
                x: columns.length * 150,
                y: size.height ? size.height - 80 : 460
              }}
              columns={columns}
              dataSource={fields}
              loading={executeLoading}
            />
          </div>
        ) : !executeLoading ? (
          <div>
            <p style={{marginTop: 24}}>
              <Text strong>{t('workflow.builder.execution.empty')}</Text>
            </p>
            <p>{t('workflow.builder.execution.empty.desc')}</p>
          </div>
        ) : null}
      </div>
    );
  }, [fields, executeLoading]);

  return getDataList;
};

export default SchemaFields;

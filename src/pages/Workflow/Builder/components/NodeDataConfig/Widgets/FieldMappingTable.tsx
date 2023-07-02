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

import React, {useState, useMemo, useEffect} from 'react';
import {message, Input, Row, Col} from 'antd';
import _ from 'lodash';
import {useModel} from 'umi';

import {useControllableValue} from 'ahooks';
import {DeleteOutlined, SyncOutlined} from '@ant-design/icons';

import type {FormItemProps} from './types';
import ListTable from '@/components/ListTable';

import FieldSelect from './FieldSelect';

import styles from '../index.less';

const DEFAULT_COLUMNS = [
  {
    width: '50%',
    title: '表字段',
    dataIndex: 'name'
  },
  {
    width: '50%',
    title: '映射字段',
    dataIndex: 'code'
  }
];

const FieldMappingTable: React.FC<FormItemProps> = ({schema, addons, readOnly, ...props}) => {
  const {columns, tableName, dataSourceId, queryName} = schema;
  const formData = addons?.formData || {};

  let _dataSourceId = schema.dependencies;
  let _tableName = schema.tableName;
  let _queryName = schema.queryName;

  _tableName = formData[_tableName];
  _queryName = formData[_queryName];
  _dataSourceId = formData[_dataSourceId];

  const {schemaFields, fetchSchemaFieldsRequest} = useModel('Credential', (model) =>
    _.pick(model, ['schemaFields', 'fetchSchemaFieldsRequest'])
  );

  useEffect(() => {
    if (addons && !schema.dependencies) {
      // addons.setSchemaByPath(schema.$id, {
      //   ...schema,
      //   dependencies: [tableName || '', dataSourceId || '', queryName || '']
      // })
    }
  }, [tableName, dataSourceId, queryName, schema.dependencies]);

  const [mappingFields, setMappingFields] = useControllableValue<Record<string, any>[]>(props, {
    defaultValue: []
  });

  useEffect(() => {
    if (!mappingFields) {
      setMappingFields([]);
    }
  }, [mappingFields]);

  const filterDataList = () => {
    if (readOnly && mappingFields?.length) {
      return _.filter(schemaFields, (item) => {
        return !!_.find(mappingFields, (field) => field.code === item.code);
      });
    }

    if (!_tableName || !_dataSourceId) return [];

    return schemaFields;
  };

  const filterCols = useMemo(() => {
    const cols = _.cloneDeep(columns || DEFAULT_COLUMNS);

    if (readOnly) {
      return _.filter(columns || DEFAULT_COLUMNS, (item) => item.dataIndex !== 'operate');
    }

    return cols;
  }, [columns, readOnly]);

  useEffect(() => {
    getTableData();
  }, [_tableName, _dataSourceId, _queryName]);

  const getTableData = async () => {
    let error;

    if (!_dataSourceId || !_tableName || fetchSchemaFieldsRequest.loading) {
      // error = t('workflow.sql.datasource.placeholder')
      return;
    }

    if (error) {
      message.error(error);
    } else {
      fetchSchemaFieldsRequest.run({
        credentialId: _dataSourceId,
        [_queryName || 'tableName']: _tableName
      });
    }
  };

  const updateMappingFields = (field, code) => (value) => {
    const index = _.findIndex(mappingFields, (item) => item.code === code);
    let curFieldItem = mappingFields[index];
    let fieldData = {};

    if (value.inputType === 'select') {
      curFieldItem = {};
    } else if (curFieldItem?.inputType === 'input' && !value.inputType) {
      value = {
        value: value.target.value
      };
    }

    if (value) {
      fieldData = {
        opt: 'EQUAL',
        name: field.name || field.comment || '',
        code: field.code,
        ...curFieldItem,
        ...value
      };

      if (index > -1) {
        mappingFields[index] = fieldData;
      } else {
        mappingFields.push(fieldData);
      }
    } else {
      mappingFields.splice(index, 1);
    }

    setMappingFields([...mappingFields]);
  };

  const formatColumns = () => {
    const _render = (value) => {
      if (value === '' || _.isUndefined(value)) {
        return '-';
      }
      return value;
    };

    return _.map(filterCols, (col) => {
      if (_.isString(col)) {
        col = {
          title: col,
          dataIndex: col,
          render: _render
        };
      } else if (col && !col.render) {
        col.render = _render;
      }

      if (col?.dataIndex === 'code') {
        if (!col.width) {
          if (readOnly) {
            col.width = 80;
          } else {
            col.width = 120;
          }
        }

        col.render = (code, record) => {
          if (col.isView) {
            return <span style={{wordBreak: 'break-all'}}>{code}</span>;
          }

          let curField = _.find(mappingFields, (item) => item.code === code);
          let filedValue = curField?.code;
          if (curField?.inputType === 'input' || (curField && curField?.value)) {
            filedValue = curField?.value || '';
          }

          if (readOnly) {
            return <span style={{wordBreak: 'break-all'}}>{filedValue || '-'}</span>;
          }

          const valueSetItem = curField?.inputType === 'input' ? (
            <Input
              size="small"
              value={filedValue}
              style={{width: 80}}
              onChange={updateMappingFields(record, code)}
            />
          ) : (
            <FieldSelect
              value={curField}
              onChange={updateMappingFields(record, code)}
            />
          );

          return (
            <Row align="middle" gutter={4}>
              <Col>{ valueSetItem }</Col>
              <Col>
                <a
                  href="javascript:;"
                  className="g-button"
                  onClick={() => {
                    const inputType = curField?.inputType === 'input' ? 'select' : 'input';
                    updateMappingFields(record, code)({
                      inputType
                    })
                  }}
                >
                  <SyncOutlined />
                </a>
              </Col>
            </Row>
          )
        };
      } else if (col?.dataIndex === 'operate') {
        col.render = (key, record, index) => {
          return (
            <span
              className="g-button"
              onClick={() => {
                mappingFields.splice(index, 1);
                setMappingFields([...mappingFields]);
              }}
            >
                <DeleteOutlined/>
            </span>
          );
        };
      }

      return col;
    });
  };

  const getMappingField = () => {
    const scroll = {
      y: 194
    };

    if (readOnly) {
      scroll.x = 240;
    }

    return (
      <div className={styles.fieldMapping}>
        {!_dataSourceId || !_tableName ? (
          <ListTable size="small" pagination={false} columns={formatColumns()}/>
        ) : (
          <ListTable
            size="small"
            rowKey="code"
            scroll={scroll}
            key={[_dataSourceId, _tableName].join('-')}
            pagination={false}
            columns={formatColumns()}
            dataSource={filterDataList()}
          />
        )}
      </div>
    );
  };

  return getMappingField();
};

export default FieldMappingTable;

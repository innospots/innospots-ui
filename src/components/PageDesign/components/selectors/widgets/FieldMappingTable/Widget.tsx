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

import _ from 'lodash';
import { useModel } from 'umi';
import { message, Input, Row, Col, Table } from 'antd';
import React, { useMemo, useEffect, useContext, useState, forwardRef } from 'react';

import { useDebounceEffect, useRequest, useUpdateEffect } from 'ahooks';
import { DeleteOutlined, SyncOutlined } from '@ant-design/icons';

import { KeyValues } from '@/common/types/Types'
import * as Service from '@/services/Credential';
import type { WidgetItemType } from '@/models/AppEditor';

import { WidgetContext } from '../../WidgetProvider';

import InputFieldCascader from '../InputFieldCascader';

import styles from './index.less';

const DEFAULT_COLUMNS = [
  {
    width: '50%',
    title: '表字段',
    dataIndex: 'name',
  },
  {
    width: '50%',
    title: '映射字段',
    dataIndex: 'code',
  },
];

const findFieldItem = (record: any, inputFields: any[]) => {
  let result: any = null;

  _.find(inputFields, (nodeItem) => {
    const field = _.find(nodeItem.fields, (item) =>
      [record.name, record.code].includes(item.value),
    );
    if (field) {
      result = {
        opt: 'EQUAL',
        name: record.name || record.comment || '',
        code: record.code,
        value: '${' + field.value + '}',
        nodeKey: nodeItem.nodeKey,
        valueType: field.type,
      };
      return true;
    }
  });

  return result;
};

const FieldMappingTable: React.FC<WidgetItemType> = forwardRef(
  ({ settings = {}, widgetType, ...props }, ref) => {
    const { columns } = settings;
    const readOnly = widgetType === 'view'
    const { formValues } = useModel('AppEditor', (model) => ({
      formValues: model.currentFormValues
    }));
    const { inputData: inputFields } = useModel('AppData', (model) => ({
      inputData: model.inputData,
    }));
    const [schemaFields, setSchemaFields] = useState<any[]>([]);
    const [mappingFields, setMappingFields] = useState<any[]>([]);

    const [fieldsLoading, setFieldsLoading] = useState(false);

    const { value, onChange } = props;

    const depData = useMemo<KeyValues>(() => {
      return {
        tableName: formValues[settings.tableName],
        queryName: formValues[settings.queryName],
        dataSourceId: formValues[settings.dependencies]
      }
    }, [ settings.dependencies, settings.tableName, settings.queryName, formValues ])

    const getFormatFields = (schemaFields: any[], inputFields: any[]) => {
      if (inputFields?.length) {
        _.each(schemaFields, (item, index) => {
          const result = findFieldItem(item, inputFields);
          if (result) {
            _.merge(schemaFields[index], result);
          }
        });
      }
      return schemaFields;
    }

    const updateMappings = (fields) => {
      setMappingFields(fields);
      onChange?.(fields);
    };

    const fetchSchemaFieldsRequest = useRequest<any, any[]>(Service.fetchSchemaFields, {
      manual: true,
      onSuccess: (result) => {
        updateMappings(getFormatFields(result, inputFields))
        setFieldsLoading(false);
      },
    });

    const [tableScroll, setTableScroll] = useState<{
      x: true | string | number;
      y: string | number;
    }>({
      x: true,
      y: 140,
    });
    const { size } = useContext(WidgetContext);

    useDebounceEffect(
      () => {
        if (size?.height) {
          setTableScroll({
            x: size.width - 80,
            y: size.height - 84,
          });
        }
      },
      [size],
      {
        wait: 100,
      },
    );

    const getTableData = async () => {
      let error;

      if (!depData.dataSourceId || !depData.tableName || fieldsLoading) {
        // error = t('workflow.sql.datasource.placeholder')
        return;
      }

      if (error) {
        message.error(error);
      } else {
        setFieldsLoading(true);
        fetchSchemaFieldsRequest.run({
          credentialKey: depData.dataSourceId,
          [depData.queryName || 'tableName']: depData.tableName,
        });
      }
    };

    useEffect(() => {
      if (value?.length) {
        setMappingFields(value);
      } else {
        getTableData();
      }
    }, []);

    // useDebounceEffect(
    //   () => {
    //     if (!value?.length && !mappingFields.length) {
    //       if (inputFields?.length) {
    //         const fields: any[] = [];
    //         _.each(schemaFields, (item) => {
    //           const result = findFieldItem(item, inputFields);
    //           if (result) {
    //             fields.push(result);
    //           }
    //         });
    //         if (fields.length) {
    //           updateMappings(fields);
    //         }
    //       } else {
    //         updateMappings(schemaFields);
    //       }
    //     } else if (!mappingFields.length) {
    //       if (schemaFields.length) {
    //         updateMappings(schemaFields);
    //       } else if (value?.length) {
    //         updateMappings(value);
    //       }
    //     }
    //   },
    //   [value, schemaFields, inputFields],
    //   { wait: 500 },
    // );

    const filterDataList = () => {
      // if (readOnly && mappingFields?.length) {
      //   return _.filter(schemaFields, (item) => {
      //     return !!_.find(mappingFields, (field) => field.code === item.code);
      //   });
      // }

      if (!depData.tableName || !depData.dataSourceId) return [];

      return mappingFields;
    };

    const filterCols = useMemo(() => {
      const cols = _.cloneDeep(columns || DEFAULT_COLUMNS);

      if (readOnly) {
        return _.filter(cols, (item) => item.dataIndex !== 'operate');
      }

      return cols;
    }, [columns, readOnly]);

    // useUpdateEffect(() => {
    //   updateMappings([]);
    // }, [depData.tableName, depData.dataSourceId, depData.queryName]);

    useUpdateEffect(() => {
      getTableData();
    }, [depData.tableName, depData.dataSourceId, depData.queryName]);

    const updateMappingFields = (field, code, index) => (v) => {
      // const index = _.findIndex(mappingFields, (item) => item.code === code);
      let curFieldItem = mappingFields[index];
      let fieldData = {};

      if (field?.inputType === 'select' || v?.inputType === 'select') {
        // curFieldItem = {};
      } else if ((curFieldItem?.inputType === 'input' && !field?.inputType) || !curFieldItem?.inputType) {
        v = {
          value: v.target.value,
        };
      }

      if (v) {
        fieldData = {
          opt: 'EQUAL',
          name: field.name || field.comment || '',
          code: field.code,
          ...curFieldItem,
          ...v,
        };

        if (index > -1) {
          mappingFields[index] = fieldData;
        } else {
          mappingFields.push(fieldData);
        }
      } else {
        mappingFields.splice(index, 1);
      }

      updateMappings([...mappingFields]);
    };

    const formatColumns = () => {
      const _render = (v) => {
        if (v === '' || _.isUndefined(v)) {
          return '-';
        }
        return v;
      };

      return _.map(filterCols, (col) => {
        if (_.isString(col)) {
          col = {
            title: col,
            dataIndex: col,
            render: _render,
          };
        } else if (col && !col.render) {
          col.render = _render;
        }

        if (col?.dataIndex === 'code') {
          if (col.width) {
            if (!readOnly) {
              if (col.width !== 'auto') {
                col.width *= 1
              }
            } else {
              col.width = 100;
            }
            // if (readOnly) {
            //   col.width = 80;
            // } else {
            //   col.width = 160;
            // }
          }

          col.render = (code, record, index) => {
            if (col.isView) {
              return <span style={{ wordBreak: 'break-all' }}>{code}</span>;
            }

            const curField = _.find(mappingFields, (item) => item.code === code);
            const curInputType = curField?.inputType || 'input';
            let filedValue = curField?.code;
            if (curInputType === 'input' || (curField && curField?.value)) {
              filedValue = curField?.value ?? filedValue;
            }

            if (readOnly) {
              return <span style={{ wordBreak: 'break-all' }}>{filedValue || '-'}</span>;
            }

            const valueSetItem =
              curInputType === 'input' ? (
                <Input
                  size="small"
                  value={filedValue}
                  style={{ width: 120 }}
                  onChange={updateMappingFields(record, code, index)}
                />
              ) : (
                <div style={{ width: 120 }}>
                  <InputFieldCascader
                    style={{ width: '100%' }}
                    value={curField ? (curField.nodeKey ? [curField.nodeKey, curField.code] : [curField.code]) : undefined}
                    fieldSource={settings.fieldSource}
                    onChange={updateMappingFields(record, code, index)}
                  />
                </div>
              );

            return (
              <Row align="middle" gutter={4}>
                <Col>{valueSetItem}</Col>
                <Col>
                  <a
                    href="javascript:;"
                    className="g-button"
                    onClick={() => {
                      const inputType = curInputType === 'input' ? 'select' : 'input';
                      updateMappingFields(
                        record,
                        code,
                        index,
                      )({
                        inputType,
                      });
                    }}
                  >
                    <SyncOutlined />
                  </a>
                </Col>
              </Row>
            );
          };
        } else if (col?.dataIndex === 'operate') {
          col.render = (key, record, index) => {
            return (
              <span
                className="g-button"
                onClick={() => {
                  mappingFields.splice(index, 1);
                  updateMappings([...mappingFields]);
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

    const getMappingField = () => {
      return (
        <div className={styles.fieldMapping}>
          {!depData.dataSourceId || !depData.tableName ? (
            <Table size="small" pagination={false} columns={formatColumns()} />
          ) : (
            <Table
              size="small"
              scroll={tableScroll}
              loading={fieldsLoading}
              key={[depData.dataSourceId, depData.tableName].join('-')}
              rowKey={(record) => [record.code, record.name || 'name'].join('-')}
              pagination={false}
              columns={formatColumns()}
              dataSource={filterDataList()}
            />
          )}
        </div>
      );
    };

    return getMappingField();
  },
);

export default FieldMappingTable;

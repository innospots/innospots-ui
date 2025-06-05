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
import cls from 'classnames';
import { useModel } from 'umi';
import { Row, Col, Button, Select, message } from 'antd';
import React, { useState, useContext, useEffect, useMemo, forwardRef } from 'react';

import type { WidgetItemType } from '@/models/AppEditor';

import useI18n from '@/common/hooks/useI18n';
import { MinusCircleOutlined } from '@ant-design/icons';

import {useControllableValue, useRequest, useUpdateEffect} from 'ahooks';

import * as Service from '@/services/Credential';

import { WidgetContext } from '../../WidgetProvider';
// import FormContext from './FormContext';

import InputFieldCascader from '../InputFieldCascader';

import styles from '../../style.less';

const FieldMapping: React.FC<WidgetItemType> = forwardRef(({ settings = {}, widgetType, ...rest }, ref) => {
  const { tableName, fieldSource, dependencies } = settings;
  const readOnly = widgetType === 'view'
  const [schemaFields, setSchemaFields] = useState<any[]>([]);
  const { formValues } = useModel('AppEditor', (model) => ({
    formValues: model.currentFormValues
  }));

  const { size } = useContext(WidgetContext)
  const fetchSchemaFieldsRequest = useRequest<any, any[]>(Service.fetchSchemaFields, {
    manual: true,
    onSuccess: (result) => {
      if (result) {
        setSchemaFields(result)
      }
    },
  });

  const curTableName = formValues[tableName];
  const curDataSourceId = formValues[dependencies];

  const { t } = useI18n(['workflow', 'common']);

  const containerStyle = useMemo(() => {
    const height = size?.height;
    return {
      height: height ? height - 40 : 40,
    };
  }, [size]);

  const selectOptions = useMemo(() => {
    return _.map(schemaFields, (item) => ({
      value: [item.code, item.name].join('-'),
      label: item.name,
    }));
  }, [schemaFields]);

  const [mapping, setMapping] = useControllableValue<any[]>(rest, {
    defaultValue: [{}],
  });

  useEffect(() => {
    if (!mapping) {
      setMapping([{}]);
    }
  }, [mapping]);

  const nodeData = {};
  const curNodeData = nodeData?.data || {};

  const tableNameVal = curTableName || curNodeData[tableName];
  const dataSourceIdVal = curDataSourceId || curNodeData[dependencies];

  useUpdateEffect(() => {
    setMapping([{}]);
  }, [tableNameVal, dataSourceIdVal]);

  const getTableData = async () => {
    let error;

    if (!dataSourceIdVal || !tableNameVal || fetchSchemaFieldsRequest.loading) {
      // error = t('workflow.sql.datasource.placeholder')
      return;
    }

    if (error) {
      message.error(error);
    } else {
      fetchSchemaFieldsRequest.run({
        tableName: tableNameVal,
        credentialKey: dataSourceIdVal,
      });
    }
  };

  useEffect(() => {
    getTableData();
  }, [tableNameVal, dataSourceIdVal]);

  const handleInsertNewItem = () => {
    mapping.push({});
    setMapping([...mapping]);
  };

  const handleRemoveMapping = (index: number) => {
    mapping.splice(index, 1);
    setMapping([...mapping]);
  };

  const getMappingField = () => {
    return (
      <Row>
        <Col span={24}>
          <div className={styles.paramsContainer}>
            <table>
              <tbody>
                {_.map(mapping, (item, index) => {
                  let viewValue = item.value
                  const fieldNodes = item.fieldNodes || []
                  if (fieldNodes.length) {
                    viewValue = _.map(fieldNodes, item => item.label)
                    viewValue = viewValue.join(' - ')
                  }
                  return (
                    <tr className={styles.paramRow} key={index}>
                      <td width="48%">
                        <div style={{ padding: '4px 0' }}>
                          {readOnly ? (
                            <span>{item?.name || '-'}</span>
                          ) : (
                            <Select
                              size="small"
                              value={item.code ? [item.code, item.name].join('-') : undefined}
                              style={{ width: '100%' }}
                              placeholder={t('workflow.sql.mapper.column.name.placeholder')}
                              options={selectOptions}
                              onChange={(value) => {
                                const values = value.split('-');
                                item.opt = 'EQUAL';
                                item.code = values[0];
                                item.name = values[1];
                                setMapping(_.clone(mapping));
                              }}
                            />
                          )}
                        </div>
                      </td>
                      <td style={{ width: 30, textAlign: 'center' }}>
                        <span style={{ color: '#8c8c8c', fontSize: 10 }}>&gt;&gt;</span>
                      </td>
                      <td width="48%">
                        {readOnly ? (
                          <span>{viewValue || '-'}</span>
                        ) : (
                          <InputFieldCascader
                            value={item.fieldValue}
                            fieldSource={fieldSource}
                            placeholder={t('workflow.sql.field.column.mapping_var.placeholder')}
                            onChange={(value) => {
                              mapping[index] = {
                                ...mapping[index],
                                ..._.pick(value, [
                                  'value',
                                  'nodeKey',
                                  'valueType',
                                  'fieldValue'
                                ]),
                              };
                              setMapping(_.clone(mapping));
                            }}
                          />
                        )}
                      </td>
                      {mapping.length > 1 && !readOnly ? (
                        <td style={{ width: 30 }}>
                          <Button
                            danger
                            type="link"
                            size="small"
                            onClick={() => handleRemoveMapping(index)}
                          >
                            <MinusCircleOutlined />
                          </Button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          {
            !readOnly && (
              <div className={styles.expandBtn}>
                <span className="cur-btn" onClick={handleInsertNewItem}>
                  + {t('common.button.add')}
                </span>
              </div>
            )
          }

          <div className="custom-scrollbar" style={containerStyle}>
            {getMappingField()}
          </div>
        </div>
      </div>
    </div>
  );
})

export default FieldMapping;

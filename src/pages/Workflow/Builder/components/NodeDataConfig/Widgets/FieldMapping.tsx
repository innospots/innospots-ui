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

import React, {useContext, useEffect, useMemo} from 'react';
import {Row, Col, Button, Select, message, Typography} from 'antd';
import _ from 'lodash';
import {useModel} from 'umi';

import type {FormItemProps} from './types';
import CurContext from '../../../common/context';

import useI18n from '@/common/hooks/useI18n';
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';

import {useControllableValue, useUpdateEffect} from 'ahooks';

// import FormContext from './FormContext';
import FieldSelect from './FieldSelect';

import styles from '../index.less';

const {Link} = Typography;
const {Option} = Select;

const FieldMapping: React.FC<FormItemProps> = ({schema, addons, readOnly, ...rest}) => {
  const {tableName, dependencies} = schema;
  // const {formValues} = useContext(FormContext);
  const formData = addons?.formData || {};

  const {schemaFields, fetchSchemaFieldsRequest} = useModel('Credential', (model) =>
    _.pick(model, ['schemaFields', 'fetchSchemaFieldsRequest'])
  );

  const curTableName = formData[tableName];
  const curDataSourceId = formData[dependencies];

  const {t} = useI18n(['workflow', 'common']);

  const selectOptions = useMemo(() => {
    return _.map(schemaFields, item => ({
      value: [item.code, item.name].join('-'),
      label: item.name
    }))
  }, [ schemaFields ]);

  const [mapping, setMapping] = useControllableValue<any[]>(rest, {
    defaultValue: [{}]
  });

  useEffect(() => {
    if (!mapping) {
      setMapping([{}]);
    }
  }, [mapping]);

  const {
    // @ts-ignore
    nodeData
  } = useContext(CurContext);

  const curNodeData = nodeData?.data || {};

  const tableNameVal = curTableName || curNodeData[tableName];
  const dataSourceIdVal = curDataSourceId || curNodeData[dependencies];

  useUpdateEffect(() => {
    setMapping([{}]);
  }, [tableNameVal, dataSourceIdVal]);

  useEffect(() => {
    getTableData();
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
        credentialId: dataSourceIdVal
      });
    }
  };

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
                return (
                  <tr className={styles.paramRow} key={index}>
                    <td width="44%">
                      <div style={{padding: '10px 0'}}>
                        {readOnly ? (
                          <span>{item?.name || '-'}</span>
                        ) : (
                          <Select
                            size="small"
                            value={item.code ? [item.code, item.name].join('-') : undefined}
                            style={{width: '100%'}}
                            placeholder={t(
                              'workflow.sql.mapper.column.name.placeholder'
                            )}
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
                    <td style={{width: 30, textAlign: 'center'}}>
                      <span style={{color: '#8c8c8c', fontSize: 10}}>
                          &gt;&gt;
                      </span>
                    </td>
                    <td width="44%">
                      {readOnly ? (
                        <span>{mapping[index]?.value || '-'}</span>
                      ) : (
                        <FieldSelect
                          value={item}
                          style={{width: '100%'}}
                          placeholder={t(
                            'workflow.sql.field.column.mapping_var.placeholder'
                          )}
                          onChange={(value) => {
                            mapping[index] = {
                              ...mapping[index],
                              ...value
                            };
                            setMapping(_.clone(mapping));
                          }}
                        />
                      )}
                    </td>
                    {mapping.length > 1 && !readOnly ? (
                      <td style={{width: 30}}>
                        <Button
                          danger
                          type="link"
                          size="small"
                          onClick={() => handleRemoveMapping(index)}
                        >
                          <MinusCircleOutlined/>
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
    <div className="form-item-wrapper">
      <Row justify="end">
        <Col>
          {
            !readOnly && (
              <Link onClick={handleInsertNewItem}>
                <PlusOutlined/>
                <span>{t('common.button.add')}</span>
              </Link>
            )
          }
        </Col>
      </Row>
      <div className={styles.paramsContainer}>{getMappingField()}</div>
    </div>
  );
};

export default FieldMapping;

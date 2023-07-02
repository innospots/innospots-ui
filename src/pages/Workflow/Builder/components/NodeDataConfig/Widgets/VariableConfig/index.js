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

import React, {useMemo, useState, useEffect, Suspense, useContext} from 'react';

import _ from 'lodash';
import { Row, Col, Table, message, Typography, Popconfirm } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

import { useControllableValue } from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import { formatListData, randomString } from '@/common/utils';
import FormContext from '../FormContext';
import CurContext from '../../../../common/context';

import styles from './index.less';

const VariableModal = React.lazy(() => import('./VariableModal'));

const { Link } = Typography;

const VariableConfig = ({ schema, readOnly, addons = {}, ...rest }) => {
    const currentFormData = addons.formData || {};
    const [varIndex, setVarIndex] = useState(-1);
    const [variableModalType, setVariableModalType] = useState(false);
    const { viewType } = useContext(FormContext);
    const { inputFields } = useContext(CurContext);
    const parentField = schema.parentField;
    const depDataSource = schema.dependencies;
    const isConfig = viewType === 'config';

    // useEffect(() => {
    //   if (isConfig && !schema.dependencies) {
    //     addons?.setSchemaByPath(schema.$id, {
    //       ...schema,
    //       dependencies: [ schema.parentField || '', schema.dataSource || '' ]
    //     })
    //   }
    // }, [ isConfig, schema.parentField, schema.dataSource, schema.dependencies ]);

    const parentFieldValue = currentFormData[parentField];
    const otherDataSource = currentFormData[depDataSource];
    const otherDataSourceList = useMemo(() => {
        return otherDataSource && depDataSource
            ? !_.isArray(otherDataSource)
                ? [otherDataSource]
                : otherDataSource
            : [];
    }, [otherDataSource, depDataSource]);

    const externalFields = useMemo(() => {

      let fields;

      if (parentFieldValue) {
        fields = [];
        _.find(inputFields, item => {
          if (item.nodeKey === parentFieldValue.nodeKey) {
            _.find(item.fields, field => {
              if (field.value === parentFieldValue.code) {
                fields = [
                  ...field.subFields
                ]
                return true;
              }
            })
            return true;
          }
        })
        return fields;
      }
      return null;
    }, [inputFields, parentFieldValue]);

    const [variables, setVariables] = useControllableValue(rest, {
        defaultValue: [],
    });

    const { t } = useI18n(['workflow', 'common']);

    useEffect(() => {
        if (!variables) {
            setVariables([]);
        }
    }, [variables]);

    const toggleVariableModal = (type) => () => {
        setVariableModalType(type);

        if (type === 'create' || !type) {
            setVarIndex(-1);
        }
    };

    const deleteVariable = (index) => () => {
        variables.splice(index, 1);
        setVariables([].concat(variables));
    };

    const saveVariableData = (data) => {
        if (varIndex > -1) {
            variables[varIndex] = data;
        } else {
            const result = _.find(variables, (item) => item.code === data.code);
            if (result) {
                message.error(t('common.error_message.id.repeat'));
                return;
            }

            variables.push(data);
        }

        setVariableModalType(false);
        setVariables([].concat(variables));
    };

    const getVariableModal = () => {
        if (!variables) return null;

        return (
            <Suspense fallback={<span />}>
                <VariableModal
                    visible={!!variableModalType}
                    initValues={variables[varIndex]}
                    externalFields={externalFields}
                    onCancel={toggleVariableModal(false)}
                    onSubmit={saveVariableData}
                />
            </Suspense>
        );
    };

    const getFieldPreview = useMemo(() => {
        const columns = [
            {
                title: t('workflow.derived_variables.input.code.label'),
                dataIndex: 'code',
            },
            {
                title: t('workflow.derived_variables.input.name.label'),
                dataIndex: 'name',
            },
            {
                width: 100,
                align: 'center',
                title: t('common.table.column.action'),
                dataIndex: 'code',
                render: (value, record, index) => {
                    if (record.action === false) {
                        return '-';
                    }

                    const otherLength = (otherDataSourceList || []).length;
                    index -= otherLength;

                    return (
                        <Row gutter={[8, 0]} justify="center">
                            <Col>
                                <Link
                                    onClick={() => {
                                        setVarIndex(index);
                                        setVariableModalType('update');
                                    }}
                                >
                                    <EditOutlined />
                                </Link>
                            </Col>
                            <Col>
                                <Popconfirm
                                    title={t('common.text.delete_confirmation')}
                                    onConfirm={deleteVariable(index)}
                                >
                                    <Link>
                                        <DeleteOutlined />
                                    </Link>
                                </Popconfirm>
                            </Col>
                        </Row>
                    );
                },
            },
        ];

        let dataSource = formatListData(variables);

        if (!dataSource.length && readOnly) {
          return (
            <span className="form-item-value">-</span>
          )
        }

        if (depDataSource) {
            if (otherDataSourceList) {
                _.map(otherDataSourceList, (item) => {
                    dataSource.unshift({
                        ...item,
                        action: false,
                        from: 'otherDataSource',
                        __key: randomString(4),
                    });
                });
            } else {
                dataSource = _.filter(dataSource, (item) => item.from !== 'otherDataSource');
            }
        }

        if (readOnly) {
            columns.pop();
        }

        return (
            <div className={styles.fieldPreview}>
                <Table
                    size="small"
                    rowKey="__key"
                    columns={columns}
                    dataSource={dataSource}
                    scroll={{
                        y: 160,
                    }}
                    pagination={false}
                />
            </div>
        );
    }, [variables, otherDataSource, depDataSource, t]);

    return (
      <div className={!readOnly ? 'form-item-wrapper' : ''}>
        <Row justify="end">
          <Col>
            {
              !readOnly && (
                <span className="cur-btn" onClick={toggleVariableModal('create')}>
                    <PlusOutlined style={{ fontSize: 12 }} />
                    <span>{t('common.button.add')}</span>
                </span>
              )
            }
          </Col>
        </Row>
        <div style={{marginTop: '0.5em'}}>
          {getFieldPreview}
          {isConfig && getVariableModal()}
        </div>
      </div>
    );
};

export default VariableConfig;

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

import React, {useContext, useMemo, useState} from 'react';
import useI18n from '@/common/hooks/useI18n';
import { useControllableValue } from 'ahooks';
import _ from 'lodash';
import { Col, Row, Table, Typography, TableColumnsType } from 'antd';
import { MinusCircleOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

import VariableModal from './VariableModal';

import type { KeyValues } from '@/common/types/Types';
import type { FormItemProps } from '../types';
import type { ResponseFieldItem } from '../Webhook/ConfigModal';
import { getDefaultField } from '../Webhook/ConfigModal';

import CurContext from '../../../../common/context';
import {getOperatorData} from '@/components/Rule/util';

const { Link } = Typography;

const AggregateVariables: React.FC<FormItemProps> = ({ addons, schema, readOnly, ...props }) => {
  const ps = {
    ...props,
  };
  const { t } = useI18n(['workflow', 'common']);
  const formData = addons?.formData || {};
  const { dependencies, parentField } = schema || {};
  const fieldType = formData[dependencies] || '';
  const parentFieldValue = formData[parentField] || [];

  const { node, inputFields } = useContext(CurContext);

  const [modalData, setModalData] = useState<Record<string, any>>({
    type: 'create',
    visible: false
  })

  if (ps.value === undefined) {
    delete ps.value;
  }

  const [fields, setFields] = useControllableValue<ResponseFieldItem[]>(ps, {
    defaultValue: [],
  });

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

  const getParentInputFields = () => {
    if (!node) return [];

    const edges = node._model.graph.getIncomingEdges(node);
    let fields: any[] = [];
    const parentValue = parentFieldValue[0]?.code;

    _.find(edges, edge => {
      const source = edge.source;
      if (source && source.cell) {
        const field = _.find(inputFields, item => item.nodeKey === source.cell);
        if (field) {
          if (fieldType === 'list' && parentValue) {
            const listTarget = _.find(field.fields, item => item.value === parentValue);
            if (listTarget) {
              fields = listTarget.subFields;
              return true
            }
          } else {
            fields = fields.concat(_.filter(field.fields, item => (item.type !== 'LIST')));
          }
        }
      }
    });

    return fields
  }

  const addField = () => {
    setModalData({
      type: 'create',
      visible: true,
      treeData: getParentInputFields()
    })
  };

  const columns:TableColumnsType<KeyValues> = [
    {
      title: '变量标识',
      dataIndex: 'code',
      render: (text) => (
        <span>{text || '-'}</span>
      ),
    }, {
      title: '备注',
      dataIndex: 'comment',
      render: (text) => (
        <span>{text || '-'}</span>
      ),
    },
  ];

  if (!readOnly) {
    columns.push({
      title: '操作',
      width: 60,
      align: 'center',
      dataIndex: 'key',
      render: (text, record, index) => (
        <Row gutter={8}>
          <Col>
            <EditOutlined
              style={{ cursor: 'pointer', color: '#666' }}
              onClick={() => {
                setModalData({
                  type: 'update',
                  visible: true,
                  initValues: record,
                  treeData: getParentInputFields()
                })
              }}
            />
          </Col>
          <Col>
            <MinusCircleOutlined
              style={{ cursor: 'pointer', color: '#666' }}
              onClick={() => {
                const list: ResponseFieldItem[] = _.cloneDeep(fields);
                list.splice(index, 1);
                setFields(list);
              }}
            />
          </Col>
        </Row>
      ),
    });
  }

  const handleClose = () => {
    setModalData({
      visible: false
    })
  }

  const handleVarSubmit = (data) => {
    const newData = getDefaultField(data);
    const list: ResponseFieldItem[] = _.cloneDeep(fields);
    if (modalData.type === 'create') {
      list.push(newData);
    } else {
      const index = _.findIndex(fields, item => item.key === modalData.initValues.key);
      if (index > -1) {
        list[index] = newData;
      }
    }

    setFields(list);
    setModalData({
      visible: false
    })
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
      {
        !readOnly && (
          <VariableModal
            // treeData={formatInputFields}
            { ...modalData }
            onCancel={handleClose}
            onSubmit={handleVarSubmit}
          />
        )
      }
    </div>
  );
};

export default AggregateVariables;

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

import React, {useMemo, useContext} from 'react';
import _ from 'lodash';

import {Select} from 'antd';
import {useControllableValue, useUpdateEffect} from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import CurContext from '../../../common/context';

import type {FormItemProps} from './types';

const InputFieldSelect: React.FC<FormItemProps> = ({readOnly, addons, schema, ...props}) => {
  const {inputFields, node} = useContext(CurContext);

  const formData = addons?.formData || {};
  const {dataType, dependencies} = schema;
  const parentField = formData[dependencies] || [];

  const selectProps: any = {};

  const [curField, setCurField] = useControllableValue(props);

  if (dataType !== 'list') {
    selectProps.mode = 'multiple';
  }

  useUpdateEffect(() => {
    if (dependencies) {
      setCurField(undefined);
    }
  }, [ parentField[0]?.value, dependencies ])

  const getParentInputFields = () => {
    if (!node) return [];

    const edges = node._model.graph.getIncomingEdges(node);
    const fields: any[] = [];
    _.map(edges, edge => {
      const source = edge.source;
      if (source && source.cell) {
        const field = _.find(inputFields, item => item.nodeKey === source.cell);
        if (field) {
          fields.push(field)
        }
      }
    });

    return fields
  }

  const formatInputFields = useMemo(() => {

    let fields = getParentInputFields();
    let fieldOptions:any[] = [];

    if (dependencies || parentField[0]?.nodeKey) {
      const _parent = parentField[0] || {};
      _.find(fields, item => {
        if (item.nodeKey === _parent.nodeKey) {
          _.find(item.fields, field => {
            if (field.value === _parent.code) {
              fieldOptions = field.subFields
              return true;
            }
          })
          return true;
        }
      })
      return fieldOptions;
    }

    _.map(fields, item => {
      fieldOptions = _.filter(item.fields, item => (dataType === 'list' ? (item.type === 'LIST') : (item.type !== 'LIST')));
    })

    return fieldOptions
  }, [inputFields, dataType, parentField, dependencies]);

  const handleFieldChange = (value) => {
    if (!_.isArray(value)) {
      value = [ value ];
    }

    let fields = getParentInputFields();

    const curValues = _.map(value, v => {
      let curField;
      const node = _.find(fields, item => {
        curField = _.find(item.fields, field => field.value === v);
        return !!curField;
      });
      return {
        code: v,
        value: '${'+ v +'}',
        nodeKey: node?.nodeKey,
        valueType: curField?.type,
      }
    });

    setCurField(curValues)
  }

  const curValue = useMemo(() => {
    if (!curField) return undefined;
    return _.map(curField, item => item.code);
  }, [curField]);

  useUpdateEffect(() => {
    if (dataType && !readOnly) {
      setCurField(undefined)
    }
  }, [dataType, readOnly]);

  const {t} = useI18n('common');

  if (readOnly) {
    return <span className="form-item-value">{curField?.[0]?.code || '-'}</span>;
  }

  return (
    <Select
      showSearch
      allowClear
      value={curValue}
      options={formatInputFields}
      style={{width: '100%'}}
      { ...selectProps }
      disabled={schema.disabled || schema.readOnly}
      dropdownMatchSelectWidth={false}
      placeholder={schema.placeholder || t('common.select.placeholder')}
      onChange={handleFieldChange}
    />
  )

  // return (
  //   <TreeSelect
  //     showSearch
  //     allowClear
  //     treeDefaultExpandAll
  //     value={curValue}
  //     treeData={formatInputFields}
  //     style={{lineHeight: '26px', width: '100%'}}
  //     disabled={schema.disabled || schema.readOnly}
  //     dropdownMatchSelectWidth={false}
  //     placeholder={schema.placeholder || t('common.select.placeholder')}
  //     onChange={(value) => {
  //       if (!value) {
  //         setCurField(undefined);
  //       }
  //     }}
  //     onSelect={(value, node) => {
  //       if (!value) {
  //         setCurField(undefined);
  //       } else {
  //         setCurField([{
  //           code: node.code,
  //           value: '${'+ node.code +'}',
  //           nodeKey: node.nodeKey,
  //           valueType: node.dataType,
  //         }]);
  //       }
  //     }}
  //   />
  // );
};

export default InputFieldSelect;
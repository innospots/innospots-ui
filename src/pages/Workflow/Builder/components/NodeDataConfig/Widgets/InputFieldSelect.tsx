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

import {TreeSelect} from 'antd';
import {useControllableValue, useUpdateEffect} from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import CurContext from '../../../common/context';

import type {FormItemProps} from './types';

const DEFAULT_PARENT_FIELD = {};

const InputFieldSelect: React.FC<FormItemProps> = ({readOnly, addons, schema, ...props}) => {
  const {inputFields} = useContext(CurContext);

  const formData = addons?.formData || {};
  const {filterProps, dependencies} = schema;
  const parentFieldValue = dependencies ? (formData[dependencies] || DEFAULT_PARENT_FIELD) : null;

  const formatInputFields = useMemo(() => {
    const propKeys = _.keys(filterProps);
    const fetchMatched = (field) => _.find(propKeys, key => filterProps[key] !== field[key])

    let fields;

    if (parentFieldValue) {
      fields = [];
      _.find(inputFields, item => {
        if (item.nodeKey === parentFieldValue.nodeKey) {
          _.find(item.fields, field => {
            if (field.value === parentFieldValue.code) {
              fields = _.map(field.subFields, subField => ({
                value: subField.value,
                title: subField.label,
                dataType: subField.type
              }))
              return true;
            }
          })
          return true;
        }
      })
      return fields;
    } else {
      fields = _.map(inputFields, (item) => {
        const children: any[] = [];
        _.each(item.fields, (field) => {
          const matched = fetchMatched(field);
          if (!matched) {
            children.push({
              title: field.label,
              dataType: field.type,
              nodeKey: item.nodeKey,
              code: field.value,
              value: [item.nodeKey, field.value].join('$$')
            })
          }
        })

        return {
          title: item.nodeName,
          value: item.nodeKey,
          children: children
        };
      });

      return _.filter(fields, field => !!field.children.length);
    }
  }, [inputFields, filterProps, parentFieldValue]);

  const [curField, setCurField] = useControllableValue(props);
  const curValue = useMemo(() => {
    if (!curField) return undefined;

    const _curField = _.isArray(curField) ? curField[0] : curField;

    if (_curField.nodeKey && _curField.code) {
      return [_curField.nodeKey, _curField.code].join('$$');
    }

    return _.isArray(curField) ? curField.join('$$') : curField;
  }, [curField]);

  useUpdateEffect(() => {
    if (parentFieldValue && !readOnly) {
      setCurField(undefined)
    }
  }, [parentFieldValue, readOnly]);

  const {t} = useI18n('common');

  if (readOnly) {
    return <span className="form-item-value">{curField?.[0]?.code || '-'}</span>;
  }

  return (
    <TreeSelect
      showSearch
      allowClear
      treeDefaultExpandAll
      value={curValue}
      treeData={formatInputFields}
      style={{lineHeight: '26px', width: '100%'}}
      disabled={schema.disabled || schema.readOnly}
      dropdownMatchSelectWidth={false}
      placeholder={schema.placeholder || t('common.select.placeholder')}
      onChange={(value) => {
        if (!value) {
          setCurField(undefined);
        }
      }}
      onSelect={(value, node) => {
        if (!value) {
          setCurField(undefined);
        } else {
          setCurField([{
            code: node.code,
            value: '${'+ node.code +'}',
            nodeKey: node.nodeKey,
            valueType: node.dataType,
          }]);
        }
      }}
    />
  );
};

export default InputFieldSelect;

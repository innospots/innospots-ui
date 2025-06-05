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
import { Cascader } from 'antd';
import React, { useMemo } from 'react';

import useI18n from '@/common/hooks/useI18n';

const { SHOW_CHILD } = Cascader;

const InputFieldCascader: React.FC<any> = ({ value, fieldSource, onChange, ...rest }) => {
  const { t } = useI18n(['common']);
  const { inputData, getOptionsByFieldSource } = useModel('AppData', (model) => ({
    inputData: model.inputData,
    getOptionsByFieldSource: model.getOptionsByFieldSource,
  }));

  const inputFields: any[] = useMemo(
    () => getOptionsByFieldSource(fieldSource),
    [inputData, fieldSource],
  );

  const fieldValue = useMemo(() => {
    if (_.isArray(value)) {
      return value
    } else if (value && rest.multiple) {
      const v = _.isArray(value) ? value : [value]
      return _.map(v, item => [item.nodeKey, item.code])
    }
    return value ? [value.nodeKey, value.code] : undefined
  }, [value, rest.multiple]);

  return (
    <Cascader
      allowClear
      size="small"
      value={fieldValue}
      options={inputFields}
      showCheckedStrategy={SHOW_CHILD}
      dropdownMatchSelectWidth={false}
      placeholder={t('common.select.placeholder')}
      onChange={(value, nodes) => {
        let fieldData: any = null;
        if (rest.multiple) {
          fieldData = _.map(nodes, (node, index) => {
            const nodeData = node[0]
            const fieldData = (node[1] || {})
            const selectValue = fieldData.value
            return {
              nodeKey: nodeData.value,
              code: selectValue,
              value: '${' + selectValue + '}',
              valueType: fieldData.type,
            }
          })
        } else {
          const nl = value?.length;
          if (nl) {
            const selectValue = value[nl - 1]
            const node = nodes[nl - 1] || {};
            fieldData = {
              code: selectValue,
              value: '${' + selectValue + '}',
              nodeKey: value[0],
              valueType: node.type,
              fieldValue: nodes,
              fieldNodes: nodes,
            };
          }
        }
        const lastData = _.isArray(fieldData) ? _.last(fieldData) : fieldData
        onChange?.(fieldData, lastData);
      }}
      style={{ width: '100%' }}
      {...rest}
    />
  );
};

export default InputFieldCascader;

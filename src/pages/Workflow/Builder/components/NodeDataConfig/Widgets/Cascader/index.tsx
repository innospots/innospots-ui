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

import React, { useContext, useMemo } from 'react';
import { Cascader } from 'antd';

import _ from 'lodash';
import { useControllableValue } from 'ahooks';

import type { FormItemProps } from '../types';
import useI18n from '@/common/hooks/useI18n';
import CurContext from '../../../../common/context';

const FieldCascader: React.FC<FormItemProps> = ({ schema, readOnly, ...rest }) => {
    const { inputFields } = useContext(CurContext);
    const [curValue, setCurValue] = useControllableValue(rest);

    const { t } = useI18n('common');

    const formatOptions = useMemo(() => {
        if (schema?.optionsType === 'customOptions') {
          return schema?.options
        }

        return _.map(inputFields, (item) => {
            return {
                label: item.nodeName,
                value: item.nodeKey,
                children: item.fields,
            };
        });
    }, [inputFields, schema.options, schema.optionsType]);

    if (readOnly) {
        return (
            <span className="form-item-value">
                {(_.isArray(curValue) ? curValue[curValue.length - 1] : curValue) || '-'}
            </span>
        );
    }

    return (
        <Cascader
            value={curValue}
            style={{width: '100%'}}
            options={formatOptions}
            onChange={(value) => {
              setCurValue(value || [])
            }}
            placeholder={schema.placeholder || t('common.select.placeholder')}
        />
    );
};

export default FieldCascader;

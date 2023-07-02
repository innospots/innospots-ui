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
import _ from 'lodash';
import { Select, SelectProps } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import CurContext from '../../../common/context';

const { Option, OptGroup } = Select;

const resetValue = (value: string) => value.replace(/\$|\{|\}/g, '');

const FieldSelect: React.FC<
    SelectProps & {
        value: {
            value: string;
            nodeKey: string;
            valueType: string;
        };
        onChange: (value: any) => {};
    }
> = ({ value, onChange, ...rest }) => {
    const { t } = useI18n(['common']);

    const { inputFields } = useContext(CurContext);

    const fieldValue = useMemo(() => {
        if (!value?.value) return undefined;
        const v = resetValue(value.value);
        return [value.nodeKey, value.valueType, v].join('-');
    }, [value]);

    const getOptionList = useMemo(
        () => (
            <>
                {_.map(inputFields, (group) => (
                    <OptGroup key={group.nodeKey} label={group.nodeName}>
                        {_.map(group.fields, (field) => {
                            const v = [group.nodeKey, field.type, field.value].join('-');
                            return (
                                <Option key={v} value={v}>
                                    {field.label}
                                </Option>
                            );
                        })}
                    </OptGroup>
                ))}
            </>
        ),
        [inputFields],
    );

    return (
        <Select
            allowClear
            size="small"
            value={fieldValue}
            dropdownMatchSelectWidth={false}
            placeholder={t('common.select.placeholder')}
            onChange={(selectValue) => {
                if (selectValue) {
                    const vls = selectValue.split('-');
                    onChange?.({
                        value: '${' + vls[2] + '}',
                        nodeKey: vls[0],
                        valueType: vls[1],
                    });
                } else {
                    onChange?.({
                        value: undefined,
                        nodeKey: undefined,
                        valueType: undefined,
                    });
                }
            }}
            style={{width: '100%'}}
            {...rest}
        >
            {getOptionList}
        </Select>
    );
};

export default FieldSelect;

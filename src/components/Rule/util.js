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

import { OPERATORS, EMPTY_VALUE_TYPES } from '@/common/constants';

import _ from 'lodash';

export const isDate = (dataType) => dataType === 'DATE' || dataType === 'TIMESTAMP';
export const isBoolean = (dataType) => dataType === 'BOOLEAN';
export const isString = (dataType) => dataType === 'STRING';
export const isNumber = (dataType) =>
    dataType === 'DOUBLE' || dataType === 'INTEGER' || dataType === 'LONG';
export const isMultiValue = (termValue) => termValue === 'NOTIN' || termValue === 'IN';
export const isSelectField = (field) =>
    /* field.allowsDictionaryConfig &&  */ field.tagEnum && field.tagEnum.length > 0;

/**
 * 不需要值的操作类型
 * @param type
 * @returns {boolean}
 */
export const isEmptyValue = (type) => EMPTY_VALUE_TYPES.indexOf(type) > -1;

/**
 * 获取操作符数据
 * @param value
 * @returns {unknown}
 */
export const getOperatorData = (value) => _.find(OPERATORS, (o) => o.value === value);

/**
 * 根据数据类型获取操作符列表
 * @param type
 */
export const getOperatorListByType = (type) => {
    const list = [];
    _.map(OPERATORS, (item) => {
        if (!type || item.valueTypes === 'ALL' || _.indexOf(item.valueTypes, type) > -1) {
            const cloneItem = _.clone(item);
            delete cloneItem.valueTypes;

            list.push(cloneItem);
        }
    });

    return list;
};

/**
 * 获取表达式描述字符串
 * @param fieldName
 * @param operator
 * @param value
 */
export const getStatementString = (fieldName, operator, value) => {
    if (!_.isArray(value)) {
        return (operator.statement || '')
            .replace(/\$\{field\}/gi, fieldName)
            .replace(/\$\{value\}/gi, value);
    }
};

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

import { OPERATORS } from '@/common/constants';

import _ from 'lodash';

/**
 * 根据数据类型获取操作符列表
 * @param type
 */
export const getOperatorByType = (type) =>
    _.filter(OPERATORS, (item) => _.indexOf(item.valueTypes, type) > -1);

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

export const matchQueryFields = (sql) => {
    const matches = (sql || '').match(/\$\{\w+\}/g);
    return _.uniq(matches);
};

export const getErrorField = (fieldName, errorFields) => {
    if (!_.isArray(fieldName)) {
        fieldName = [fieldName];
    }
    return _.find(errorFields, (field) => _.isEqual(field.name, fieldName));
};

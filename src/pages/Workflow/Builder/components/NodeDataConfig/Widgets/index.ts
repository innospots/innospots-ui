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

import * as CustomWidgets from './widgets';

export const getFormByType = (type: string) => {
    type = _.upperFirst(_.camelCase(type));
    return CustomWidgets[type];
};

export const getFormNamePath = (formName: string, viewType?: string) => {
    if (viewType === 'info' && _.isString(formName)) {
        const namePath = (formName || '').split('.');
        namePath.unshift(viewType);
        return namePath;
    }

    return formName;

    // if (_.isString(formName)) {
    //     const namePath = (formName || '').split('.');
    //     if (viewType === 'info') {
    //         namePath.unshift(viewType)
    //     }
    //     return namePath
    // }
    //
    // return formName
};

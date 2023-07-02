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

import React, {useMemo} from 'react';
import _ from 'lodash';
import cls from 'classnames';
import {Typography} from 'antd';

import type {ExecutionItemProps} from './types';

import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

const {Text, Paragraph} = Typography;

const Logger: React.FC<ExecutionItemProps> = ({executeData}) => {
  const {t} = useI18n(['workflow']);

  const renderLogs = useMemo(() => {
    const logsData = executeData.logs || {};
    const keys = _.keys(logsData);

    if (!keys.length) {
      return (
        <div>
          <p style={{marginTop: 24}}>
            <Text strong>{t('workflow.builder.execution.empty')}</Text>
          </p>
          <p>{t('workflow.builder.execution.empty.desc')}</p>
        </div>
      );
    }

    return _.map(keys, (key) => (
      <Paragraph key={key}>
        {key}: {logsData[key] || '-'}
      </Paragraph>
    ));
  }, [executeData.logs]);

  return <div className={cls(styles.logContent, styles.contentBox, 'content-box')}>{renderLogs}</div>;
};

export default Logger;

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
import { Col, Row } from 'antd';
import React, { useMemo, useEffect, forwardRef } from 'react';

import { useControllableValue } from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import InputFieldCascader from '../InputFieldCascader';

import { matchQueryFields } from './index';
import type { WidgetItemType } from '@/models/AppEditor';

import styles from './styles.less';

const QueryParams: React.FC<WidgetItemType> = forwardRef(({ settings = {}, widgetType, ...rest }, ref) => {
  const [queryFields, setQueryFields] = useControllableValue<any[]>(rest, {
    defaultValue: [],
  });
  const { formValues } = useModel('AppEditor', (model) => ({
    formValues: model.currentFormValues
  }));

  const { t } = useI18n(['common']);
  const readOnly = widgetType === 'view';

  const curDataSource = useMemo(() => {
    if (settings.dependencies) {
      return formValues[settings.dependencies]
    }
    return null
  }, [ settings.dependencies, formValues ])

  const matchCurQueryFields = (sql) => {
    const ass = matchQueryFields(sql || '');

    setQueryFields(
      _.map(ass, (v: string) => {
        const vm = v.match(/\$\{(\w+)\}/) || [];
        const code = vm.length ? vm[1] : v;
        const curField = _.find(queryFields, (item) => item.code === code);
        return {
          ...curField,
          code,
          name: v,
        };
      }),
    );
  };

  useEffect(() => {
    matchCurQueryFields(curDataSource);
  }, [curDataSource]);

  if (!queryFields?.length) {
    return <div className={styles.placeholder}>{settings.placeholder || '--'}</div>;
  }

  return (
    <div className={styles.paramsContainer}>
      {_.map(queryFields, (item, index) => {
        const curField = queryFields[index];
        return (
          <div className={styles.paramRow} key={item.code}>
            <Row gutter={[20, 0]} wrap={false} align="middle">
              <Col flex="120px">
                <span className={styles.field}>{item.name}</span>
              </Col>
              <Col flex="none">
                <span style={{ color: '#8c8c8c', fontSize: 10 }}>&gt;&gt;</span>
              </Col>
              <Col flex="auto">
                {readOnly ? (
                  <span>{curField?.value || curField?.name || '-'}</span>
                ) : (
                  <InputFieldCascader
                    value={curField}
                    disabled={readOnly}
                    style={{ width: '100%' }}
                    placeholder={t('workflow.sql.field.column.mapping_var.placeholder')}
                    onChange={(value, lastData) => {
                      queryFields[index] = {
                        ...curField,
                        ...lastData,
                      };
                      setQueryFields([...queryFields]);
                    }}
                  />
                )}
              </Col>
            </Row>
          </div>
        );
      })}
    </div>
  );
})

export default QueryParams;

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

import React, {useMemo, useEffect, useRef, useState} from 'react';
import _ from 'lodash';

import {useModel} from 'umi';
import {useControllableValue} from 'ahooks';
import {TableColumnsType} from 'antd';

import ListTable from '@/components/ListTable';
import {IconFont} from '@/components/Nice/NiceIcon';
import FieldSelect from './FieldSelect';

import {randomString} from '@/common/utils';
import type {ArrayType} from '@/common/types/Types';

import useI18n from '@/common/hooks/useI18n';

import type {FormItemProps} from './types';

import styles from '../index.less';

type Registry = {
  bodyTemplate: string,
  schemaFields: ArrayType
};

const getDefaultField = (o) => ({
  key: randomString(4),
  ...o
});

const FieldMappingTable: React.FC<FormItemProps> = ({schema, addons, readOnly, ...rest}) => {
  const {t} = useI18n(['workflow', 'common']);

  const { httpApis, httpApiDetailRequest } = useModel('HttpApi', (model) => _.pick(model, ['httpApis', 'httpApiDetailRequest']));
  const [ mappingFields, setMappingFields ] = useControllableValue<Record<string, any>[]>(rest, {
    defaultValue: []
  });
  const [ registryDetail, setRegistryDetail ] = useState<Registry>();

  const registryId = addons?.formData?.[schema.dependencies] as number;
  const registryIdRef = useRef<number>();

  const paramList = useMemo(() => {
    let {bodyTemplate, schemaFields} = registryDetail || {};

    if (bodyTemplate) {
      try {
        const bodyTemplateJson = JSON.parse(bodyTemplate.replace(/\$\{\w+\}/g, '1'));
        schemaFields = _.map(schemaFields, (item) => {
          if (bodyTemplateJson[item.code]) {
            item.from = 'body';
          }
          return item;
        });
      } catch (e) {
      }
    }

    return _.map(schemaFields, (item) => getDefaultField(item));
  }, [registryDetail]);

  useEffect(() => {
    if (!mappingFields?.length) {
      setMappingFields(paramList)
    }
  }, [ paramList, mappingFields ]);

  useEffect(() => {
    if (registryId) {
      getHttpApiData();
    }

    if (registryIdRef.current && registryIdRef.current !== registryId) {
      setMappingFields([]);
    }
    registryIdRef.current = registryId;
  }, [ registryId ]);

  const getHttpApiData = async () => {
    const result = await httpApiDetailRequest.runAsync(registryId);
    setRegistryDetail(result as Registry);
  }

  const updateMappingFields = (field, code) => (_value) => {
    const index = _.findIndex(mappingFields, (item) => item.code === code);
    const fieldData = {
      name: field.name || field.comment || '',
      code: field.code,
      paramType: field.from || 'get',
      ..._value
    };

    // @ts-ignore
    const fields = [
      ...mappingFields
    ];

    if (index > -1) {
      fields[index] = fieldData;
    } else {
      fields.push(fieldData);
    }

    setMappingFields(fields);
  };

  const getMappingField = () => {
    const columns: TableColumnsType<{
      code: string
      from: string
    }> = [
      {
        key: 'code',
        width: '50%',
        title: t('workflow.httpapi.params'),
        dataIndex: 'code',
        render: (text, record) => {
          let icon;
          if (record.from === 'path') {
            icon = <IconFont type="innospot-icon-link"/>;
          } else if (record.from === 'body') {
            icon = <IconFont type="innospot-icon-http-post"/>;
          } else {
            icon = <IconFont type="innospot-icon-http-get"/>;
          }

          return (
            <div>
              <span>{icon}</span>
              <span style={{paddingLeft: 6, wordBreak: 'break-all'}}>{text}</span>
            </div>
          );
        }
      },
      {
        width: '50%',
        title: t('workflow.httpapi.mapping'),
        dataIndex: 'code',
        key: 'code',
        render: (code, record) => {
          let curField = _.find(mappingFields, (item) => item.code === code);
          if (readOnly) {
            return (
              <span style={{wordBreak: 'break-all'}}>{curField?.value || '-'}</span>
            );
          }

          return (
            <FieldSelect
              value={curField}
              // @ts-ignore
              onChange={updateMappingFields(record, code)}
            />
          );
        }
      }
    ];

    return (
      <div className={styles.fieldMapping}>
        <ListTable
          size="small"
          rowKey="code"
          pagination={false}
          scroll={{
            y: 194
          }}
          columns={columns}
          dataSource={paramList}
        />
      </div>
    );
  };

  return getMappingField();
};

export default FieldMappingTable;

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

import React, {useRef, useMemo, useState, useContext, useEffect} from 'react';
import {useModel} from 'umi';

import {Row, Col, Select, message, Typography} from 'antd';
import _ from 'lodash';
import {PlusOutlined} from '@ant-design/icons';
import {useRequest, useUpdateEffect} from 'ahooks';

import type {FormItemProps} from './types';

import * as Service from '@/services/DataSource';

import FormContext from './FormContext';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import {IconFont} from '@/components/Nice/NiceIcon';

import KafkaTableModal, {MODAL_NAME} from '@/components/KafkaTableModal';

import styles from '../index.less';

const {Link} = Typography;

const DataTableSelect: React.FC<FormItemProps> = ({schema, addons, readOnly, value, onChange}) => {
  const {t} = useI18n('common');
  const {viewType} = useContext(FormContext);
  const formData = addons?.formData || {};
  const dataSourceIdRef = useRef(null);

  const [modal] = useModal(MODAL_NAME);
  const isConfig = viewType === 'config';

  useEffect(() => {
    if (isConfig && !schema.dependencies && schema.dataSource && addons) {
      addons.setSchemaByPath(schema.$id, {
        ...schema,
        dependencies: schema.dataSource
      })
    }
  }, [isConfig, schema.dataSource, schema.dependencies, addons]);

  const [dataSetList, setDataSetList] = useState<any[]>([]);

  const {simpleCredentials} = useModel('Credential', (model) => _.pick(model, ['simpleCredentials']));

  const getDataSetList = useRequest<any, any[]>(Service.fetchSchemaRegistryTopics, {
    manual: true,
    debounceWait: 300,
    onSuccess: (result, params) => {
      setDataSetList(result);
    }
  });

  const dataSourceList = useMemo(() => {
    if (schema.dbType) {
      return _.filter(simpleCredentials, (item) => item.dbType === schema.dbType);
    } else {
      return simpleCredentials;
    }
  }, [simpleCredentials]);

  const curDataSourceId = formData[schema.dependencies];

  const updateTable = useMemo(() => _.find(dataSetList, (item) => item.code === value || item.registryId === value), [dataSetList, value]);
  const curDataSource = useMemo(
    () => _.find(dataSourceList, (item) => item.credentialId === curDataSourceId),
    [dataSourceList, curDataSourceId]
  );

  const tableOptions = useMemo(() => {
    return curDataSource
      ? _.map(dataSetList, (item) => {
        return {
          label: item.name,
          value: item.code
        };
        // const sourceType = curDataSource.sourceType;
        //
        // if (sourceType === 'QUEUE') {
        //     return {
        //         value: item.registryId,
        //         label: item.name
        //     }
        // } else {
        //     return {
        //         value: item.code,
        //         label: item.name
        //     }
        // }
      })
      : [];
  }, [curDataSource, dataSetList]);

  useEffect(() => {
    if (dataSourceIdRef.current && dataSourceIdRef.current !== curDataSourceId) {
      onChange?.()
    }
    dataSourceIdRef.current = curDataSourceId;
    _getDataSetList();
  }, [curDataSourceId]);

  const _getDataSetList = () => {
    if (curDataSourceId) {
      getDataSetList.run(curDataSourceId, {
        // includeField: true
      });
    }
  };

  const toggleTableModal = (type) => () => {
    if (!isConfig) return;

    if (!curDataSource) {
      message.error(t('workflow.kafka.select.datasource.error_message'));
      return;
    } else if (type === 'edit' && !updateTable) {
      message.error(t('workflow.kafka_trigger.select.schemas.error_message'));
      return;
    }

    modal.show({
      modalType: type,
      initValues: updateTable
    });
  };

  const getTableModal = () => {
    if (!isConfig) return null;

    return (
      //@ts-ignore
      <KafkaTableModal dataSource={curDataSource} onSuccess={() => {
        modal.hide();
        _getDataSetList();
      }}/>
    );
  };

  const showAddButton = isConfig && schema.showAddButton;
  const showEditButton = isConfig && schema.showEditButton;

  return (
    <div className={showAddButton ? 'form-item-wrapper' : ''} style={{width: '100%'}}>
      {
        showAddButton && (
          <Row justify="end">
            <Col>
              <Link onClick={toggleTableModal('add')}>
                <PlusOutlined style={{fontSize: 12}}/>
                <span>{t('common.button.add')}</span>
              </Link>
            </Col>
          </Row>
        )
      }
      <Row gutter={[8, 0]} align="middle" justify="space-between" style={{marginTop: '0.5em'}}>
        <Col flex="auto">
          {readOnly ? (
            <span className="form-item-value">{updateTable?.name || '-'}</span>
          ) : (
            <Select
              value={value}
              options={tableOptions}
              style={{width: '100%'}}
              placeholder={schema.placeholder || t('common.select.placeholder')}
              onChange={onChange}
            />
          )}
        </Col>
        {showEditButton && (
          <Col flex="30px" style={{textAlign: 'right'}}>
            <IconFont
              type="innospot-icon-edit"
              className={styles.editIcon}
              onClick={toggleTableModal('edit')}
            />
          </Col>
        )}
      </Row>
      {getTableModal()}
    </div>
  );
};

export default DataTableSelect;

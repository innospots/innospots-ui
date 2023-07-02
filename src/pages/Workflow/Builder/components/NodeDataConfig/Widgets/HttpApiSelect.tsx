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

import React, { useMemo, useState, useEffect } from 'react';
import { Row, Col, Select, message, Typography } from 'antd';
import { useModel } from 'umi';

import { PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { IconFont } from '@/components/Nice/NiceIcon';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import HttpApiModal, { MODAL_NAME } from '@/components/HttpApiModal';

import type { FormItemProps } from './types';

import styles from '../index.less';

const { Option } = Select;
const { Link } = Typography;

const DataSourceSelect: React.FC<FormItemProps> = ({ schema, readOnly, viewType, value, onChange }) => {
    const isConfig = viewType === 'config';

    const { httpApis, httpApisRequest } = useModel('HttpApi', (model) =>
        _.pick(model, ['httpApis', 'httpApisRequest']),
    );

    const [modal] = useModal(MODAL_NAME);

    const { t } = useI18n(['workflow', 'common']);

    const curDataSource = useMemo(() => {
        return _.find(httpApis, (item) => item.registryId === value);
    }, [httpApis, value]);

    useEffect(() => {
        getDataSource();
    }, []);

    const getDataSource = () => {
        httpApisRequest.run();
    };

    const handleDataSourceChange = (registryId: number) => {
        onChange?.(registryId);
    };

    const toggleDataSourceModal = (type) => () => {
        if (type === 'edit' && !curDataSource) {
            message.error(t('workflow.httpapi.select.api.error_message'));
            return;
        }

        modal.show({
            modalType: type,
            initValues: curDataSource,
        });
    };

    const getHttpApiModal = () => <HttpApiModal />;

    const showAddButton = schema.showAddButton && !readOnly;
    const showEditButton = schema.showEditButton && !readOnly;

    return (
      <div className={showAddButton ? 'form-item-wrapper' : ''}>
        <Row justify="end">
          <Col>
            {
              showAddButton && (
                <Link onClick={toggleDataSourceModal('add')}>
                  <PlusOutlined style={{ fontSize: 12 }} />
                  <span>{t('common.button.add')}</span>
                </Link>
              )
            }
          </Col>
        </Row>
        <Row gutter={[8, 0]} align="middle" justify="space-between" style={{marginTop: 6}}>
          <Col flex="auto">
            {readOnly ? (
              <span className="form-item-value">
                  {curDataSource?.name || value || '-'}
              </span>
            ) : (
              <Select
                style={{ width: '100%' }}
                value={curDataSource?.registryId}
                placeholder={
                  schema.placeholder || t('workflow.sql.datasource.placeholder')
                }
                onChange={handleDataSourceChange}
              >
                {_.map(httpApis, (item) => (
                  <Option key={item.registryId} value={item.registryId}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
          </Col>
          {showEditButton && (
            <Col flex="30px" style={{ textAlign: 'right' }}>
              <IconFont
                type="innospot-icon-edit"
                className={styles.editIcon}
                onClick={toggleDataSourceModal('edit')}
              />
            </Col>
          )}
        </Row>
        {isConfig && getHttpApiModal()}
      </div>
    );
};

export default DataSourceSelect;

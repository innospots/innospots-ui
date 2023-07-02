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

import React, {useMemo, useEffect, useContext} from 'react';
import { Row, Col, Select, message, Typography } from 'antd';
import { useModel } from 'umi';

import { PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { IconFont } from '@/components/Nice/NiceIcon';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import DataSourceModal, { MODAL_NAME } from '@/components/DataSourceModal';

import FormContext from './FormContext';

import type { FormItemProps } from './types';

import styles from '../index.less';

const { Option } = Select;
const { Link } = Typography;

const DataSourceSelect: React.FC<FormItemProps> = ({ schema, readOnly, value, onChange }) => {
    const { viewType } = useContext(FormContext);
    const isConfig = viewType === 'config';

    const { dataSources, dataSourceRequest } = useModel('DataSource', (model) =>
        _.pick(model, ['dataSources', 'dataSourceRequest']),
    );

    const [modal] = useModal(MODAL_NAME);

    const { t } = useI18n(['workflow', 'common']);

    const dataSourceList = useMemo(() => {
        if (schema.dbType) {
            return _.filter(dataSources, (item) => item.dbType === schema.dbType);
        } else {
            return dataSources;
        }
    }, [dataSources]);

    const curDataSource = useMemo(() => {
        return _.find(dataSourceList, (item) => item.datasourceId === value);
    }, [dataSourceList, value]);

    useEffect(() => {
        getDataSource();
    }, []);

    const getDataSource = () => {
        if (!dataSources.length) {
            dataSourceRequest.run(schema.params);
        }
    };

    const handleDataSourceChange = (datasourceId: number) => {
        onChange?.(datasourceId);
    };

    const toggleDataSourceModal = (type) => () => {
        if (type === 'edit' && !curDataSource) {
            message.error(t('workflow.sql.select.datasource.error_message'));
            return;
        }

        modal.show({
            modalType: type,
            initValues: curDataSource,
        });
    };

    const getDataSourceModal = () => {
        return <DataSourceModal />;
    };

    const showAddButton = schema.showAddButton && !readOnly;

    return (
      <div className={showAddButton ? 'form-item-wrapper' : ''}>
        {
          showAddButton && (
            <Row justify="end">
              <Col>
                <Link onClick={toggleDataSourceModal('add')}>
                  <PlusOutlined style={{ fontSize: 12 }} />
                  <span>{t('common.button.add')}</span>
                </Link>
              </Col>
            </Row>
          )
        }
        <Row
          gutter={[8, 0]}
          align="middle"
          justify="space-between"
          className="form-content"
        >
          <Col flex="auto">
            {readOnly ? (
              <span className="form-item-value">
                  {curDataSource?.name || value || '-'}
              </span>
            ) : (
              <Select
                style={{ width: '100%' }}
                value={curDataSource?.datasourceId}
                placeholder={
                  schema.placeholder || t('workflow.sql.datasource.placeholder')
                }
                onChange={handleDataSourceChange}
              >
                {_.map(dataSourceList, (item) => (
                  <Option key={item.datasourceId} value={item.datasourceId}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
          </Col>
          {schema.showEditButton && !readOnly && (
            <Col flex="30px" style={{ textAlign: 'right' }}>
              <IconFont
                type="innospot-icon-edit"
                className={styles.editIcon}
                onClick={toggleDataSourceModal('edit')}
              />
            </Col>
          )}
        </Row>
        {isConfig && getDataSourceModal()}
      </div>
    );
};

export default DataSourceSelect;

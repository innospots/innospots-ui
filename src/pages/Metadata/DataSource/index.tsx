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

import React, { useState, useEffect } from 'react';
import { useModel, Link } from 'umi';

import _ from 'lodash';
import cls from 'classnames';

import {Row, Col, Tag, Spin, Card, Empty, Avatar, Popconfirm, Typography, Pagination} from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import InnoIcon from '@/components/Icons/InnoIcon';
import PageLoading from '@/components/PageLoading';

import PermissionSection, { usePermission } from '@/components/PermissionSection';
import PageTitle from '@/components/PageTitle';
import NiceSwitch from '@/components/Nice/NiceSwitch';
import DataSourceModal, { MODAL_NAME } from '@/components/DataSourceModal';
// import CredentialModal, { MODAL_NAME } from '@/components/CredentialModal';

import styles from './style.less';
import {useDeepCompareEffect, useMemoizedFn, useSetState} from "ahooks";

const { Meta } = Card;
const { Paragraph } = Typography;

const DataSource: React.FC = () => {
  const [viewType, setViewType] = useState<string>('card');
  const { t, loading: i18nLoading } = useI18n(['datasource', 'common']);

  const [queryData, setQueryData] = useSetState({
    queryCode: '',
    page: 1,
    size: 10,
    sort: '',
    dbType: ''
  });

  const [deleteAuth] = usePermission('SchemaDatasource-deleteSchemaDatasource');

  const {
    dataSourcesData,
    metaSources,
    dataSourceWithPageRequest,
    metaSourcesRequest,
    deleteDataSourceRequest,
  } = useModel('DataSource');

  const [dataSourceModal] = useModal(MODAL_NAME);

  useDeepCompareEffect(() => {
    dataSourceWithPageRequest.run(queryData);
  }, [queryData]);

  useEffect(() => {
    // dataSourceRequest.run();
    metaSourcesRequest.run();
  }, []);

  const sourceCate = (sourceType: string) => {
    if (['JDBC', 'KV', 'FILE'].includes(sourceType)) {
      return 'BATCH';
    } else if (['CDC', 'QUEUE'].includes(sourceType)) {
      return 'REAL_TIME';
    }
    return '';
  };

  const deleteConfirm = (id: number) => () => {
    return new Promise<void>(async (resolve, reject) => {
      const result = await deleteDataSourceRequest.runAsync(id);

      result ? resolve() : reject();
    });
  };

  const renderPageHeader = () => {
    const list: any[] = [
      {
        value: 'list',
        icon: <UnorderedListOutlined />,
        label: t('datasource.main.view.list'),
      },
      {
        value: 'card',
        icon: <AppstoreOutlined />,
        label: t('datasource.main.view.card'),
      },
    ];
    const switcher = (
      <NiceSwitch value={viewType} dataSource={list} onChange={(val) => setViewType(val)} />
    );

    return (
      <PageTitle
        title={t('datasource.main.heading_title')}
        rightContent={{
          search: {
            placeholder: t('datasource.form.input.name.placeholder'),
            onSearch: (value: string) => {
              setQueryData({
                ...queryData,
                queryCode: value
              })
            },
          },
          button: {
            itemKey: 'SchemaDatasource-createSchemaDatasource',
            label: t('datasource.main.button.add'),
            onClick: () => {
              dataSourceModal.show();
            },
          },
        }}
      />
    );
  };

  const renderCardNode = () => {
    let displayNode;
    const listData = dataSourcesData?.list || [];

    /*if (dataSourceWithPageRequest.loading) {
      displayNode = (
        <div className="g-loading" style={{ marginTop: 140 }}>
          <Spin />
        </div>
      );
    } else */if (!listData?.length) {
      displayNode = (
        <div style={{ marginTop: 140 }}>
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{
              height: 60,
            }}
            description={t('datasource.main.empty')}
          />
        </div>
      );
    } else {
      displayNode = (
        <Row gutter={[24, 24]}>
          {listData.map((item, index) => {
            const actions: any[] = [];
            const meta = _.find(metaSources, (m) => m.dbType === item.dbType);

            actions.push(
              <PermissionSection itemKey="SchemaDatasource-updateSchemaDatasource">
                <div onClick={() => dataSourceModal.show(item)}>
                  <InnoIcon type="edit-alt" /> {t('common.button.edit')}
                </div>
              </PermissionSection>,
            );

            if (item.dbType === 'kafka') {
              actions.push(
                <Link to={`/metadata/data-source/schema?dataSourceId=${item.datasourceId}`}>
                  <InnoIcon type="bar-chart" /> {t('datasource.main.link.schemas')}
                </Link>,
              );
            }

            if (deleteAuth) {
              actions.push(
                <div>
                  <Popconfirm
                    title={t('common.text.delete_confirmation')}
                    okText={t('common.button.confirm')}
                    cancelText={t('common.button.cancel')}
                    onConfirm={deleteConfirm(item.datasourceId)}
                  >
                    <InnoIcon type="delete" /> {t('common.button.delete')}
                  </Popconfirm>
                </div>,
              );
            } else {
              actions.push(
                <PermissionSection itemKey="SchemaDatasource-deleteSchemaDatasource">
                  <div>
                    <InnoIcon type="delete" /> {t('common.button.delete')}
                  </div>
                </PermissionSection>,
              );
            }

            return (
              <Col span={8} key={['card', index].join('-')}>
                <Card actions={actions} bordered={false}>
                  <div className={styles.tag}>
                    {/*<Tag color="blue" visible={sourceCate(item.sourceType) === 'BATCH'}>*/}
                    {/*    {t('datasource.main.batch')}*/}
                    {/*</Tag>*/}
                    {/*<Tag color="green" visible={sourceCate(item.sourceType) === 'REAL_TIME'}>*/}
                    {/*    {t('datasource.main.real_time')}*/}
                    {/*</Tag>*/}
                  </div>
                  <Meta
                    avatar={
                      <Avatar
                        size={48}
                        src={meta?.icon}
                        className={cls(styles.avatar, {
                          [styles.sd]: sourceCate(item.sourceType) === 'REAL_TIME',
                        })}
                      >
                        <div>{item.sourceType}</div>
                      </Avatar>
                    }
                    title={item.name}
                    description={
                      item.dbType ? <Tag color="blue">{item.dbType.toUpperCase()}</Tag> : '-'
                    }
                  />
                  <div style={{ clear: 'both' }} />
                  <div className={styles.infoWrapper}>
                    <Row justify="space-between">
                      <Col span={8}>
                        <p>• {t('datasource.main.author')}</p>
                        <Paragraph ellipsis={{ rows: 1 }}>{item.createdBy || '--'}</Paragraph>
                      </Col>
                      <Col span={8}>
                        <p>• {t('datasource.main.create_time')}</p>
                        <p>{(item.createdTime || '').split(' ')[0] || '--'}</p>
                      </Col>
                      <Col span={8}>
                        <p>• {t('datasource.main.update_time')}</p>
                        <p>{(item.updatedTime || '').split(' ')[0] || '--'}</p>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      );
    }

    return (
      <Spin spinning={dataSourceWithPageRequest.loading}>
        <div className={styles.cardListWrapper}>
          {displayNode}

          {dataSourcesData?.list?.length > 0 && renderPageNode()}
        </div>
      </Spin>
    );
  };

  const renderDataSourceModal = () => {
    return <DataSourceModal />;
  };

  const onPageChange = useMemoizedFn((page, size) => {
    setQueryData({
      page,
      size
    });
  });

  const renderPageNode = () => {
    const pageData = {
      ..._.pick(dataSourcesData?.pagination || {}, 'current', 'pageSize', 'total')
    }

    return (
      <Row align="middle" justify="end" style={{marginTop: 20}}>
        <Col>
          <span style={{ fontSize: 12 }}>{t('common.table.pagination.total_count', pageData)}</span>
        </Col>
        <Col>
          <Pagination
            size="small"
            showLessItems
            showSizeChanger
            {...pageData}
            onChange={onPageChange}
          />
        </Col>
      </Row>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageHeader()}
      {renderCardNode()}
      {renderDataSourceModal()}
    </>
  );
};

export default DataSource;

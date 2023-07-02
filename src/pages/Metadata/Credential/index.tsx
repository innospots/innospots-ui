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
import {useDeepCompareEffect, useMemoizedFn, useSetState} from "ahooks";

import {Row, Col, Tag, Spin, Card, Empty, Avatar, Popconfirm, Typography, Pagination} from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import InnoIcon from '@/components/Icons/InnoIcon';
import PageLoading from '@/components/PageLoading';

import PermissionSection, { usePermission } from '@/components/PermissionSection';
import PageTitle from '@/components/PageTitle';
import NiceSwitch from '@/components/Nice/NiceSwitch';
import CredentialModal, { MODAL_NAME } from '@/components/CredentialModal';

import styles from './style.less';

const { Meta } = Card;
const { Paragraph } = Typography;

const DataSource: React.FC = () => {
  const [viewType, setViewType] = useState<string>('card');
  const { t, loading: i18nLoading } = useI18n(['datasource', 'credential', 'common']);

  const [queryData, setQueryData] = useSetState({
    queryCode: '',
    page: 1,
    size: 10,
    sort: '',
    dbType: ''
  });

  const [deleteAuth] = usePermission('Credential-deleteCredentialInfo');

  const {
    metaSources
  } = useModel('DataSource');

  const {
    credentialData,
    credentialPageRequest,
    deleteCredentialRequest
  } = useModel('Credential');

  const [credentialModal] = useModal(MODAL_NAME);

  useDeepCompareEffect(() => {
    credentialPageRequest.run(queryData);
  }, [queryData]);

  useEffect(() => {
    // dataSourceRequest.run();
    // metaSourcesRequest.run();
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
      const result = await deleteCredentialRequest.runAsync(id);

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
        title={t('credential.main.heading_title')}
        rightContent={{
          search: {
            placeholder: t('credential.form.input.name.placeholder'),
            onSearch: (value: string) => {
              setQueryData({
                ...queryData,
                queryCode: value
              })
            },
          },
          button: {
            itemKey: 'Credential-createCredentialInfo',
            label: t('credential.main.button.add'),
            onClick: () => {
              credentialModal.show();
            },
          },
        }}
      />
    );
  };

  const renderCardNode = () => {
    let displayNode;
    const credentials = credentialData?.list || [];

    if (credentialPageRequest.loading) {
      displayNode = (
        <div className="g-loading" style={{ marginTop: 140 }}>
          <Spin />
        </div>
      );
    } else if (!credentials.length) {
      displayNode = (
        <div style={{ marginTop: 140 }}>
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{
              height: 60,
            }}
            description={t('credential.main.empty')}
          />
        </div>
      );
    } else {
      displayNode = (
        <Row gutter={[24, 24]}>
          {credentials.map((item, index) => {
            const actions: any[] = [];
            const meta = _.find(metaSources, (m) => m.dbType === item.dbType);

            actions.push(
              <PermissionSection itemKey="Credential-updateCredentialInfo">
                <div onClick={() => credentialModal.show(item)}>
                  <InnoIcon type="edit-alt" /> {t('common.button.edit')}
                </div>
              </PermissionSection>,
            );

            if (item.configCode === 'kafka') {
              actions.push(
                <Link to={`/metadata/credential/schema?credentialId=${item.credentialId}`}>
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
                    onConfirm={deleteConfirm(item.credentialId)}
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
                      item.configCode ? <Tag color="blue">{item.configCode.toUpperCase()}</Tag> : '-'
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
      <Spin spinning={credentialPageRequest.loading}>
        <div className={styles.cardListWrapper}>
          {displayNode}
          {!!credentials.length && renderPageNode()}
        </div>
      </Spin>
    );
  };

  const renderCredentialModal = () => {
    return <CredentialModal />;
  };

  const onPageChange = useMemoizedFn((page, size) => {
    setQueryData({
      page,
      size
    });
  });

  const renderPageNode = () => {
    const pageData = {
      ..._.pick(credentialData?.pagination || {}, 'current', 'pageSize', 'total')
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
      {renderCredentialModal()}
    </>
  );
};

export default DataSource;

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

import React from 'react';
import {useModel} from 'umi';
import _ from 'lodash';
import cls from 'classnames';
import {useDeepCompareEffect, useMemoizedFn, useSetState} from "ahooks";
import {Avatar, Col, Empty, Row, Space, Spin} from 'antd';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import PageLoading from '@/components/PageLoading';
import PageTitle from '@/components/PageTitle';
import CredentialTypeModal, {MODAL_NAME} from '@/components/CredentialTypeModal';
import PageHelmet from '@/components/PageHelmet';
import styles from './style.less';
import {KeyValues} from "@/common/types/Types";
import IconButton from "@/components/IconButton";
import ListTable from "@/components/ListTable";
import {renderNodeIcon} from "@/pages/Workflow/Builder/components/NodeIcon";
import {BASE_URL} from "@/common/constants";

const CredentialType: React.FC = () => {
  const {t, loading: i18nLoading} = useI18n(['datasource', 'credentialType', 'common']);

  const [queryData, setQueryData] = useSetState({
    page: 1,
    size: 10,
    sort: '',
    dbType: '',
    queryInput: ''
  });

  const {
    metaSources
  } = useModel('DataSource');

  const {
    credentialTypeData,
    credentialTypePageRequest,
    deleteCredentialTypeRequest
  } = useModel('CredentialType');

  const [credentialTypeModal] = useModal(MODAL_NAME);

  useDeepCompareEffect(() => {
    credentialTypePageRequest.run(queryData);
  }, [queryData]);

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
      const result = await deleteCredentialTypeRequest.runAsync(id);

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      result ? resolve() : reject();
    });
  };

  const renderPageHeader = () => {
    return (
      <PageTitle
        title={t('credentialType.main.page_title')}
        rightContent={{
          search: {
            placeholder: t('common.input.search.label'),
            onSearch: (value: string) => {
              setQueryData({
                ...queryData,
                queryInput: value
              })
            },
          },
          button: {
            itemKey: 'CredentialType-createCredentialType',
            label: t('common.button.create'),
            onClick: () => {
              credentialTypeModal.show();
            },
          },
        }}
      />
    );
  };

  const renderCredentialTypeModal = () => {
    return <CredentialTypeModal/>;
  };

  const onPageChange = useMemoizedFn((page, size) => {
    setQueryData({
      page,
      size
    });
  });

  const renderListTable = () => {
    const columns: KeyValues[] = [
      {
        title: t('credentialType.main.list.type_name'),
        dataIndex: 'name',
        render: (name: string, item: any) => {
          const meta = _.find(metaSources, (m) => m.dbType === item.dbType);

          return (
            <Row align="middle">
              <Col flex="36px" style={{margin: '0 8px 0 12px'}}>
                <Avatar
                  size={36}
                  src={meta?.icon}
                  className={cls(styles.avatar, {
                    [styles.sd]: sourceCate(item.sourceType) === 'REAL_TIME',
                  })}
                  style={{backgroundColor: '#f5f5f5'}}
                >
                  {renderNodeIcon({icon: item.icon}, {
                    baseUrl: BASE_URL
                  })}
                </Avatar>
              </Col>
              <Col>
                <Space>
                  <span>{name || '-'}</span>
                </Space>
              </Col>
            </Row>
          );
        },
      },
      {
        title: t('credentialType.main.list.link_type'),
        dataIndex: 'connectorName',
      },
      {
        title: t('credentialType.main.list.creator'),
        dataIndex: 'createdBy'
      },
      {
        title: t('credentialType.main.list.updatedTime'),
        dataIndex: 'updatedTime'
      },
      {
        title: t('common.table.column.action'),
        width: 148,
        align: 'center',
        dataIndex: 'operate',
        render: (operate: any, record: any) => {
          return (
            <>
              <IconButton
                icon="edit"
                tooltip={t('common.tooltip.edit')}
                permissions="CredentialType-updateCredentialType"
                onClick={() => credentialTypeModal.show(record)}
              />

              <IconButton
                icon="delete"
                tooltip={t('common.tooltip.delete')}
                permissions="CredentialType-deleteCredentialType"
                popConfirm={{
                  title: t('common.text.delete_confirmation'),
                  placement: 'left',
                  okButtonProps: {
                    loading: deleteCredentialTypeRequest.loading,
                  },
                  onConfirm: deleteConfirm(record.typeCode),
                }}
              />
            </>
          );
        },
      },
    ];

    let displayNode;
    const credentialsType = credentialTypeData?.list || [];

    if (credentialTypePageRequest.loading) {
      displayNode = (
        <div className="g-loading" style={{marginTop: 140}}>
          <Spin/>
        </div>
      );
    } else if (!credentialsType.length) {
      displayNode = (
        <div style={{marginTop: 140}}>
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
        <ListTable
          columns={columns}
          rowKey="typeCode"
          dataSource={credentialsType}
          loading={credentialTypePageRequest.loading}
          pagination={credentialTypeData?.pagination}
          onPageChange={onPageChange}
        />
      );
    }

    return (
      <div className={styles.listWrapper}>
        {displayNode}
      </div>
    );
  };

  if (i18nLoading) {
    return <PageLoading/>;
  }

  return (
    <>
      <PageHelmet title={t('credentialType.main.page_title')} />
      {renderPageHeader()}
      {renderListTable()}
      {renderCredentialTypeModal()}
    </>
  );
};

export default CredentialType;

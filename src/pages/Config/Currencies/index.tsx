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

import { useModel } from 'umi';
import {message} from "antd";
import type { ColumnsType } from 'antd/es/table';

import { useSetState, useMemoizedFn, useDeepCompareEffect } from 'ahooks';

import { KeyValues } from '@/common/types/Types';
import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import IconButton from '@/components/IconButton';
import StatusTag, { Status } from '@/components/StatusTag';
import CurrencyModal, { MODAL_NAME } from './components/CurrencyModal';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import PageLoading from '@/components/PageLoading';

import {usePermission} from "@/components/PermissionSection";

import styles from './style.less';

interface DataType {
  name: string;
  code: string;
  status: string;
  operate: string;
  leftSign: string;
  rightSign: string;
}

const Index: React.FC = () => {
  const { currencyData, deleteCurrencyRequest, fetchCurrencyDataRequest, saveCurrencyRequest } = useModel('Currency');

  const [modal] = useModal(MODAL_NAME);

  const { t, loading: i18nLoading } = useI18n(['currency', 'common']);

  const [statusAuth] = usePermission('I18nCurrency-updateStatus');

  const [queryData, setQueryData] = useSetState({
    queryInput: '',
    ...DEFAULT_PAGINATION_SETTINGS
  });

  useDeepCompareEffect(() => {
    fetchCurrencyDataRequest.run(queryData);
  }, [queryData]);

  const deleteCurCurrency = (id: number) => () => {
    return new Promise<void>(async (resolve) => {
      await deleteCurrencyRequest.runAsync(id);
      resolve();
    });
  };

  const handleListPageChange = useMemoizedFn((page, size) => {
    setQueryData({
      ...queryData,
      page,
      size,
    });
  });

  const handleHeaderButtonClick = (type: string) => {
    if (type === 'add') {
      modal.show({
        modalType: type,
        initValues: {
          thousandSeparator: ',',
          decimalSeparator: '.',
          defaultLan: false,
          status: 'ONLINE',
        },
      });
    }
  };

  const renderPageHeader = () => {
    return (
      <>
        <PageTitle
          title={t('currency.heading_title')}
          rightContent={{
            search: {
              // placeholder: t('page.main.input.search.placeholder'),
              onSearch: (queryInput: string) => {
                setQueryData({
                  queryInput,
                });
              },
            },
            button: {
              itemKey: 'I18nCurrency-createCurrency',
              label: t('currency.button.add'),
              onClick: () => {
                handleHeaderButtonClick('add');
              },
            },
          }}
        />
      </>
    );
  };

  const changeStatus = async (record: any) => {
    let notice = record.status === 'OFFLINE' ? t('common.text.deactivate') : t('common.text.activate')
    const result = await saveCurrencyRequest.runAsync('edit', record);
    if (result) {
      message.success(notice + t('common.options.success'));
    }
  };

  const renderListTable = () => {

    const columns: KeyValues[] = [
      {
        title: t('currency.column.name'),
        key: 'name',
        dataIndex: 'name',
      },
      {
        title: t('currency.column.code'),
        key: 'code',
        dataIndex: 'code',
      },
      {
        title: t('currency.column.left_sign'),
        key: 'leftSign',
        dataIndex: 'leftSign',
      },
      {
        title: t('currency.column.right_sign'),
        key: 'rightSign',
        dataIndex: 'rightSign',
      },
      {
        title: t('currency.column.status'),
        align: 'center',
        dataIndex: 'status',
        render: (status: Status, record) =>
          <StatusTag
            status={status}
            onClick={
              statusAuth
                ? () => {
                  changeStatus({...record, status: status === 'OFFLINE' ? 'ONLINE' : 'OFFLINE'});
                }
                : undefined
            }
          />,
      },
      {
        title: t('currency.column.action'),
        width: 92,
        dataIndex: 'operate',
        align: 'center',
        render: (operate: any, record: any) => {
          return (
            <>
              <IconButton
                icon="edit"
                tooltip={t('common.button.edit')}
                permissions="I18nCurrency-updateCurrency"
                onClick={() => {
                  modal.show(record);
                }}
              />

              {record.status === 'OFFLINE' ? (
                <IconButton
                  icon="delete"
                  tooltip={t('common.tooltip.delete')}
                  popConfirm={{
                    title: t('common.text.delete_confirmation'),
                    placement: 'topRight',
                    onConfirm: deleteCurCurrency(record.currencyId),
                    okButtonProps: {
                      loading: deleteCurrencyRequest.loading,
                    },
                  }}
                  permissions="I18nCurrency-deleteCurrency"
                />
              ) : (
                <IconButton disabled icon="delete" />
              )}
            </>
          );
        },
      },
    ];

    return (
      <div className={styles.listWrapper}>
        <ListTable
          columns={columns}
          rowKey="currencyId"
          dataSource={currencyData.list}
          loading={fetchCurrencyDataRequest.loading}
          pagination={currencyData.pagination}
          onPageChange={handleListPageChange}
        />
      </div>
    );
  };

  const renderCurrencyModal = () => {
    return <CurrencyModal />;
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageHeader()}
      {renderListTable()}
      {renderCurrencyModal()}
    </>
  );
};

export default Index;

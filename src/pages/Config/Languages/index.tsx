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

import React, {useMemo, useEffect, useState} from 'react';

import {Row, Col, Space, Upload, Button, UploadProps, message, Modal} from 'antd';
import { PlusOutlined, UploadOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';

import _ from 'lodash';
import { useModel } from 'umi';

import { useSetState, useMemoizedFn, useDeepCompareEffect } from 'ahooks';

import {KeyValues} from '@/common/types/Types';
import {AJAX_PREFIX, DEFAULT_PAGINATION_SETTINGS} from '@/common/constants';

import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import FlagIcon from '@/components/Icons/FlagIcon';
import LanguageModal, { MODAL_NAME } from './components/LanguageModal';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import StatusTag, { Status } from '@/components/StatusTag';
import IconButton from '@/components/IconButton';
import PageLoading from '@/components/PageLoading';
import PermissionSection from '@/components/PermissionSection';
import { HandleType } from '@/common/types/Types';

import styles from './style.less';
import {getAuthHeader} from "@/common/request/header";

const Index: React.FC = () => {
  const { currencies, fetchCurrenciesRequest } = useModel('Currency');

  const { languageData, deleteLanguageRequest, fetchLanguagesRequest } = useModel('I18n');

  const [modal] = useModal(MODAL_NAME);

  const { t, loading: i18nLoading } = useI18n(['language', 'common', 'translation']);

  const [uploadModalData, setUploadModalData] = useState<{
    visible: boolean,
    uploadFile: {
      status?: string
      response?: {
        code?: string
        body?: {}
        message?: string
      }
    }
  }>({
    visible: false,
    uploadFile: {},
  });

  const [queryData, setQueryData] = useSetState({
    ...DEFAULT_PAGINATION_SETTINGS,
  });

  const currencyListData = useMemo(
    () =>
      currencies?.map((currency: { currencyId: string; name: string }) => ({
        value: currency.currencyId,
        label: currency.name,
      })),
    [currencies],
  );

  useEffect(() => {
    fetchCurrenciesRequest.run({
      dataStatus: 'ONLINE',
    });
  }, []);

  useDeepCompareEffect(() => {
    fetchLanguagesRequest.run(queryData);
  }, [queryData]);

  const deleteLanguage = (id: number) => () => {
    return new Promise<void>(async (resolve) => {
      await deleteLanguageRequest.runAsync(id);
      resolve();
    });
  };

  const handleListPageChange = useMemoizedFn((page, size) => {
    setQueryData({
      page,
      size,
    });
  });

  const handleHeaderButtonClick = (type: HandleType) => {
    if (type === 'add') {
      modal.show({
        modalType: 'add',
        initValues: {
          thousandSeparator: ',',
          decimalSeparator: '.',
          defaultLan: false,
          status: 'ONLINE',
        },
      });
    }
  };

  const uploadDocument = () => {
    setUploadModalData({
      visible: true,
      uploadFile: {},
    });
  };

  const renderUploadModal = () => {
    let uploadFile = {};

    const props: UploadProps = {
      name: 'file',
      // 上传文件类型
      accept: '.xls,.xlsx',
      // 限制上传数量
      maxCount: 1,
      // 不展示文件列表
      showUploadList: false,
      action: AJAX_PREFIX + 'i18n/translation/import-excel',
      headers: {
        ...getAuthHeader(),
      },
      onChange(info) {
        uploadFile = info.file;
        setUploadModalData({
          ...uploadModalData,
          uploadFile: uploadFile,
        });

        if (info.file.status === 'done' && info.file.response?.code === '10000') {
          message.success(t('common.error_message.upload.success'));
        } else if (info.file.status === 'error') {
          message.error(t('common.error_message.upload.fail'));
        }
      },
    };

    return (
      <Modal
        width="400px"
        footer={null}
        title={t('translation.upload.title')}
        visible={uploadModalData.visible}
        onCancel={() => {
          if (uploadModalData.uploadFile?.status === 'uploading') {
            message.warn('Uploading...');
          } else {
            setUploadModalData({
              visible: false,
              uploadFile: {},
            });
          }
        }}
      >
        <div>
          <Upload {...props}>
            <Button
              type="primary"
              style={{ marginRight: 24 }}
              icon={<VerticalAlignTopOutlined />}
              loading={uploadModalData.uploadFile?.status === 'uploading'}
            >
              {t('common.button.upload')}
            </Button>
          </Upload>
          <span style={{ color: 'red' }}>{t('translation.upload.desc')}</span>
        </div>
        <div style={{ marginTop: 24, minHeight: 100 }}>
          {uploadModalData.uploadFile?.status === 'uploading' ? (
            <span>Uploading...</span>
          ) : (
            <div>
              {!!uploadModalData.uploadFile?.status &&
              uploadModalData.uploadFile?.status !== 'uploading'
                ? t('translation.upload.result.title')
                : ''}
              {uploadModalData.uploadFile?.response?.code === '10000' ? (
                <pre>{JSON.stringify(uploadModalData.uploadFile?.response?.body, null, 2)}</pre>
              ) : (
                <div style={{ color: 'red' }}>{uploadModalData.uploadFile?.response?.message}</div>
              )}
            </div>
          )}
        </div>
      </Modal>
    );
  };

  const renderPageTitle = () => {
    return (
      <>
        <PageTitle title={t('language.main.heading_title')} />
        <Space className={styles.headerButton}>
          <PermissionSection itemKey="I18nLanguage-updateLanguage">
            <Button icon={<UploadOutlined />} onClick={uploadDocument}>{t('language.main.button.package')}</Button>
          </PermissionSection>

          <PermissionSection itemKey="I18nLanguage-createLanguage">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleHeaderButtonClick('add')}
            >
              {t('language.main.button.add')}
            </Button>
          </PermissionSection>
        </Space>
      </>
    );
  };

  const renderListTable = () => {
    const columns: KeyValues[] = [
      {
        title: t('language.main.column.name'),
        dataIndex: 'name',
        render: (name: string, record: any) => {
          const country = record.locale?.split('_')?.[1]?.toLowerCase();
          return (
            <Row align="middle">
              <Col flex="18px" style={{ marginRight: 8 }}>
                <FlagIcon code={country} />
              </Col>
              <Col>
                <Space>
                  <span>{name || '-'}</span>
                  <span>{record.defaultLan ? '(默认)' : null}</span>
                </Space>
              </Col>
            </Row>
          );
        },
      },
      {
        title: t('language.main.column.locale'),
        dataIndex: 'locale',
      },
      {
        title: t('language.main.column.currency'),
        dataIndex: 'currencyId',
        render: (currencyId: string) => {
          const curCurrency = _.find(currencyListData, (c) => c.value === currencyId);
          return <span>{curCurrency?.label}</span>;
        },
      },
      {
        title: t('language.main.column.status'),
        dataIndex: 'status',
        render: (status: Status) => <StatusTag status={status} />,
      },
      {
        title: t('language.main.column.action'),
        width: 92,
        align: 'center',
        dataIndex: 'operate',
        render: (operate: any, record: any) => {
          return (
            <>
              <IconButton
                icon="edit"
                tooltip={t('common.tooltip.edit')}
                permissions="I18nLanguage-updateStatus"
                onClick={() => modal.show(record)}
              />
              {record.status === 'OFFLINE' ? (
                <IconButton
                  icon="delete"
                  tooltip={t('common.tooltip.delete')}
                  popConfirm={{
                    title: t('common.text.delete_confirmation'),
                    placement: 'left',
                    okButtonProps: {
                      loading: deleteLanguageRequest.loading,
                    },
                    onConfirm: deleteLanguage(record.languageId),
                  }}
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
          rowKey="languageId"
          dataSource={languageData.list}
          loading={fetchLanguagesRequest.loading}
          pagination={languageData.pagination}
          onPageChange={handleListPageChange}
        />
      </div>
    );
  };

  const renderLanguageModal = () => {
    return <LanguageModal />;
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageTitle()}
      {renderListTable()}
      {renderLanguageModal()}
      {renderUploadModal()}
    </>
  );
};

export default Index;

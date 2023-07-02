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

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Input, message, Modal, Row, Select, Spin, Upload } from 'antd';
import { SearchOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';

import _ from 'lodash';
import { useModel } from 'umi';

import { useDeepCompareEffect, useMemoizedFn, useSetState } from 'ahooks';

import { IS_DEV, AJAX_PREFIX, DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';
import { getAuthHeader } from '@/common/request/header';

import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import IconButton from '@/components/IconButton';
import TransModal, { MODAL_NAME } from './components/TransModal';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import PageLoading from '@/components/PageLoading';
import { getFormattedLocale, randomString } from '@/common/utils';

import styles from './style.less';
import { UploadProps } from 'antd';
import FlagIcon from '@/components/Icons/FlagIcon';

const Index: React.FC = () => {
  const {
    appList,
    appModuleList,
    translationData,
    translationHeaderColumn,

    appListRequest,
    translationRequest,
    appModuleListRequest,
    translationHeaderColumnRequest,
  } = useModel('I18n');

  const [modal] = useModal(MODAL_NAME);

  const { t, loading: i18nLoading } = useI18n(['translation', 'common']);

  const [uploadModalData, setUploadModalData] = useState({
    visible: false,
    uploadFile: {},
  });
  const [queryData, setQueryData] = useSetState({
    ...DEFAULT_PAGINATION_SETTINGS,
    app: null,
    code: '',
    module: null,
  });
  const [headerColumn, setHeaderColumn] = useState<any>();

  const transList = useMemo(
    () =>
      translationData.list?.map((data) => ({
        ...data,
        key: data.dictionary?.dictionaryId || randomString(4),
      })),
    [translationData.list],
  );

  useEffect(() => {
    appListRequest.run();
    translationHeaderColumnRequest.run();
  }, []);

  useDeepCompareEffect(() => {
    // @ts-ignore
    !_.isEmpty(queryData.app) && appModuleListRequest.run(queryData.app);
  }, [queryData.app]);

  useDeepCompareEffect(() => {
    translationRequest.run(queryData);
  }, [queryData]);

  useDeepCompareEffect(() => {
    formatHeaderColumn();
  }, [translationHeaderColumn]);

  const onListPageChange = useMemoizedFn((curPage, pageSize) => {
    setQueryData({
      page: curPage,
      size: pageSize,
    });
  });

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

          translationRequest.run({
            ...DEFAULT_PAGINATION_SETTINGS,
            app: null,
            code: '',
            module: null,
          });
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

  const renderPageHeader = () => {
    return (
      <>
        <PageTitle
          title={t('translation.main.heading_title')}
          style={{ height: 64, paddingTop: 8 }}
        />

        <Row gutter={16} className={styles.headerSearch}>
          <Col>
            <Select
              allowClear
              value={queryData.app}
              placeholder={t('translation.main.column.app')}
              onChange={(value: any) =>
                setQueryData({ ...queryData, page: 1, app: value, module: null })
              }
            >
              {appList?.map((am, index) => (
                <Select.Option key={[am, index].join('-')} value={am}>
                  {am}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col>
            <Select
              allowClear
              value={queryData.module}
              disabled={_.isEmpty(queryData.app) || appModuleListRequest.loading}
              placeholder={t('translation.main.select.filter.placeholder')}
              onChange={(value: any) => setQueryData({ ...queryData, page: 1, module: value })}
            >
              {appModuleList?.map((am, index) => (
                <Select.Option key={[am, index].join('-')} value={am}>
                  {am}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col>
            <Input
              prefix={<SearchOutlined />}
              placeholder={t('translation.main.input.search.placeholder')}
              onPressEnter={(event: any) =>
                setQueryData({
                  ...queryData,
                  page: 1,
                  code: event.target.value,
                })
              }
            />
          </Col>
          {IS_DEV && (
            <Col>
              <Button type="primary" icon={<VerticalAlignTopOutlined />} onClick={uploadDocument}>
                {t('translation.main.button.upload')}
              </Button>
            </Col>
          )}
        </Row>
      </>
    );
  };

  const formatHeaderColumn = () => {
    const columns = [
      // {
      //     title: t('translation.main.column.app'),
      //     key: 'appName',
      //     fixed: 'left',
      //     width: '220px',
      //     dataIndex: 'appName',
      //     render: (name: string, record: any) => {
      //         return (
      //             <Row align="middle">
      //                 <Col flex="40px">
      //                     <NiceAvatar
      //                         size={24}
      //                         src={'/static/images/common/app.png'}
      //                     />
      //                 </Col>
      //                 <Col>
      //                     <span>{record.dictionary?.app || '-'}</span>
      //                 </Col>
      //             </Row>
      //         )
      //     }
      // },
      {
        title: t('translation.main.column.module'),
        fixed: 'left',
        width: 140,
        key: 'module',
        dataIndex: 'module',
        render: (name: string, record: any) => {
          return <span>{record.dictionary?.module || '-'}</span>;
        },
      },
      {
        title: t('translation.main.column.resource'),
        fixed: 'left',
        width: 240,
        ellipsis: true,
        dataIndex: 'code',
        render: (name: string, record: any) => {
          return <span>{record.dictionary?.code || '-'}</span>;
        },
      },
      {
        title: t('common.table.column.action'),
        width: 72,
        dataIndex: 'operate',
        align: 'center',
        fixed: 'right',
        render: (operate: any, record: any) => {
          return (
            <IconButton
              icon="edit"
              tooltip={t('translation.form.edit.title')}
              permissions="I18nTransMessage-updateTransMessage"
              onClick={() => {
                modal.show(record);
              }}
            />
          );
        },
      },
    ];

    const addItems: any[] = _.map(translationHeaderColumn, (column: any) => {
      const [, , , country] = getFormattedLocale(column.locale);
      return {
        title: (
          <Row align="middle">
            <Col flex="18px" style={{ marginRight: 8 }}>
              <FlagIcon code={country} />
            </Col>
            <Col style={{ display: 'flex', alignItems: 'center' }}>
              <span>{column.name || '-'}</span>
              <span>{column.defaultLan ? `(${t('translation.main.default')})` : null}</span>
            </Col>
          </Row>
        ),
        width: 280,
        ellipsis: true,
        key: column.locale,
        dataIndex: column.locale,
        render: (locale: any, record: any) => {
          return record.messages?.[column.locale] || '-';
        },
      };
    });

    columns.splice(-1, 0, ...addItems);
    setHeaderColumn([...columns]);
  };

  const renderDataContent = () => {
    return (
      <div className={styles.listWrapper}>
        <Spin spinning={translationHeaderColumnRequest.loading}>
          <ListTable
            scroll={{ x: 1500 }}
            columns={headerColumn}
            dataSource={transList}
            rowKey={(record) => _.get(record, 'dictionary.dictionaryId')}
            onPageChange={onListPageChange}
            loading={translationRequest.loading}
            pagination={translationData.pagination}
          />
        </Spin>
      </div>
    );
  };

  const renderTransModal = () => {
    return <TransModal />;
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageHeader()}
      {renderDataContent()}
      {renderTransModal()}
      {renderUploadModal()}
    </>
  );
};

export default Index;

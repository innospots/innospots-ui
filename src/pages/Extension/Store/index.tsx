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

import React, { useState } from 'react';

import {
  Col,
  Row,
  Card,
  Typography,
  Descriptions,
  UploadProps,
  message,
  Modal,
  Upload,
  Button,
} from 'antd';
import { AimOutlined, CheckCircleTwoTone, VerticalAlignTopOutlined } from '@ant-design/icons';

import { useModel } from 'umi';

import { useSetState, useDeepCompareEffect } from 'ahooks';

import _ from 'lodash';

import PageTitle from '@/components/PageTitle';

import styles from './style.less';
import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import PermissionSection from '@/components/PermissionSection';
import NiceAvatar from '@/components/Nice/NiceAvatar';
import { AJAX_PREFIX } from '@/common/constants';
import { getAuthHeader } from '@/common/request/header';
import { STATUS_TAG } from '@/pages/Applications/Installed';

const { Paragraph } = Typography;

const Index: React.FC = () => {
  const { appList, fetchAppListRequest } = useModel('Application');

  const { t, loading: i18nLoading } = useI18n(['app', 'common']);

  const [queryData, setQueryData] = useSetState({});
  const [uploadModalData, setUploadModalData] = useState({
    visible: false,
    uploadFile: {},
  });

  useDeepCompareEffect(() => {
    getListData();
  }, [queryData]);

  const getListData = () => {
    fetchAppListRequest.run(queryData);
  };

  const uploadDocument = () => {
    setUploadModalData({
      visible: true,
      uploadFile: {},
    });
  };

  const renderPageHeader = () => {
    return (
      <Row>
        <Col flex="auto">
          <PageTitle
            title={t('app.main.app_store.title')}
            rightContent={{
              search: {
                placeholder: t('app.main.placeholder.app'),
                onSearch: (value: string) => {
                  setQueryData({
                    queryInput: value,
                  });
                },
              },
            }}
          />
        </Col>
        <PermissionSection itemKey="AppDefinition-downloadApplication4Local">
          <Col flex="82px" style={{ display: 'flex', alignItems: 'center' }}>
            <Button icon={<VerticalAlignTopOutlined />} type="primary" onClick={uploadDocument}>
              {t('common.button.upload')}
            </Button>
          </Col>
        </PermissionSection>
      </Row>
    );
  };

  const renderUploadModal = () => {
    let uploadFile = {};

    const props: UploadProps = {
      name: 'file',
      // 上传文件类型
      accept: '.zip',
      // 限制上传数量
      maxCount: 1,
      // 不展示文件列表
      showUploadList: false,
      action: AJAX_PREFIX + 'appstore/download/desk',
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
          message.success(`${info.file.name} 文件上传成功`);

          setQueryData({});
          getListData();
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} 文件上传失败`);
        }
      },
    };

    return (
      <Modal
        width="400px"
        footer={null}
        title="文件上传"
        open={uploadModalData.visible}
        onCancel={() => {
          if (uploadModalData.uploadFile?.status === 'uploading') {
            message.warn('文件正在上传中');
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
          <span style={{ color: 'red' }}>说明：接收.zip文件</span>
        </div>
        <div style={{ marginTop: 24, minHeight: 100 }}>
          {uploadModalData.uploadFile?.status === 'uploading' ? (
            <span>处理中...</span>
          ) : (
            <div>
              {!!uploadModalData.uploadFile?.status &&
              uploadModalData.uploadFile?.status !== 'uploading'
                ? '处理结果：'
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

  if (i18nLoading) {
    return <PageLoading />;
  }

  const renderContent = () => {
    return (
      <Row gutter={[24, 24]}>
        {_.map(appList || [], (li: any) => {
          return (
            <Col span={8} className={styles.cardItem} key={li.appKey}>
              <Card hoverable>
                <div className={styles.top}>
                  <Row justify="space-between">
                    <Col>
                      <Row>
                        <Col flex="48px">
                          <NiceAvatar size={48} src={<AimOutlined />} />
                        </Col>
                        <Col style={{ paddingLeft: 12 }}>
                          <div style={{ fontWeight: 600 }}> {li.name || '-'} </div>
                          <div>
                            {t('app.main.description.author')}：
                            <span style={{ color: 'blue', fontSize: 12 }}>
                              {' '}
                              {li.vendor || '-'}{' '}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                    <Col>
                      {/*<PermissionSection itemKey="AppInstallment-install">*/}
                        {/*<Button type="primary" size="small">安装应用</Button>*/}
                      {/*</PermissionSection>*/}
                    </Col>
                  </Row>

                  <div style={{ marginTop: 24, fontSize: 12 }}>
                    <Paragraph ellipsis={{ rows: 3 }}>{li.description}</Paragraph>
                    {/*<span className={styles.linkText}>
                        <a href="#"> <DoubleRightOutlined/> 查看详情 </a>
                      </span>*/}
                  </div>
                </div>
                <div className={styles.bottom}>
                  <Row>
                    <Col span={12}>
                      <Descriptions column={1}>
                        <Descriptions.Item label={t('app.main.description.version')}>
                          {li.version || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('app.main.description.latest_update')}>
                          {li.pushTime || '-'}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={12}>
                      <Row>
                        <Col>
                          <CheckCircleTwoTone twoToneColor="#52c41a" />
                        </Col>
                        <Col style={{ paddingLeft: 8 }}>
                          {t('app.main.description.used_version')}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <>
      {renderPageHeader()}
      {renderContent()}
      {renderUploadModal()}
    </>
  );
};

export default Index;

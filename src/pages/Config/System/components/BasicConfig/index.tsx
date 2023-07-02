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
import _ from 'lodash';
import { useModel } from 'umi';

import { Row, Col, Form, Spin, Input, Button, Upload, Select, Divider, message } from 'antd';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { useMemoizedFn } from 'ahooks';

import { UPLOAD_IMAGE_PATH } from '@/common/constants';
import { getAuthHeader } from '@/common/request/header';
import PermissionSection, { usePermission } from '@/components/PermissionSection';
import useI18n from '@/common/hooks/useI18n';

import styles from './style.less';

const formItemLayout = {
  labelCol: { flex: '224px' },
  wrapperCol: { flex: 'auto' },
};

const InfoConfig: React.FC = () => {
  const [formRes] = Form.useForm();
  const { t } = useI18n(['configuration', 'common']);

  const { infoConfigsRequest, saveInfoConfigRequest } = useModel('Setting');

  const { locales, languageList, getLanguageList, fetchLocalesRequest } = useModel('I18n');

  const [uploadAuth] = usePermission('SysConfig-uploadImage');

  const [imgData, setImgData] = useState({
    icon: {
      imgUrl: null,
      loading: false,
    },
    logo: {
      imgUrl: null,
      loading: false,
    },
  });

  const [defaultCurrency, setDefaultCurrency] = useState(null);

  const localeListData = useMemo(
    () =>
      Object.keys(locales)?.map((key) => ({
        label: locales?.[key],
        value: key,
      })),
    [locales],
  );

  const languageListData = useMemo(
    () =>
      languageList?.map((lan: any) => ({
        label: lan.name,
        value: lan.languageId?.toString(),
      })),
    [languageList],
  );

  useEffect(() => {
    getFormValues();
    fetchLocalesRequest.run();
    // @ts-ignore
    getLanguageList.run({
      dataStatus: 'ONLINE',
    });
  }, []);

  const getFormValues = async () => {
    const result = await infoConfigsRequest.runAsync() as any;
    if (result) {
      formRes.setFieldsValue(result);

      setDefaultCurrency(result.defaultCurrency);
      setImgData({
        icon: {
          imgUrl: result.favIcon,
          loading: false,
        },
        logo: {
          imgUrl: result.logo,
          loading: false,
        },
      });
    }
  };

  const handleSubmit = async () => {
    formRes.validateFields().then(async (values) => {
      const result = await saveInfoConfigRequest.runAsync({
        ...values,
        defaultCurrency,
        defaultLanguage: Number(values.defaultLanguage),
      });
      if (result) {
        message.success(t('common.error_message.save.success'));
      }
    });
  };

  const handleImgChange = useMemoizedFn((type: string) => (info: any) => {
    if (info.file.status === 'uploading') {
      setImgData({
        ...imgData,
        [type]: {
          ...imgData[type],
          loading: true,
        },
      });
      return;
    }
    if (info.file.status === 'done') {
      const response = info.file.response || {};
      if (response.code === '10000') {
        setImgData({
          ...imgData,
          [type]: {
            imgUrl: 'data:image/png;base64,' + response.data,
            loading: false,
          },
        });
      }
    }
  });

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('请上传jpg或png格式文件!');
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('上传图片大于1MB!');
    }
    return isJpgOrPng;
  };

  const handleFormChange = useMemoizedFn((changedValues) => {
    const changeKey = Object.keys(changedValues)[0];
    const changeValue = changedValues[changeKey];

    if (changeKey === 'logo' || changeKey === 'favIcon') {
      if (changeValue?.file.status === 'done') {
        const response = changeValue?.file.response || {};
        if (response.code === '10000') {
          formRes.setFieldsValue({
            [changeKey]: 'data:image/png;base64,' + response.data,
          });
        }
      }
    }
  });

  const renderFormContent = () => {
    const uploadButton = (type: string) => (
      <div>
        {imgData[type]?.loading ? <SyncOutlined spin /> : <PlusOutlined />}
        <div className="polaris-upload-text">Upload</div>
      </div>
    );

    return (
      <div className={styles.formContent}>
        <Form form={formRes} preserve={false} {...formItemLayout} onValuesChange={handleFormChange}>
          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                name="orgName"
                label={t('configuration.form.input.name.label')}
                rules={[
                  { required: true, message: t('configuration.form.input.name.placeholder') },
                ]}
              >
                <Input placeholder={t('configuration.form.input.name.error_message')} />
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.input.name.info')}</span>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                label={t('configuration.form.input.code.label')}
                name="orgCode"
                rules={[
                  { required: true, message: t('configuration.form.input.code.error_message') },
                ]}
              >
                <Input placeholder={t('configuration.form.input.code.placeholder')} />
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.input.code.info')}</span>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                name="defaultLanguage"
                label={t('configuration.form.select.language.label')}
                rules={[
                  {
                    required: true,
                    message: t('configuration.form.select.language.error_message'),
                  },
                ]}
              >
                <Select
                  options={languageListData}
                  placeholder={t('configuration.form.select.language.placeholder')}
                  onChange={(e) => {
                    const currentLan = _.find(languageList, (lan: any) => lan.languageId == e);

                    if (currentLan) {
                      setDefaultCurrency(currentLan?.currencyId);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.select.language.info')}</span>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                label={t('configuration.form.select.timezone.label')}
                name="defaultLocale"
                rules={[
                  {
                    required: true,
                    message: t('configuration.form.select.timezone.error_message'),
                  },
                ]}
              >
                <Select
                  options={localeListData}
                  placeholder={t('configuration.form.select.timezone.placeholder')}
                />
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.select.timezone.info')}</span>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                name="favIcon"
                label={t('configuration.form.image.favicon.label')}
                rules={[
                  { required: true, message: t('configuration.form.image.favicon.error_message') },
                ]}
              >
                <Upload
                  name="image"
                  disabled={!uploadAuth}
                  headers={getAuthHeader()}
                  showUploadList={false}
                  listType="picture-card"
                  className={styles.upload}
                  beforeUpload={beforeUpload}
                  onChange={handleImgChange('icon')}
                  action={UPLOAD_IMAGE_PATH}
                >
                  {imgData['icon']?.imgUrl ? (
                    <img src={imgData['icon']?.imgUrl} alt="avatar" style={{ width: '100%' }} />
                  ) : (
                    uploadButton('icon')
                  )}
                </Upload>
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.image.favicon.info')}</span>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                name="logo"
                label={t('configuration.form.image.logo.label')}
                rules={[
                  { required: true, message: t('configuration.form.image.logo.error_message') },
                ]}
              >
                <Upload
                  name="image"
                  disabled={!uploadAuth}
                  headers={getAuthHeader()}
                  showUploadList={false}
                  listType="picture-card"
                  beforeUpload={beforeUpload}
                  className={styles.logoUpload}
                  onChange={handleImgChange('logo')}
                  action={UPLOAD_IMAGE_PATH}
                >
                  {imgData['logo']?.imgUrl ? (
                    <img src={imgData['logo']?.imgUrl} alt="avatar" style={{ width: '100%' }} />
                  ) : (
                    uploadButton('logo')
                  )}
                </Upload>
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.image.logo.info')}</span>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  return (
    <div className={styles.infoConfigDiv}>
      <h2>{t('configuration.form.tab.org.title')}</h2>
      <span>{t('configuration.form.tab.org.subtitle')}</span>
      <Divider />

      <PermissionSection itemKey="SysConfig-saveOrganizationConfig">
        <Button
          type="primary"
          onClick={handleSubmit}
          className={styles.operateButton}
          loading={saveInfoConfigRequest.loading}
          disabled={infoConfigsRequest.loading}
        >
          {t('common.button.save')}
        </Button>
      </PermissionSection>

      <Spin spinning={infoConfigsRequest.loading || saveInfoConfigRequest.loading}>
        {renderFormContent()}
      </Spin>
    </div>
  );
};

export default InfoConfig;

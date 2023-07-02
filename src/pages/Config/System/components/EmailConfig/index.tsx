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
import { useModel } from 'umi';

import { Row, Col, Form, Spin, Input, Button, Divider, InputNumber } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import PermissionSection from '@/components/PermissionSection';

import styles from './style.less';

const formItemLayout = {
  labelCol: { flex: '224px' },
  wrapperCol: { flex: 'auto' },
};

const EmailConfig: React.FC = () => {
  const [formRes] = Form.useForm();
  const { t } = useI18n(['configuration', 'common']);

  const [saveLoading, setSaveLoading] = useState(false);
  const [isPswChange, setIsPswChange] = useState(false);

  const { saveEmailConfig, emailConfigsRequest } = useModel('Setting');

  useEffect(() => {
    getFormValues();
  }, []);

  const getFormValues = async () => {
    const values = await emailConfigsRequest.runAsync() as any;

    if (values) {
      formRes.setFieldsValue({
        ...values,
        password: values.password?.slice(0, 6),
        userName: values.userName,
      });
    }
  };

  const handleSubmit = () => {
    formRes.validateFields().then((values) => {
      setSaveLoading(true);
      const onSuccess = () => {
        setIsPswChange(false);
        setSaveLoading(false);
      };
      const onFail = () => {
        setIsPswChange(false);
        setSaveLoading(false);
      };

      values = {
        ...values,
        password: isPswChange ? values.password : null,
      };

      saveEmailConfig(values, onSuccess, onFail);
    });
  };

  const renderFormContent = () => {
    return (
      <div className={styles.formContent}>
        <Form form={formRes} preserve={false} {...formItemLayout}>
          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                name="sender"
                label={t('configuration.form.input.sender.label')}
                rules={[
                  {
                    required: true,
                    message: t('configuration.form.input.sender.error_message'),
                  },
                ]}
              >
                <Input
                  maxLength={64}
                  placeholder={t('configuration.form.input.sender.placeholder')}
                />
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.input.sender.error_message')}</span>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                label={t('configuration.form.input.email.label')}
                name="emailAccount"
                rules={[
                  {
                    type: 'email',
                    message: t('configuration.form.input.email.error_message'),
                  },
                  {
                    required: true,
                    message: t('configuration.form.input.email.error_message'),
                  },
                ]}
              >
                <Input
                  maxLength={128}
                  placeholder={t('configuration.form.input.email.placeholder')}
                />
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.input.email.error_message')}</span>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                name="smtpServer"
                label={t('configuration.form.input.smtp.label')}
                rules={[
                  {
                    required: true,
                    message: t('configuration.form.input.smtp.error_message'),
                  },
                  {
                    pattern:
                      /^(?=^.{9,126}$)(http(s)?:\/\/)?(smtp\.)[a-zA-Z0-9][-a-zA-Z0-9]{1,60}(\.[a-zA-Z0-9][-a-zA-Z0-9]{2,60})$/,
                    message: t('configuration.form.input.smtp.error_message2'),
                  },
                ]}
              >
                <Input placeholder={t('configuration.form.input.smtp.placeholder')} />
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.input.smtp.error_message')}</span>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                name="smtpPort"
                label={t('configuration.form.input.port.label')}
                rules={[
                  { required: true, message: t('configuration.form.input.port.placeholder') },
                ]}
              >
                <InputNumber
                  min={1}
                  max={9999}
                  placeholder={t('configuration.form.input.port.placeholder')}
                  precision={0}
                />
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.input.port.error_message')}</span>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                name="userName"
                label={t('configuration.form.input.username.label')}
                rules={[
                  {
                    required: true,
                    message: t('configuration.form.input.username.error_message'),
                  },
                ]}
              >
                <Input
                  maxLength={64}
                  placeholder={t('configuration.form.input.username.placeholder')}
                />
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.input.username.error_message')}</span>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={13}>
              <Form.Item
                name="password"
                label={t('configuration.form.input.password.label')}
                rules={[
                  { required: true, message: t('configuration.form.input.password.placeholder') },
                ]}
              >
                <Input.Password
                  placeholder={t('configuration.form.input.password.placeholder')}
                  onChange={() => setIsPswChange(true)}
                />
              </Form.Item>
            </Col>
            <Col span={10} className={styles.message}>
              <span>{t('configuration.form.input.password.error_message')}</span>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  return (
    <div className={styles.emailConfigDiv}>
      <h2>{t('configuration.form.tab.email.title')}</h2>
      <span>{t('configuration.form.tab.email.subtitle')}</span>
      <Divider />

      <PermissionSection itemKey="SysConfig-saveEmailConfig">
        <Button
          type="primary"
          loading={saveLoading}
          onClick={handleSubmit}
          className={styles.operateButton}
          disabled={emailConfigsRequest.loading}
        >
          {t('common.button.save')}
        </Button>
      </PermissionSection>

      <Spin spinning={emailConfigsRequest.loading}>{renderFormContent()}</Spin>
    </div>
  );
};

export default EmailConfig;

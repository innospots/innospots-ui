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

import React, { useEffect } from 'react';
import { useModel } from 'umi';
import { Row, Col, Form, Input, Space, Button, Drawer, message, Typography } from 'antd';
import { randomString, getFormattedLocale } from '@/common/utils';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import FlagIcon from '@/components/Icons/FlagIcon';
import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

const { Title } = Typography;
const { TextArea } = Input;

interface Props {
  visible?: boolean;
  onCancel?: () => void;
  initValues?: null | any;
  onSuccess?: (result?: any) => void;
}

export type ModalProps = Props;

export const MODAL_NAME = 'TransModal';

const TransModal: React.FC = () => {
  const [formRes] = Form.useForm();
  const { t } = useI18n(['translation', 'common']);

  const { saveTransRequest, translationRequest, translationHeaderColumn } = useModel('I18n');

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const { visible, initValues = {} } = modalInfo;

  useEffect(() => {
    if (visible) {
      setInitValues();
    }
  }, [visible, initValues]);

  const setInitValues = () => {
    const values = {
      ...initValues.messages,
    };
    formRes.resetFields();
    formRes.setFieldsValue(values);
  };

  const handleFormSubmit = () => {
    formRes.validateFields().then((values) => {
      saveTranslationData({
        ...initValues,
        messages: {
          ...values,
        },
      });
    });
  };

  const saveTranslationData = async (values: any) => {
    try {
      let postData = { ...values };

      delete postData.key;
      const result = await saveTransRequest.runAsync(postData);

      if (result) {
        message.success(t('common.error_message.save.success'));
        modal.hide();
        translationRequest.run({
          ...DEFAULT_PAGINATION_SETTINGS,
          app: null,
          code: '',
          module: null,
        });
      }
    } catch (e) {}
  };

  return (
    <Drawer
      width={556}
      open={visible}
      title={t('translation.form.edit.title')}
      onClose={modal.hide}
      maskClosable={false}
      footer={
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={modal.hide} loading={saveTransRequest.loading}>
                {t('common.button.cancel')}
              </Button>
              <Button type="primary" loading={saveTransRequest.loading} onClick={handleFormSubmit}>
                {t('common.button.confirm')}
              </Button>
            </Space>
          </Col>
        </Row>
      }
    >
      <Row>
        <Col span={24}>
          <Title level={5}>{t('translation.form.app')}</Title>
          <span>{initValues.dictionary?.app}</span>
        </Col>
        <Col span={24} style={{ marginTop: 24 }}>
          <Title level={5}>{t('translation.form.module')}</Title>
          <span>{initValues.dictionary?.module}</span>
        </Col>
        <Col span={24} style={{ marginTop: 24 }}>
          <Title level={5}>{t('translation.form.resource')}</Title>
          <span>{initValues.dictionary?.code}</span>
        </Col>

        <Col span={24} style={{ marginTop: 48 }}>
          <Form form={formRes} layout="vertical" name="form_in_modal">
            {translationHeaderColumn?.map((column: any) => {
              const [, , , country] = getFormattedLocale(column.locale);
              return (
                <Form.Item
                  key={`${column.locale}${randomString(2)}`}
                  name={column.locale}
                  label={
                    <Row align="middle">
                      <Col flex="18px" style={{ marginRight: 8 }}>
                        <FlagIcon code={country} />
                      </Col>
                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                        <span>{column.name || '-'}</span>
                        <span>
                          {column.defaultLan ? `(${t('translation.main.default')})` : null}
                        </span>
                      </Col>
                    </Row>
                  }
                >
                  <TextArea maxLength={512} rows={4} placeholder={t('common.input.placeholder')} />
                </Form.Item>
              );
            })}
          </Form>
        </Col>
      </Row>
    </Drawer>
  );
};

export default TransModal;

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

import { Form, Input, Switch, message } from 'antd';

import NiceModal, { ModalType, NiceModalProps } from '@/components/Nice/NiceModal';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

export type ModalProps = {} & NiceModalProps;

export const MODAL_NAME = 'CurrencyModal';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const CurrencyModal: React.FC<ModalProps> = () => {
  const [formRes] = Form.useForm();
  const { t } = useI18n(['currency', 'common']);

  const { saveCurrencyRequest, fetchCurrencyDataRequest } = useModel('Currency', (model) => ({
    saveCurrencyRequest: model.saveCurrencyRequest,
    fetchCurrencyDataRequest: model.fetchCurrencyDataRequest,
  }));

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const { visible, modalType, initValues } = modalInfo;

  useEffect(() => {
    if (visible) {
      setInitValues();
    }
  }, [visible, modalType, initValues]);

  const setInitValues = () => {
    const values = {
      ...initValues,
      status: initValues.status === 'ONLINE',
    };
    formRes.setFieldsValue(values);
  };

  const handleFormSubmit = () => {
    formRes.validateFields().then((values) => {
      saveCurrencyData(values);
    });
  };

  const saveCurrencyData = async (values: any) => {
    try {
      let postData = values;

      if (modalType === 'edit' && initValues) {
        postData = {
          ...initValues,
          ...postData,
        };
      }

      postData = {
        ...postData,
        status: postData.status ? 'ONLINE' : 'OFFLINE',
      };

      const result = await saveCurrencyRequest.runAsync(modalType as ModalType, postData);

      if (result) {
        message.success(t('common.error_message.save.success'));
        modal.hide();

        fetchCurrencyDataRequest.run({
          ...DEFAULT_PAGINATION_SETTINGS,
        });
      }
    } catch (e) {}
  };

  const renderForm = () => {
    return (
      <Form form={formRes} preserve={false} {...formItemLayout}>
        <Form.Item
          name="name"
          label={t('currency.form.name.label')}
          rules={[
            {
              required: true,
              message: t('currency.form.name.error_message'),
            },
            {
              pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]{1,16}$/,
              message: t('currency.form.name.error_message2'),
            },
          ]}
        >
          <Input placeholder={t('currency.form.name.placeholder')} />
        </Form.Item>
        <Form.Item
          name="code"
          label={t('currency.form.code.label')}
          rules={[
            {
              required: true,
              message: t('currency.form.code.error_message'),
            },
            {
              pattern: /^.{1,16}$/,
              message: t('currency.form.code.error_message2'),
            },
          ]}
        >
          <Input placeholder={t('currency.form.code.placeholder')} />
        </Form.Item>
        <Form.Item name="leftSign" label={t('currency.form.left_sign.label')}>
          <Input placeholder={t('currency.form.left_sign.placeholder')} />
        </Form.Item>
        <Form.Item name="rightSign" label={t('currency.form.right_sign.label')}>
          <Input placeholder={t('currency.form.right_sign.placeholder')} />
        </Form.Item>
        <Form.Item
          name="decimalDigits"
          label={t('currency.form.decimal.label')}
          rules={[{ required: true, message: t('currency.form.decimal.error_message') }]}
        >
          <Input placeholder={t('currency.form.decimal.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('currency.form.status.label')}
          name="status"
          valuePropName="checked"
          rules={[{ required: true }]}
        >
          <Switch
            checkedChildren={t('common.text.activate')}
            unCheckedChildren={t('common.text.deactivate')}
          />
        </Form.Item>
      </Form>
    );
  };

  return (
    <NiceModal
      width={716}
      destroyOnClose
      visible={visible}
      title={t(`currency.form.${modalType}.title`)}
      okButtonProps={{
        loading: saveCurrencyRequest.loading,
        onClick: handleFormSubmit,
      }}
      onCancel={modal.hide}
    >
      {renderForm()}
    </NiceModal>
  );
};

export default CurrencyModal;

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

import { Form, Input, message } from 'antd';
import { useModel } from 'umi';
import JSEncrypt from 'jsencrypt';

import NiceModal from '@/components/Nice/NiceModal';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

export const MODAL_NAME = 'UpdatePasswordModal';

const UpdatePasswordModal: React.FC = () => {
  const [form] = Form.useForm();

  const { publicKey, publicKeyRequest, changePasswordRequest } = useModel('User');

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const { visible, initValues } = modalInfo;

  useEffect(() => {
    if (visible && !publicKey) {
      publicKeyRequest();
    }
  }, [visible]);

  const { t } = useI18n(['account', 'common']);

  const encrypt = (content: string) => {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    return encrypt.encrypt(content);
  };

  const doChangePassword = async (data: any) => {
    const result = await changePasswordRequest.runAsync(data);
    if (result) {
      message.success(t('common.notification.success.title'));
      modal.hide();
    }
  };

  const onFormSubmit = () => {
    form.validateFields().then((values) => {
      doChangePassword({
        userId: initValues.userId,
        // oldPassword: encrypt(values.oldPassword),
        newPassword: encrypt(values.newPassword),
      });
    });
  };

  return (
    <NiceModal
      destroyOnClose
      title={t('account.form.edit_password_title')}
      visible={visible}
      okButtonProps={{
        loading: changePasswordRequest.loading,
        onClick: onFormSubmit,
      }}
      onCancel={modal.hide}
    >
      <Form
        form={form}
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 14,
        }}
      >
        {/*<Form.Item*/}
        {/*  name="oldPassword"*/}
        {/*  label={t('account.form.input.old_password.label')}*/}
        {/*  rules={[*/}
        {/*    {*/}
        {/*      required: true,*/}
        {/*      min: 6,*/}
        {/*      message: t('account.form.input.new_password.error_message'),*/}
        {/*    },*/}
        {/*  ]}*/}
        {/*>*/}
        {/*  <Input.Password placeholder={t('account.form.input.old_password.placeholder')} />*/}
        {/*</Form.Item>*/}
        <Form.Item
          name="newPassword"
          label={t('account.form.input.new_password.label')}
          rules={[
            {
              required: true,
              min: 6,
              message: t('account.form.input.new_password.error_message'),
            },
          ]}
        >
          <Input.Password placeholder={t('account.form.input.new_password.placeholder')} />
        </Form.Item>
        <Form.Item
          name="newPassword2"
          dependencies={['newPassword']}
          label={t('account.form.input.confirm.label')}
          rules={[
            {
              required: true,
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('account.form.input.confirm.error_message')));
              },
            }),
          ]}
        >
          <Input.Password placeholder={t('account.form.input.confirm.placeholder')} />
        </Form.Item>
      </Form>
    </NiceModal>
  );
};

export default UpdatePasswordModal;

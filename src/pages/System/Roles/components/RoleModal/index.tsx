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

import { Form, Input, message, Switch } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import NiceModal from '@/components/Nice/NiceModal';

export const MODAL_NAME = 'RoleModal';

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const RoleModal: React.FC = () => {
  const [formRes] = Form.useForm();
  const { saveRoleRequest } = useModel('Role', (model) => ({
    saveRoleRequest: model.saveRoleRequest,
  }));

  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, modalType, initValues } = modalInfo;
  const { t } = useI18n(['role', 'common']);

  useEffect(() => {
    if (visible) {
      if (modalType === 'edit' && initValues) {
        formRes.setFieldsValue(initValues);
      }
    }
  }, [visible, modalType, initValues]);

  const handleFormSubmit = () => {
    formRes.validateFields().then((values) => {
      saveRoleData({
        ...initValues,
        ...values,
      });
    });
  };

  const saveRoleData = async (values: any) => {
    try {
      const result = await saveRoleRequest.runAsync(modalType, values);
      if (result) {
        message.success(t('common.error_message.save.success'));
        modal.hide();
      }
    } catch (e) {}
  };

  const renderForm = () => {
    return (
      <Form form={formRes} preserve={false} {...formItemLayout} style={{ marginBottom: -24 }}>
        <Form.Item
          name="roleCode"
          label={t('role.form.role_code.label')}
          rules={[{ required: true, message: t('role.form.role_code.error_message') }]}
        >
          <Input maxLength={10} placeholder={t('role.form.role_code.placeholder')} />
        </Form.Item>
        <Form.Item
          name="roleName"
          label={t('role.form.role_name.label')}
          rules={[{ required: true, message: t('role.form.role_name.error_message') }]}
        >
          <Input maxLength={10} placeholder={t('role.form.role_name.placeholder')} />
        </Form.Item>
        {/*<Form.Item label={t('role.form.role_admin.label')} name="admin" valuePropName="checked">*/}
        {/*  <Switch />*/}
        {/*</Form.Item>*/}
      </Form>
    );
  };

  return (
    <NiceModal
      simple
      width={488}
      visible={visible}
      destroyOnClose
      title={t(`role.form.${modalType}.title`)}
      okButtonProps={{
        loading: saveRoleRequest.loading,
        onClick: handleFormSubmit,
      }}
      onCancel={modal.hide}
    >
      {renderForm()}
    </NiceModal>
  );
};

export default RoleModal;

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

import { Form, Input, message } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import { NAME_VALID_REGEX } from '@/common/constants';

import NiceModal from '@/components/Nice/NiceModal';

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

export const MODAL_NAME = 'AppCategoryModal';

const AppCategoryModal: React.FC = () => {
  const [formRes] = Form.useForm();
  const { createRequest, updateRequest } = useModel('Page', (model) => ({
    createRequest: model.createCategoryRequest,
    updateRequest: model.updateCategoryRequest,
  }));

  const { t } = useI18n(['common']);

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const { visible, modalType, initValues } = modalInfo;

  useEffect(() => {
    if (visible) {
      if (modalType === 'edit' && initValues) {
        formRes.setFieldsValue(initValues);
      }
    }
  }, [visible, modalType, initValues]);

  const handleFormSubmit = () => {
    formRes.validateFields().then((values) => {
      savePageCategory(values.categoryName);
    });
  };

  const savePageCategory = async (categoryName: string) => {
    try {
      let result;

      if (modalType === 'add') {
        result = await createRequest.runAsync(categoryName);
      } else if (initValues) {
        result = await updateRequest.runAsync(initValues.categoryId, categoryName);
      }

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
          label={t('common.category.name.label')}
          name="categoryName"
          rules={[
            {
              required: true,
              pattern: NAME_VALID_REGEX,
              message: t('common.category.name.message'),
            },
          ]}
        >
          <Input maxLength={16} placeholder={t('common.category.name.placeholder')} />
        </Form.Item>
      </Form>
    );
  };

  return (
    <NiceModal
      simple
      width={488}
      destroyOnClose
      visible={visible}
      title={t(`common.category.${modalType}.title`)}
      okButtonProps={{
        loading: createRequest.loading || updateRequest.loading,
        onClick: handleFormSubmit,
      }}
      onCancel={() => modal.hide()}
    >
      {renderForm()}
    </NiceModal>
  );
};

export default AppCategoryModal;

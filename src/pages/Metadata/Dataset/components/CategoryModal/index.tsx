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

import NiceModal, { NiceModalProps, NiceModalFC } from '@/components/Nice/NiceModal';

type Props = {} & NiceModalProps;

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

export const MODAL_NAME = 'DatasetCategoryModal';

const CategoryModal: React.FC<Props> & NiceModalFC = ({ onSuccess, ...rest }) => {
  const [formRes] = Form.useForm();
  const { updateRequest, createRequest } = useModel('Dataset', (model) => ({
    updateRequest: model.updateCategoryRequest,
    createRequest: model.createCategoryRequest,
  }));

  const { t } = useI18n(['dataset', 'common']);

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
      saveCategory({
        ...initValues,
        ...values,
      });
    });
  };

  const saveCategory = async (values: any) => {
    try {
      let result;

      if (modalType === 'add') {
        result = await createRequest.runAsync(values.categoryName);
      } else {
        result = await updateRequest.runAsync(values.categoryId, values.categoryName);
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
      visible={visible}
      title={t('dataset.category.title')}
      destroyOnClose
      okButtonProps={{
        loading: createRequest.loading || updateRequest.loading,
        onClick: handleFormSubmit,
      }}
      onCancel={() => modal.hide()}
      {...rest}
    >
      {renderForm()}
    </NiceModal>
  );
};

export default CategoryModal;

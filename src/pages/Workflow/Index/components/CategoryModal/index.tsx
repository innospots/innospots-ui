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

import { NAME_PATTERN } from '@/common/constants';
import useModal from '@/common/hooks/useModal';

import useI18n from '@/common/hooks/useI18n';
import NiceModal from '@/components/Nice/NiceModal';

const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

export const MODAL_NAME = 'CategoryModal';

const CategoryModal: React.FC = () => {
    const [formRes] = Form.useForm();
    const { saveCategoryRequest } = useModel('Workflow', (model) => ({
        saveCategoryRequest: model.saveCategoryRequest,
    }));

    const [modal, modalInfo] = useModal(MODAL_NAME);

    const { visible, modalType, initValues } = modalInfo;

    const { t } = useI18n(['workflow', 'common']);

    useEffect(() => {
        if (visible) {
            if (modalType === 'edit' && initValues) {
                formRes.setFieldsValue(initValues);
            }
        }
    }, [visible, modalType, initValues]);

    const handleFormSubmit = () => {
        formRes.validateFields().then((values) => {
            saveCategoryData({
                ...initValues,
                ...values,
            });
        });
    };

    const saveCategoryData = async (values: any) => {
        try {
            const result = await saveCategoryRequest.runAsync(modalType, values);
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
                    name="categoryName"
                    label={t('common.category.name.label')}
                    rules={[
                        {
                            required: true,
                            message: t('common.category.name.message'),
                        },
                        {
                            pattern: NAME_PATTERN,
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
            width={488}
            destroyOnClose
            visible={visible}
            title={<span style={{fontSize: 20}}>{t(`common.category.${modalType}.title`)}</span>}
            okButtonProps={{
                loading: saveCategoryRequest.loading,
                onClick: handleFormSubmit,
            }}
            onCancel={modal.hide}
        >
            {renderForm()}
        </NiceModal>
    );
};

export default CategoryModal;

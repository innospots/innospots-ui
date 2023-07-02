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
import { Row, Col, Form, Input, Radio, Table, Select } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import _ from 'lodash';
import { randomString } from '@/common/utils';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import type { NiceModalProps } from '@/components/Nice/NiceModal';
import NiceModal from '@/components/Nice/NiceModal';

import { AUTH_OPTIONS, GET_METHOD_OPTIONS } from '../../config';

import styles from './index.less';

const FormItem = Form.Item;
const formCols = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 16,
    },
};

export type ResponseFieldItem = {
    key?: string;
    name?: string;
    value?: any;
};

type FormValues = {
    path?: string;
    authType?: string;
    requestType?: string;
    responseMode?: string;
    responseCode?: string;
    authBody?: {
        username?: string;
        password?: string;
    };
    responseFields?: ResponseFieldItem[];
};

const defaultValues: FormValues = {
    authType: 'NONE',
    requestType: 'GET',
    responseMode: 'ACK',
    responseCode: '200',
};

export const getDefaultField = (o?: ResponseFieldItem): ResponseFieldItem => ({
    key: randomString(4),
    ...o,
});

export const FormResponseFields: React.FC<{
    value?: ResponseFieldItem[];
    onChange?: (value?: ResponseFieldItem[]) => void;
}> = (props) => {
    const ps = {
        ...props,
    };

    const { t } = useI18n(['workflow', 'common']);

    if (ps.value === undefined) {
        delete ps.value;
    }

    const [responseFields, setResponseFields] = useControllableValue<ResponseFieldItem[]>(ps, {
        defaultValue: [getDefaultField()],
    });

    const updateResponseParam = (index, key, value) => {
        const list: ResponseFieldItem[] = _.cloneDeep(responseFields) || [];
        list[index][key] = value;
        setResponseFields([...list]);
    };

    const addResponseField = () => {
        const list: ResponseFieldItem[] = _.cloneDeep(responseFields) || [];
        list.push(getDefaultField());
        setResponseFields([...list]);
    };

    const columns = [
        {
            title: t('workflow.webhook.form.response.column.field'),
            dataIndex: 'code',
            render: (text, record, index) => (
                <Input
                    size="small"
                    value={text}
                    style={{ width: '100%' }}
                    placeholder={t('common.input.placeholder')}
                    onChange={(event) => updateResponseParam(index, 'code', event.target.value)}
                />
            ),
        },
        {
            title: t('workflow.webhook.form.response.column.value'),
            dataIndex: 'value',
            render: (text, record, index) => (
                <Input
                    size="small"
                    value={text}
                    style={{ width: '100%' }}
                    placeholder={t('common.input.placeholder')}
                    onChange={(event) => updateResponseParam(index, 'value', event.target.value)}
                />
            ),
        },
        {
            title: '',
            width: 40,
            align: 'center',
            dataIndex: 'key',
            render: (text, record, index) => (
                <MinusCircleOutlined
                    style={{ cursor: 'pointer', color: '#666' }}
                    onClick={() => {
                        const list: ResponseFieldItem[] = _.cloneDeep(responseFields);
                        list.splice(index, 1);
                        setResponseFields(list);
                    }}
                />
            ),
        },
    ];

    return (
        <div className={styles.responseFields}>
            <Row justify="space-between" style={{ marginBottom: 4 }}>
                <Col>
                    <div style={{ lineHeight: '28px' }}>
                        <span className="required-marker">*</span>
                        {t('workflow.webhook.form.response.field.label')}:
                    </div>
                </Col>
                <Col>
                    <div className="cur-btn" onClick={addResponseField}>
                        <PlusOutlined style={{ fontSize: 12 }} />
                        <span style={{ paddingLeft: 2 }}>{t('common.button.add')}</span>
                    </div>
                </Col>
            </Row>
            <Table
                size="small"
                scroll={{
                    y: 320,
                }}
                columns={columns}
                pagination={false}
                dataSource={responseFields}
            />
        </div>
    );
};

export const MODAL_NAME = 'WebhookConfigModal';

const ConfigModal: React.FC<NiceModalProps> = (props) => {
    const { onSuccess } = props;
    const [formRef] = Form.useForm();
    const [formValues, setFormValues] = useState<FormValues>({});

    const { t } = useI18n(['workflow', 'common']);

    const [modal, modalInfo] = useModal(MODAL_NAME);

    const { visible, modalType, initValues } = modalInfo;

    useEffect(() => {
        if (visible) {
            let curFormValues = {
                ...defaultValues,
            };

            if (initValues) {
                curFormValues = {
                    ...initValues,
                };

                if (curFormValues.responseFields) {
                    curFormValues.responseFields = _.map(
                        curFormValues.responseFields,
                        (item: ResponseFieldItem) => getDefaultField(item),
                    );
                }
            }

            setFormValues(curFormValues);
            formRef.resetFields();
            formRef.setFieldsValue(curFormValues);
        }
    }, [visible]);

    const saveWebhookData = (formValues) => {
        onSuccess?.({
            ...initValues,
            ...formValues,
        });
    };

    const handleFormChange = (changedValues, allValues) => {
        setFormValues({
            ...allValues,
        });
    };

    const handleFormSubmit = () => {
        formRef
            .validateFields()
            .then((values) => {
                saveWebhookData(values);
                modal.hide();
            })
            .catch((err) => {
                console.info(err);
            });
    };

    const renderAuthItems = () => {
        const { authType } = formValues;

        if (authType === 'BASIC_AUTH') {
            return (
                <>
                    <FormItem
                        name={['authBody', 'username']}
                        label={t('workflow.webhook.form.input.username.label')}
                        rules={[{ required: true, message: 'Please input!' }]}
                    >
                        <Input placeholder={t('common.input.placeholder')} />
                    </FormItem>
                    <FormItem
                        required
                        name={['authBody', 'password']}
                        label={t('workflow.webhook.form.input.password.label')}
                        rules={[{ required: true, message: 'Please input!' }]}
                    >
                        <Input.Password placeholder={t('common.input.placeholder')} />
                    </FormItem>
                </>
            );
        } else if (authType === 'BEARER_AUTH') {
            return (
                <FormItem
                    name={['authBody', 'token']}
                    label="Token"
                    rules={[{ required: true, message: 'Please input!' }]}
                >
                    <Input placeholder={t('common.input.placeholder')} />
                </FormItem>
            );
        }

        return null;
    };

    const renderConfigForm = () => {
        return (
            <Form form={formRef} {...formCols} onValuesChange={handleFormChange}>
                <Row>
                    <Col span={12}>
                        <FormItem
                            name="apiName"
                            label={t('workflow.webhook.form.input.name.label')}
                            rules={[
                                {
                                    required: true,
                                    message: t('workflow.webhook.form.input.name.error_message'),
                                },
                            ]}
                        >
                            <Input
                                placeholder={t('workflow.webhook.form.input.name.placeholder')}
                            />
                        </FormItem>
                        <FormItem
                            name="path"
                            label={t('workflow.webhook.form.input.path.label')}
                            help={`http://localhost/webhooks/${formValues.path || ''}`}
                            rules={[
                                {
                                    required: true,
                                    message: t('workflow.webhook.form.input.path.error_message'),
                                },
                            ]}
                        >
                            <Input
                                placeholder={t('workflow.webhook.form.input.path.placeholder')}
                            />
                        </FormItem>
                        <FormItem
                            name="requestType"
                            label={t('workflow.webhook.form.select.method.label')}
                            rules={[{ required: true }]}
                        >
                            <Select
                                options={GET_METHOD_OPTIONS}
                                placeholder={t('workflow.webhook.form.select.method.placeholder')}
                            />
                        </FormItem>
                        <FormItem
                            name="authType"
                            label={t('workflow.webhook.form.select.auth.label')}
                            rules={[{ required: true }]}
                        >
                            <Select
                                options={AUTH_OPTIONS}
                                placeholder={t('common.select.placeholder')}
                            />
                        </FormItem>
                        {renderAuthItems()}
                    </Col>
                    <Col span={12}>
                        <FormItem
                            name="responseMode"
                            label={t('workflow.webhook.form.radio.respond.label')}
                            rules={[{ required: true }]}
                        >
                            <Radio.Group>
                                <Radio value="ACK">
                                    {t('workflow.webhook.form.radio.respond.immediately')}
                                </Radio>
                                <Radio value="RESULT">
                                    {t('workflow.webhook.form.radio.respond.result')}
                                </Radio>
                            </Radio.Group>
                        </FormItem>
                        <FormItem
                            name="responseCode"
                            label={t('workflow.webhook.form.input.response_code.label')}
                            rules={[
                                {
                                    required: true,
                                    message: t(
                                        'workflow.webhook.form.input.response_code.error_message',
                                    ),
                                },
                            ]}
                        >
                            <Input placeholder={t('common.input.placeholder')} />
                        </FormItem>
                        {formValues.responseMode === 'ACK' ? (
                            <FormItem
                                noStyle
                                key="responseFields"
                                name="responseFields"
                                label={t('workflow.webhook.form.response.field.label')}
                                labelCol={{
                                    span: 24,
                                }}
                                wrapperCol={{
                                    span: 24,
                                }}
                            >
                                <FormResponseFields />
                            </FormItem>
                        ) : (
                            <FormItem
                                key="responseData"
                                name="responseData"
                                label={t('workflow.webhook.form.radio.response_data_type.label')}
                                rules={[{ required: true, message: 'Please input!' }]}
                            >
                                <Radio.Group>
                                    <Row className={styles.requestData} gutter={[16, 0]}>
                                        <Col span={12}>
                                            <div>
                                                <Radio value="ALL">
                                                    {t(
                                                        'workflow.webhook.form.radio.response_data.all_data',
                                                    )}
                                                </Radio>
                                            </div>
                                            <div className={styles.rdDesc}>
                                                {t(
                                                    'workflow.webhook.form.radio.response_data.all_data.info',
                                                )}
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div>
                                                <Radio value="FIRST_ITEM">
                                                    {t(
                                                        'workflow.webhook.form.radio.response_data.first_item',
                                                    )}
                                                </Radio>
                                            </div>
                                            <div className={styles.rdDesc}>
                                                {t(
                                                    'workflow.webhook.form.radio.response_data.first_item.info',
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                </Radio.Group>
                            </FormItem>
                        )}
                    </Col>
                </Row>
            </Form>
        );
    };

    return (
        <NiceModal
            width={924}
            visible={visible}
            title={t(`workflow.webhook.title`)}
            onOk={handleFormSubmit}
            onCancel={modal.hide}
        >
            <div style={{ minHeight: 380 }}>{renderConfigForm()}</div>
        </NiceModal>
    );
};

export default ConfigModal;

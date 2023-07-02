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

import React, { useContext, useEffect } from 'react';

import _ from 'lodash';
import { Row, Col, Form, Input, Modal, Select, Divider } from 'antd';

import Calculator from '@/components/Calculator/index';

import useI18n from '@/common/hooks/useI18n';
import { VARIABLE_TYPES2 } from '@/common/constants';

import CurContext from '../../../../common/context';

import styles from './index.less';

let curComputeItems;

const VariableModal = ({ initValues, externalFields, onSubmit, visible, ...rest }) => {
    const [form] = Form.useForm();
    const { inputFields } = useContext(CurContext);

    const { t } = useI18n(['workflow', 'common']);

    useEffect(() => {
        if (visible) {
            if (initValues) {
                form.setFieldsValue(_.pick(initValues, ['name', 'code', 'valueType']));
            } else {
                form.resetFields();
            }
        }
    }, [visible]);

    const handleModalSubmit = () => {
        form.validateFields().then((values) => {
            const submitData = {
                ...values,
                computeItems: curComputeItems,
            };

            if (_.isFunction(onSubmit)) {
                onSubmit(submitData);
            }
        });
    };

    const handleCalcChange = (resultList) => {
        curComputeItems = resultList;
    };

    const getBaseInfoForm = () => {
        return (
            <Form form={form}>
                <Row wrap gutter={24} className={styles.baseForm}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label={t('workflow.derived_variables.input.name.label')}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input placeholder={t('common.input.placeholder')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="code"
                            label={t('workflow.derived_variables.input.code.label')}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input placeholder={t('common.input.placeholder')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="valueType"
                            label={t('workflow.derived_variables.input.data_type.label')}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Select placeholder={t('common.select.placeholder')}>
                                {_.map(VARIABLE_TYPES2, (value) => (
                                    <Select.Option key={value} value={value}>
                                        {value}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        );
    };

    const getRuleForm = () => {
        const expression = (initValues || {}).computeItems || [];

        return (
            <div className={styles.ruleForm}>
                <div>{t('workflow.derived_variables.input.expression.label')}</div>
                <Divider />

                <div>
                    {visible && (
                        <Calculator
                            fields={inputFields}
                            externalFields={externalFields}
                            defaultValues={{
                                expression,
                            }}
                            onChange={handleCalcChange}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <Modal
            width={840}
            open={visible}
            title={t('workflow.derived_variables.title')}
            maskClosable={false}
            {...rest}
            style={{top: 20}}
            onOk={handleModalSubmit}
        >
            {getBaseInfoForm()}
            {getRuleForm()}
        </Modal>
    );
};

export default React.memo(VariableModal);

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
import { history, useModel } from 'umi';
import _ from 'lodash';

import { Row, Col, Form, Input, Select, Button, PageHeader } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

const Header = ({ detail, saveButton, publishButton, onClick }) => {
    const [baseForm] = Form.useForm();
    const { t } = useI18n(['workflow', 'common']);
    const { categoryOptions, fetchCategoriesRequest } = useModel('Workflow');

    useEffect(() => {
        fetchCategoriesRequest.run();
    }, []);

    useEffect(() => {
        if (detail?.workflowInstanceId) {
            baseForm.setFieldsValue(_.pick(detail, ['name', 'categoryId']));
        }
    }, [detail?.workflowInstanceId, detail?.name, detail?.categoryId]);

    const handleClick = (type) => () => {
        baseForm.validateFields().then((values) => {
            onClick && onClick(type, values);
        });
    };

    const pageBack = () => {
        history.replace('/workflow/index');
    };

    const renderBaseForm = () => {
        return (
            <Form layout="inline" form={baseForm}>
                <Form.Item label={t('workflow.form.name.label')} name="name">
                    <Input
                        placeholder={t('workflow.form.name.placeholder')}
                        style={{ width: 200 }}
                    />
                </Form.Item>
                <Form.Item label={t('workflow.category.linput.category.label')} name="categoryId">
                    <Select
                        style={{ width: 200 }}
                        options={categoryOptions}
                        placeholder={t('workflow.form.category.placeholder')}
                    />
                </Form.Item>
            </Form>
        );
    };

    return (
        <div className={styles.pageHeader}>
            <PageHeader ghost={false}>
                <div>
                    <Row justify="space-between" style={{ flex: 1 }}>
                        <Col span={16}>
                            <Row align="middle">
                                <Col flex="none">
                                    <div className={styles.backIcon} onClick={pageBack}>
                                        <ArrowLeftOutlined />
                                    </div>
                                </Col>
                                <Col flex="auto">{renderBaseForm()}</Col>
                            </Row>
                        </Col>
                        <Col>
                            <Row gutter={[10, 0]}>
                                <Col>
                                    <Button onClick={pageBack}>{t('common.button.cancel')}</Button>
                                </Col>
                                <Col>
                                    <Button {...saveButton} onClick={handleClick('save')}>
                                        {t('common.button.save')}
                                    </Button>
                                </Col>
                                <Col style={{ paddingRight: 20 }}>
                                    <Button
                                        type="primary"
                                        {...publishButton}
                                        onClick={handleClick('publish')}
                                    >
                                        {t('common.button.publish')}
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </PageHeader>
        </div>
    );
};

export default React.memo(Header);

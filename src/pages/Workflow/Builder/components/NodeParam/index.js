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

import React, { useEffect, useMemo, useContext } from 'react';
import { Row, Col, Form, Input, Switch, Divider } from 'antd';

import CurContext from '../../common/context';
import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

const { TextArea } = Input;

const NodeParam = () => {
    const { node, pageMode, onChange } = useContext(CurContext);
    const nodeData = node.data || {};
    const configData = nodeData.configData || {};
    const { t } = useI18n(['workflow', 'common']);

    const [form] = Form.useForm();
    const isEdit = pageMode === 'edit';

    const isShowFailureBranch = useMemo(() => {
        const config = configData.config || {};
        return config.failureBranch && nodeData.continueOnFail;
    }, [(configData.config || {}).failureBranch, nodeData.continueOnFail]);

    useEffect(() => {
        form.setFieldsValue(nodeData);
    }, [nodeData]);

    const handleValueChange = (changedValues) => {
        const values = {
            ...nodeData,
            ...changedValues,
        };
        if ('continueOnFail' in changedValues) {
            if (!changedValues.continueOnFail) {
                values.failureBranch = false;
            }
        }
        onChange(values, {
            overwrite: true,
        });
    };

    return (
        <div className={styles.params}>
            <Form
                form={form}
                layout="vertical"
                initialValues={nodeData}
                onValuesChange={handleValueChange}
            >
                <Form.Item name="description" label={t('workflow.builder.settings.input.desc')}>
                    <TextArea disabled={!isEdit} placeholder={t('common.input.placeholder')} />
                </Form.Item>
                <Form.Item
                    name="color"
                    label={t('workflow.builder.settings.colorpicker.icon_color')}
                >
                    <Input disabled={!isEdit} placeholder={t('common.input.placeholder')} />
                </Form.Item>
                <Divider />
                <Row align="middle" style={{ marginBottom: 20 }}>
                    <Col>{t('workflow.builder.settings.always_output_data')}：</Col>
                    <Col>
                        <Form.Item noStyle name="storeOutput" valuePropName="checked">
                            <Switch disabled={!isEdit} size="small" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row align="middle" style={{ marginBottom: 20 }}>
                    <Col>{t('workflow.builder.settings.retry_on_fail')}：</Col>
                    <Col>
                        <Form.Item noStyle name="retryOnFail" valuePropName="checked">
                            <Switch disabled={!isEdit} size="small" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row align="middle" style={{ marginBottom: 20 }}>
                    <Col>{t('workflow.builder.settings.continue_on_fail')}：</Col>
                    <Col>
                        <Form.Item noStyle name="continueOnFail" valuePropName="checked">
                            <Switch disabled={!isEdit} size="small" />
                        </Form.Item>
                    </Col>
                </Row>
                {isShowFailureBranch && (
                    <Row align="middle" style={{ marginBottom: 20 }}>
                        <Col>{t('workflow.builder.settings.failure_branch')}：</Col>
                        <Col>
                            <Form.Item noStyle name="failureBranch" valuePropName="checked">
                                <Switch disabled={!isEdit} size="small" />
                            </Form.Item>
                        </Col>
                    </Row>
                )}
            </Form>

            <div>
                {/*<p className={styles.title}>{t('workflow.builder.settings.colorpicker.icon_color')}</p>*/}
                {/*<Popover*/}
                {/*  content={*/}
                {/*    <div>*/}
                {/*      <BlockPicker triangle="hide" />*/}
                {/*    </div>*/}
                {/*  }*/}
                {/*  trigger="click"*/}
                {/*>*/}
                {/*  <Button block>*/}
                {/*    <div className={styles.colorPicker}>*/}
                {/*      <span*/}
                {/*        className={styles.colorBlock}*/}
                {/*        style={{backgroundColor:'red'}}*/}
                {/*      />*/}
                {/*      <span className={styles.value}>#1245FA</span>*/}
                {/*    </div>*/}
                {/*  </Button>*/}
                {/*</Popover>*/}
            </div>
        </div>
    );
};

export default NodeParam;

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

import React, { useMemo, useEffect, useContext } from 'react';
import { Form, Input } from 'antd';

import CurContext from '../../common/context';
import useI18n from '@/common/hooks/useI18n';

const NodeName = () => {
    const { nodeId, nodeData, onChange } = useContext(CurContext);
    const [form] = Form.useForm();
    const { t } = useI18n(['workflow', 'common']);

    useEffect(() => {
        form.setFieldsValue(nodeData);
    }, [nodeData.displayName]);

    const initialValues = useMemo(
        () => ({
            displayName: nodeData.displayName,
        }),
        [nodeData],
    );

    const handleValueChange = (changedValues) => {
        onChange(changedValues);
    };

    return (
        <div>
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onValuesChange={handleValueChange}
            >
                <Form.Item
                    label={t('workflow.builder.panel.nodes.title')}
                    name="displayName"
                    rules={[{ required: true }]}
                >
                    <Input placeholder={t('common.input.placeholder')} />
                </Form.Item>
                <Form.Item label="nodeKey">
                    <p>{nodeId}</p>
                </Form.Item>
            </Form>
        </div>
    );
};

export default NodeName;

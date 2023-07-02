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

import React, { useRef, useCallback } from 'react';
import { Row, Col, Modal } from 'antd';

import { PlusOutlined } from '@ant-design/icons';
import useI18n from '@/common/hooks/useI18n';
import RuleForm from '@/components/Rule/RuleForm';

import styles from './index.less';

let curRuleListData;

const RuleExtendConfig = ({ visible, treeData, initRules, onSubmit, ...rest }) => {
    const ruleFormRef = useRef(null);

    const { t } = useI18n(['workflow', 'common']);

    const handleRuleFormChange = useCallback((ruleListData) => {
        curRuleListData = ruleListData;
    }, []);

    const handleRuleSubmit = useCallback(() => {
        onSubmit && onSubmit(curRuleListData);
    }, []);

    const getRuleFrom = () => {
        return (
            <div className={styles.ruleForm}>
                <Row justify="space-between">
                    <Col>{t('workflow.conditions.rule')}：</Col>
                </Row>
                <div className={styles.ruleInner}>
                    <RuleForm
                        hideGroupBtn
                        ref={ruleFormRef}
                        treeData={treeData}
                        initRules={initRules}
                        onChange={handleRuleFormChange}
                    />
                </div>
                <div className="cur-btn" onClick={() => ruleFormRef.current.addGroup()}>
                    <PlusOutlined />
                    <span>{t('workflow.conditions.button.add_group')}</span>
                </div>
            </div>
        );
    };

    return (
        <Modal
            centered
            width={960}
            title={<span style={{ fontSize: 16 }}>{t('workflow.conditions.condition.edit')}</span>}
            open={visible}
            onOk={handleRuleSubmit}
            {...rest}
        >
            <div className={styles.extendRuleForm}>{getRuleFrom()}</div>
        </Modal>
    );
};

export default RuleExtendConfig;

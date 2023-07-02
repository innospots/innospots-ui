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

import React, {useContext, useMemo} from 'react';
import _ from 'lodash';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import { useControllableValue } from 'ahooks';
import { Row, Col } from 'antd';
import FormContext from '../FormContext';
import WebhookConfigModal, { MODAL_NAME } from './ConfigModal';

import type { FormItemProps } from '../types';

import styles from './index.less';

const Webhook: React.FC<FormItemProps> = ({ schema, ...props }) => {
    const { t } = useI18n(['workflow', 'common']);
    const { viewType } = useContext(FormContext);

    const [modal] = useModal(MODAL_NAME);

    const [curWebhook, setCurWebhook] = useControllableValue<any>(props, {
        defaultValue: {},
    });

    const isConfig = viewType === 'config';

    const handleConfigSuccess = (data) => {
        setCurWebhook(data);
    };

    const getWebhookModal = () => {
        if (!isConfig) return null;

        return <WebhookConfigModal onSuccess={handleConfigSuccess} />;
    };

    const getDetailView = useMemo(() => {
        const responseParams = _.map((curWebhook || {}).responseFields, (item) => item.code);

        return (
            <div>
              {
                isConfig && (
                  <Row justify="space-between">
                    {/*<Col>{t('workflow.webhook.preview.label')}：</Col>*/}
                    <Col />
                    <Col>
                      <span
                        className="cur-btn"
                        onClick={() =>
                          modal.show({
                            modalType: 'edit',
                            initValues: curWebhook,
                          })
                        }
                      >
                          {t('common.button.setting')}
                      </span>
                    </Col>
                  </Row>
                )
              }
                {curWebhook ? (
                    <div className={styles.detailWrap}>
                        <p className={styles.label}>
                            {t('workflow.webhook.form.input.path.label')}：
                        </p>
                        <p
                            className={styles.value}
                        >{`http://localhost/webhooks/${curWebhook.path}`}</p>
                        <p className={styles.label}>
                            {t('workflow.webhook.form.select.method.label')}：
                        </p>
                        <p className={styles.value}>{curWebhook.requestType || 'GET'}</p>
                        <p className={styles.label}>
                            {t('workflow.webhook.form.select.auth.label')}：
                        </p>
                        <p className={styles.value}>{curWebhook.authType}</p>
                        <p className={styles.label}>
                            {t('workflow.webhook.form.radio.respond.label')}：
                        </p>
                        <p className={styles.value}>{curWebhook.responseMode}</p>
                        <p className={styles.label}>
                            {t('workflow.webhook.form.input.response_code.label')}：
                        </p>
                        <p className={styles.value}>{curWebhook.responseCode}</p>
                        {curWebhook.responseMode === 'ACK' ? (
                            <>
                                <p className={styles.label}>
                                    {t('workflow.webhook.form.response.field.label')}：
                                </p>
                                <p className={styles.value}>{responseParams.join(', ')}</p>
                            </>
                        ) : (
                            <>
                                <p className={styles.label}>
                                    {t('workflow.webhook.form.radio.response_data_type.label')}：
                                </p>
                                <p className={styles.value}>{curWebhook.responseData}</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className={styles.detailWrap}>
                        <p className={styles.label}>
                          { schema?.placeholder || '--' }
                        </p>
                    </div>
                )}
            </div>
        );
    }, [curWebhook]);

    const getOverview = () => {
        return (
            <div className={styles.overview}>
                <div className={styles.content}>{getDetailView}</div>
            </div>
        );
    };

    return (
        <>
            {getOverview()}
            {getWebhookModal()}
        </>
    );
};

export default Webhook;

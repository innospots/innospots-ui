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

import React, { useMemo, useContext } from 'react';
import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi';

import { Row, Col, Tabs, Button, Typography } from 'antd';
import CurContext from '../../common/context';
import useI18n from '@/common/hooks/useI18n';

import { getItemByType } from './ExecutionItems';

import styles from './ExecutionItems/index.less';

const { Title } = Typography;

const DEFAULT_CONFIG_DATA = {
    enableExecute: true,
    elements: [{ tabs: ['RESULT', 'JSON', 'LOG', 'ATTACHMENT'] }],
};

const ConfigPreview: React.FC<any> = (props) => {
    const { configData, confirmLoading, onExecute: onCustomExecute, onClose, onSubmit } = props;

    const { node, nodeId, onExecute, allExecuteData } = useContext(CurContext);

    const { executeLoading, nodeExecutions } = useModel('Builder');

    const execution = useMemo(() => {
        const nodeExecutionId = allExecuteData?.[nodeId]?.nodeExecutionId;
        if (nodeExecutionId) {
            return nodeExecutions[nodeExecutionId] || {};
        }
        return {};
    }, [nodeId, allExecuteData, nodeExecutions]);

    const { t } = useI18n(['workflow', 'common']);

    const curConfigData = useMemo(() => {
        if (!configData) {
            return {
                ...DEFAULT_CONFIG_DATA,
            };
        }

        return {
            ...DEFAULT_CONFIG_DATA,
            ...configData,
        };
    }, [configData]);

    const configElements = useMemo(() => curConfigData.elements || [], [curConfigData.elements]);

    const formatDataTabs = (tabs: any[]): any[] => {
        return _.map(
            tabs,
            (
                item:
                    | string
                    | {
                          id?: string | number;
                          type: string;
                          label?: string;
                      },
            ) => {
                if (_.isString(item)) {
                    return {
                        id: item,
                        type: item,
                        label: t(`workflow.builder.execution.${item.toLowerCase()}`),
                    };
                } else if (_.isObject(item)) {
                    const id = item.id || item.type;
                    return {
                        ...item,
                        id,
                        label: item.label || t(`workflow.builder.execution.${id}`),
                    };
                }
                return item;
            },
        );
    };

    const onPreviewRun = (postData?: any) => {
        if (onCustomExecute) {
            onCustomExecute(node, true, postData);
        } else {
            onExecute(node, true);
        }
    };

    const footer = (
        <div className={styles.previewFooter}>
            <Button onClick={onClose} className="bordered" style={{ marginRight: 8 }}>
                {t('common.button.cancel')}
            </Button>
            <Button
                type="primary"
                onClick={onSubmit}
                loading={confirmLoading}
                disabled={confirmLoading}
            >
                {t('common.button.confirm')}
            </Button>
        </div>
    );

    const renderPreviewContent = () => {
        return _.map(configElements, (elItem: any, index: number) => {
            if (_.isString(elItem)) {
                elItem = {
                    type: elItem,
                };
            }

            if (_.isObject(elItem) && elItem && elItem?.type) {
                const elItemType = elItem.type;
                const ElItem = getItemByType(elItemType);
                return (
                    ElItem && (
                        <ElItem key={elItemType} executeData={execution} onExecute={onPreviewRun} />
                    )
                );
            } else if (elItem.tabs) {
                return (
                    <Tabs
                        key={`c-${index}`}
                        tabBarExtraContent={
                            curConfigData.enableExecute ? (
                                <Button
                                    size="small"
                                    type="primary"
                                    className="ant-btn-green"
                                    loading={executeLoading}
                                    disabled={executeLoading}
                                    onClick={() => onPreviewRun()}
                                >
                                    {t('common.button.run')}
                                </Button>
                            ) : null
                        }
                        items={_.map(formatDataTabs(elItem.tabs), (item) => {
                            const Content = getItemByType(item.type);

                            return {
                                key: item.id,
                                label: item.label,
                                children: Content && <Content executeData={execution} />,
                            };
                        })}
                    />
                );
            }
        });
    };

    return (
        <div className={styles.previewNode}>
            <Row className={styles.previewHeader} justify="space-between" align="middle">
                <Col>
                    <Title level={5}>{t('workflow.builder.execution.preview')}</Title>
                </Col>
            </Row>
            <div
                className={cls(styles.previewContent, styles[`configEls${configElements.length}`])}
            >
                {renderPreviewContent()}
            </div>
            {footer}
        </div>
    );
};

export default ConfigPreview;

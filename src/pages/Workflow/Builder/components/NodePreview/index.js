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

import React, { useRef, useMemo, useContext } from 'react';
import _ from 'lodash';
import cls from 'classnames';
import JSONInput from 'react-json-editor-ajrm';

import { Row, Col, Tabs, Button, Typography } from 'antd';
import { useSize } from 'ahooks';

import CurContext from '../../common/context';
import ListTable from '@/components/ListTable';

import useI18n from '@/common/hooks/useI18n';

import { formatListData } from '@/common/utils';

import styles from './index.less';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const tabList = [
    {
        id: 'result',
    },
    {
        id: 'json',
    },
    {
        id: 'log',
    },
];

const NodePreview = ({
    confirmLoading,
    executeAble = true,
    onExecute: onCustomExecute,
    onClose,
    onSubmit,
}) => {
    const { node, onExecute, executeData, executeLoading } = useContext(CurContext);
    const conRef = useRef(null);
    const sizeRef = useSize(conRef);

    const { t } = useI18n(['workflow', 'common']);

    const onPreviewRun = () => {
        if (onCustomExecute) {
            onCustomExecute(node, true);
        } else {
            onExecute(node, true);
        }
    };

    /**
     * 执行结果
     */
    const getExecResultList = useMemo(() => {
        const outputs = (executeData || {}).outputs || [];
        const dataList = formatListData((outputs[0] || {}).results || []);
        const dataRow = {
            ...dataList[0],
        };

        delete dataRow.__key;

        // const getWidth = (len) => len * 8

        const columns = _.map(_.keys(dataRow), (k) => ({
            key: k,
            title: k,
            dataIndex: k,
            // width: getWidth(Math.min(Math.max((dataRow[k] + '').length, k.length), 200)),
            render(value) {
                if (value === '' || value === undefined || value === null) {
                    return '-';
                } else if (_.isObject(value)) {
                    return JSON.stringify(value);
                }
                return value.toString();
            },
        }));

        const size = sizeRef || {};

        return (
            <div ref={conRef} className={cls(styles.preview, styles.contentBox)}>
                {columns.length ? (
                    <div className={styles.table}>
                        <ListTable
                            zebra
                            noSpacing
                            size="small"
                            scroll={{
                                x: columns.length * 150,
                                y: size.height ? size.height - 80 : 400,
                            }}
                            columns={columns}
                            dataSource={dataList}
                        />
                    </div>
                ) : (
                    <div>
                        <p style={{ marginTop: 24 }}>
                            <Text strong>{t('workflow.builder.execution.empty')}</Text>
                        </p>
                        <p>{t('workflow.builder.execution.empty.desc')}</p>
                    </div>
                )}
            </div>
        );
    }, [executeData]);

    /**
     * json结构
     */
    const getJSONContent = () => {
        const colors = {
            keys: '#444',
            default: '#9d3332',
            background: '#fafafa',
        };

        return (
            <div className={cls(styles.jsonContent, styles.contentBox)}>
                <JSONInput
                    viewOnly
                    width="100%"
                    height="100%"
                    colors={colors}
                    placeholder={_.get(executeData, 'data', {})}
                />
            </div>
        );
    };

    /**
     * 执行日志
     */
    const getLogContent = () => {
        return (
            <div className={cls(styles.logContent, styles.contentBox)}>
                {executeData.logs || executeData.message || t('workflow.builder.execution.empty')}
            </div>
        );
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

    return (
        <div className={styles.previewNode}>
            <Row className={styles.previewHeader} justify="space-between" align="middle">
                <Col>
                    <Title level={5}>{t('workflow.builder.execution.preview')}</Title>
                </Col>
            </Row>
            <div className={styles.previewContent}>
                <Tabs
                    defaultActiveKey="1"
                    tabBarExtraContent={
                        executeAble ? (
                            <Button
                                size="small"
                                type="primary"
                                loading={executeLoading}
                                disabled={executeLoading}
                                className="ant-btn-green"
                                onClick={onPreviewRun}
                            >
                                {t('common.button.run')}
                            </Button>
                        ) : null
                    }
                >
                    {_.map(tabList, (item) => {
                        if (item.id === 'json' && !executeData.data) {
                            return null;
                        }

                        let content;

                        switch (item.id) {
                            case 'result':
                                content = getExecResultList;
                                break;

                            case 'json':
                                content = getJSONContent();
                                break;

                            case 'log':
                                content = getLogContent();
                                break;

                            default:
                                content = null;
                                break;
                        }

                        return (
                            <TabPane tab={t(`workflow.builder.execution.${item.id}`)} key={item.id}>
                                {content}
                            </TabPane>
                        );
                    })}
                </Tabs>
            </div>
            {footer}
        </div>
    );
};

export default NodePreview;

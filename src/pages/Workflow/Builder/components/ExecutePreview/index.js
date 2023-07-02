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

import React, { useMemo, useState, useEffect } from 'react';
import _ from 'lodash';
import cls from 'classnames';
import { JQuery } from '@antv/x6';
import { useModel } from 'umi';

import { Row, Col, Tabs, Spin, Typography } from 'antd';
import { MinusOutlined, BorderOutlined, CloseOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import ListTable from '@/components/ListTable';

import { formatListData } from '@/common/utils';

import styles from './index.less';

const tabList = [
    {
        id: 'result',
    },
    {
        id: 'log',
    },
];

const { Text, Paragraph } = Typography;

const ExecutePreview = ({ defaultCollapsed, nodeId, allExecuteData, onClose, onCollapsed }) => {
    const { t } = useI18n(['workflow', 'common']);

    const [wrapWidth, setWrapWidth] = useState(0);
    const [collapsed, setCollapsed] = useState(!!defaultCollapsed);

    const { nodeExecutions, nodeExecutionRequest } = useModel('Builder');

    useEffect(() => {
        setWrapWidth(JQuery('#resultListWrap').width());
    }, []);

    const execution = useMemo(() => {
        const nodeExecutionId = allExecuteData?.[nodeId]?.nodeExecutionId;
        if (nodeExecutionId) {
            return nodeExecutions[nodeExecutionId] || {};
        }
        return {};
    }, [nodeId, allExecuteData, nodeExecutions]);

    const toggleCollapsed = () => {
        const c = !collapsed;
        setCollapsed(c);

        onCollapsed && onCollapsed(c);
    };

    /**
     * 日志内容
     * @returns {XML}
     */
    const getLogContent = useMemo(() => {
        const logsData = execution.logs || {};
        const keys = _.keys(logsData);

        if (!keys.length) {
            return <div className={styles.logContent}>{t('workflow.builder.execution.empty')}</div>;
        }

        const list = _.map(keys, (key) => (
            <Paragraph key={key}>
                {key}: {logsData[key] || '-'}
            </Paragraph>
        ));
        return <div className={styles.logContent}>{list}</div>;
    }, [execution.logs]);

    /**
     * 执行结果列表
     * @returns {XML}
     */
    const getResultList = useMemo(() => {
        const outputs = execution.outputs || [];
        const dataList = formatListData((outputs[0] || {}).results || []);
        const dataRow = {
            ...dataList[0],
        };

        delete dataRow.__key;

        const getWidth = (len) => len * 8;

        const columns = _.map(_.keys(dataRow), (k) => ({
            key: k,
            title: k,
            dataIndex: k, // width: getWidth(Math.min(Math.max((dataRow[k] + '').length, k.length), 200)),
            render(value) {
                if (value === '' || value === undefined || value === null) {
                    return '-';
                } else if (_.isObject(value)) {
                    return JSON.stringify(value);
                }
                return value.toString();
            },
        }));

        return (
            <div className={styles.resultList} id="resultListWrap">
                <ListTable
                    zebra
                    noSpacing
                    size="mini"
                    columns={columns}
                    dataSource={dataList}
                    scroll={{
                        y: 170,
                        x: columns.length * 150,
                    }}
                />
            </div>
        );
    }, [execution]);

    const getTabNode = (
        <Tabs
            items={_.map(tabList, (item) => ({
                key: item.id,
                label: (
                    <span className={styles.tabBar}>
                        {t(`workflow.builder.execution.${item.id}`)}
                    </span>
                ),
                children: (
                    <div className={styles.content}>
                        {item.id === 'result' ? getResultList : getLogContent}
                    </div>
                ),
            }))}
            tabBarExtraContent={
                <Row>
                    <Col>
                        <span className={styles.exeBtn} onClick={toggleCollapsed}>
                            {collapsed ? <BorderOutlined /> : <MinusOutlined />}
                        </span>
                    </Col>
                    <Col>
                        <span className={styles.exeBtn} onClick={onClose}>
                            <CloseOutlined />
                        </span>
                    </Col>
                </Row>
            }
            defaultActiveKey={tabList[0] ? tabList[0].id : ''}
            onChange={() => {
                if (collapsed) {
                    setCollapsed(!collapsed);
                }
            }}
        />
    );

    return (
        <div className={cls(styles.wrapper, { [styles.collapsed]: collapsed }, 'execute-preview')}>
            <Spin spinning={!!nodeExecutionRequest.loading} />
            {getTabNode}
        </div>
    );
};

export default ExecutePreview;

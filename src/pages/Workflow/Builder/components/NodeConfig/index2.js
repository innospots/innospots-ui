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

import React, { useContext, useMemo } from 'react';
import _ from 'lodash';

import { Row, Col } from 'antd';

import CurContext from '../../common/context';
import ConfigForm from '../NodeDataConfig/ConfigForm';

import styles from './index.less';

const NodeConfig = () => {
    const { nodeId, nodeData, onChange } = useContext(CurContext);

    const configData = _.get(nodeData, 'configData', {});

    const handleValuesChange = (changedValues) => {
        onChange(changedValues);
    };

    const initialValues = useMemo(() => {
        return {
            ...nodeData.data,
            displayName: nodeData.displayName,
        };
    }, [nodeData.data, nodeData.displayName]);

    const renderConfigInfo = () => {
        if (!configData.config) {
            configData.config = {};
        }

        configData.config.initialValues = {
            ...configData.config.initialValues,
            ...initialValues,
        };

        return (
            <ConfigForm
                nodeId={nodeId}
                viewType="info"
                {...configData.config}
                onValuesChange={handleValuesChange}
            />
        );
    };

    return (
        <div className={styles.nodeConfig}>
            <Row style={{ marginBottom: 24 }} gutter={12}>
                <Col>nodeKey:</Col>
                <Col>
                    <span className="form-item-value">{nodeId}</span>
                </Col>
            </Row>
            <div>{renderConfigInfo()}</div>
        </div>
    );
};

export default NodeConfig;

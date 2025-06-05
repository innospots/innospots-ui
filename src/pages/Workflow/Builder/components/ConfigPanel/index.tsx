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

import { useMemo, useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import cls from 'classnames';
import { useModel, useParams } from 'umi';
import useI18n from '@/common/hooks/useI18n';

import { Row, Col, Tabs } from 'antd';
import { SettingOutlined, DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';

import CurContext from '../../common/context';
import NodeParam from '../NodeParam';
import NodeConfig from '../NodeConfig';
import NodeDataConfig from '../NodeDataConfig';

import styles from './index.less';

const configTabs = ['settings', 'params'];

const ConfigPanel = () => {
  const {
    node,
    nodeId,
    pageMode,
    configCell,
    allExecuteData,
    onConfigShown,
    onConfigHidden,
    onShowNodeConfig,
    executeMessageHeight,
  } = useContext(CurContext);
  const { t } = useI18n(['workflow', 'common']);

  const { executionPageData, nodeExecutionRequest } = useModel('Builder', model => ({
    executionPageData: model.executionPageData,
    nodeExecutionRequest: model.nodeExecutionRequest
  }));
  const { workflowType } = useParams<{ workflowType: string }>();
  const [configVisible, setConfigVisible] = useState(false);

  const nodeCode = useMemo(() => _.get(node, 'data.code'), [node]);

  const fetchExecution = (nodeExecutionId) => {
    nodeExecutionRequest.run(workflowType, nodeExecutionId, executionPageData);
  };

  useEffect(() => {
    const configData = _.get(node, 'data', {});
    if (configCell === nodeId && !configData.disabled) {
      toggleDataConfig();
    }
  }, [configCell, nodeId]);

  useEffect(() => {
    const nodeExecutionId = allExecuteData?.[nodeId]?.nodeExecutionId;
    if (nodeExecutionId) {
      fetchExecution(nodeExecutionId);
    }
  }, [nodeId, executionPageData, allExecuteData, nodeCode]);

  const [collapsed, setCollapsed] = useState(false);

  const handleTabChange = () => {};

  const toggleCollapsed = () => setCollapsed(!collapsed);
  const handleShowNodeConfig = () => onShowNodeConfig && onShowNodeConfig(nodeId);

  const toggleDataConfig = () => {
    const visible = !configVisible;
    setConfigVisible(visible);

    if (visible) {
      onConfigShown && onConfigShown(node);
    } else {
      onConfigHidden && onConfigHidden(node);
    }
  };

  const getPanelContent = (tab) => {
    let content;

    if (tab === 'settings') {
      content = <NodeConfig />;
    } else if (tab === 'params') {
      content = <NodeParam />;
    }

    return content;
  };

  const getTabNode = useMemo(() => {
    const tabItems = _.map(configTabs, (tab) => ({
      key: tab,
      label: <span className={styles.tabBar}>{t(`workflow.builder.${tab}.title`)}</span>,
      children: (
        <div className={cls(styles.content, 'config-panel-content', 'custom-scrollbar')}>{getPanelContent(tab)}</div>
      ),
    }));

    return (
      <Tabs
        items={tabItems}
        tabBarExtraContent={
          pageMode === 'edit' && (
            <Row gutter={[4, 0]} style={{ paddingRight: 16 }}>
              <Col>
                <div className={styles.extraBtn} onClick={handleShowNodeConfig}>
                  <SettingOutlined />
                </div>
              </Col>
              <Col>
                <div className={styles.extraBtn} onClick={toggleCollapsed}>
                  <DoubleRightOutlined />
                </div>
              </Col>
            </Row>
          )
        }
        defaultActiveKey={configTabs[0] || ''}
        onChange={handleTabChange}
      />
    );
  }, [nodeId]);

  return (
    <>
      <div className={cls(styles.wrapper, { [styles.collapsed]: collapsed }, 'config-panel')} style={{ bottom: executeMessageHeight + 16 }}>
        {getTabNode}
        <div onClick={toggleCollapsed} className={styles.handlerView}>
          <div className={styles.extendBtn}>
            <DoubleLeftOutlined />
          </div>
          <div className={styles.title}>{t('workflow.builder.params.title')}</div>
        </div>
      </div>
      <NodeDataConfig visible={configVisible} onClose={toggleDataConfig} />
    </>
  );
};

export default ConfigPanel;

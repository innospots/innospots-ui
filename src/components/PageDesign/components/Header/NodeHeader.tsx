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

import React, { useEffect, useMemo } from 'react';
import { history, useModel } from 'umi';

import { PageHeader } from '@ant-design/pro-layout';

import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, message, Row } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import NodeModal, {
  MODAL_NAME as NODE_MODAL_NAME,
} from '@/pages/Workflow/Nodes/components/NodeModal';

import Tabs from '../CustTabs';

import styles from './index.less';

const NodeHeader: React.FC<any> = () => {
  const { t } = useI18n(['workflow', 'common']);
  const [nodeModal] = useModal(NODE_MODAL_NAME);
  const { nodeEditPage, setNodeEditPage, getAppResources } = useModel(
    'AppEditor',
    (model) => ({
      nodeEditPage: model.nodeEditPage,
      setNodeEditPage: model.setNodeEditPage,
      getAppResources: model.getAppResources,
    }),
  );
  const {
    nodeInfo,
    setNodeInfo,
    fetchNodeGroupsRequest,
    updateNodeConfigRequest,
    updateNodeStatusRequest,
  } = useModel('FlowNode', (model) => ({
    nodeInfo: model.nodeInfo,
    setNodeInfo: model.setNodeInfo,
    fetchNodeGroupsRequest: model.fetchNodeGroupsRequest,
    updateNodeConfigRequest: model.updateNodeConfigRequest,
    updateNodeStatusRequest: model.updateNodeStatusRequest,
  }));

  const headerItems = [
    // {
    //   key: 'io',
    //   label: '连接&输入输出',
    // },
    {
      key: 'config',
      label: '配置参数',
    },
    {
      key: 'code',
      label: '处理调试',
    },
  ];

  const saveNodeLoading = useMemo(
    () => updateNodeConfigRequest.loading,
    [updateNodeConfigRequest.loading],
  );

  useEffect(() => {
    if (nodeInfo?.flowCode) {
      fetchNodeGroupsRequest.run(nodeInfo?.flowCode);
    }
  }, [nodeInfo?.flowCode]);

  const changeStatus = async () => {
    const status = nodeInfo.status !== 'ONLINE' ? 'ONLINE' : 'OFFLINE';
    const result = await updateNodeStatusRequest.runAsync(
      nodeInfo.nodeId,
      status,
    );
    if (result) {
      setNodeInfo({
        ...nodeInfo,
        status,
      });
      message.success(t('common.error_message.save.success'));
    }
  };

  const updateAppInfo = async () => {
    const newResources = getAppResources();
    const postData = {
      ...nodeInfo,
      resources: {
        ...nodeInfo.resources,
        ...newResources,
      },
    };
    const result = await updateNodeConfigRequest.runAsync(postData);

    if (result) {
      message.success('保存成功');
    }
  };

  const handleClick = (type, data?: any) => async () => {
    if (type === 'save') {
      updateAppInfo();
    }
  };

  const pageBack = () => {
    history.back();
  };

  const handleEditSuccess = (result) => {
    if (result) {
      setNodeInfo(result);
    }
  };

  const renderNodeModal = () => (
    <NodeModal flowCode={nodeInfo?.flowCode} onSuccess={handleEditSuccess} />
  );

  return (
    <div className={styles.pageHeader}>
      <PageHeader ghost={false}>
        <div>
          <Row justify="space-between" style={{ flex: 1 }}>
            <Col>
              <Row align="middle" gutter={10}>
                <Col flex="none">
                  <div className={styles.backIcon} onClick={pageBack}>
                    <ArrowLeftOutlined />
                  </div>
                </Col>
                <Col>{nodeInfo && nodeInfo.name}</Col>
                <Col>
                  <span
                    className="g-button"
                    onClick={() => nodeModal.show(nodeInfo)}
                  >
                    <EditOutlined />
                  </span>
                  {/* <IconButton
                    icon="edit"
                    permissions="Page-createOrUpdate"
                    onClick={() => {
                      // if (isUsed) {
                      //   message.warning('此应用已经被工作流引用，不能编辑！');
                      // } else {
                      nodeModal.show(nodeInfo);
                      // }
                    }}
                  /> */}
                </Col>
              </Row>
            </Col>
            <Col>
              <Tabs
                items={headerItems}
                activeKey={nodeEditPage}
                onChange={setNodeEditPage}
              />
            </Col>
            <Col style={{ paddingRight: 20 }}>
              <Row gutter={10}>
                <Col>
                  <Button onClick={pageBack}>取消</Button>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    loading={saveNodeLoading}
                    onClick={handleClick('save')}
                  >
                    {t('common.button.save')}
                  </Button>
                </Col>
                <Col>
                  {nodeInfo?.status !== 'ONLINE' ? (
                    <Button color="cyan" variant="solid" onClick={changeStatus}>
                      {t('common.text.activate')}
                    </Button>
                  ) : (
                    <Button danger onClick={changeStatus}>
                      {t('common.text.deactivate')}
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </PageHeader>
      {renderNodeModal()}
    </div>
  );
};

export default React.memo(NodeHeader);

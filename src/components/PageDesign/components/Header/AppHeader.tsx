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
import _ from 'lodash';
import React from 'react';
import { history, useModel } from 'umi';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Col, message, Row } from 'antd';

import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

const AppHeader: React.FC<any> = ({
  onTabChange,
  onStatusChange,
  onInfoUpdated,
}) => {
  const { t } = useI18n(['workflow', 'common']);
  const { commonState, getAppResources } = useModel('AppEditor', (model) => ({
    commonState: model.commonState,
    getAppResources: model.getAppResources,
  }));
  const {
    fetchAppInfo,
    currentAppInfo,
    appInfoRequest,
    updateStatusRequest,
    updateAppInfoRequest,
  } = useModel('App', (model) => ({
    fetchAppInfo: model.fetchAppInfo,
    currentAppInfo: model.currentAppInfo,
    appInfoRequest: model.appInfoRequest,
    updateStatusRequest: model.updateStatusRequest,
    updateAppInfoRequest: model.updateAppInfoRequest,
  }));
  const loading =
    updateAppInfoRequest.loading ||
    updateStatusRequest.loading ||
    appInfoRequest.loading;

  const updateAppInfo = async () => {
    const appResources = getAppResources();
    const postData = _.extend({}, currentAppInfo, {
      resources: {
        ...(currentAppInfo?.resources || {}),
        pages: appResources.pages,
      },
    });
    const result = await updateAppInfoRequest.runAsync(postData);

    if (result) {
      message.success(t('common.error_message.save.success'));
    }
  };

  const handleClick = (type: string, data?: any) => async () => {
    if (type === 'save') {
      updateAppInfo();
    }
  };

  const changeStatus = async () => {
    if (currentAppInfo) {
      const status = currentAppInfo.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
      const result = await updateStatusRequest.runAsync(
        currentAppInfo.appKey,
        status,
      );
      if (result) {
        message.success(t('common.error_message.save.success'));
        fetchAppInfo(currentAppInfo.appKey);
      }
    }
  };

  const toggleSettingPanel = () => {
    commonState.settingCollapsed = !commonState.settingCollapsed;
  };

  const pageBack = () => {
    history.back();
  };

  return (
    <div className={styles.pageHeader}>
      <Row justify="space-between" style={{ flex: 1 }}>
        <Col>
          <Row align="middle" gutter={10}>
            <Col flex="none">
              <div className={styles.backIcon} onClick={pageBack}>
                <ArrowLeftOutlined />
              </div>
            </Col>
            <Col>{currentAppInfo && currentAppInfo.name}</Col>
            {/* <Col>
                  <div className={styles.configButton} onClick={toggleSettingPanel}>
                    <SettingOutlined />
                    <span>设置</span>
                  </div>
                </Col> */}
          </Row>
        </Col>
        <Col style={{ paddingRight: 20 }}>
          {currentAppInfo && (
            <Row gutter={10}>
              <Col>
                <Button
                  href={`#/app/page/preview/${currentAppInfo?.appKey}`}
                  target="_blank"
                >
                  {t('common.button.preview')}
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handleClick('save')}
                >
                  {t('common.button.save')}
                </Button>
              </Col>
              <Col>
                {currentAppInfo?.status === 'ONLINE' ? (
                  <Button danger loading={loading} onClick={changeStatus}>
                    {t('common.text.deactivate')}
                  </Button>
                ) : (
                  <Button
                    color="cyan"
                    variant="solid"
                    loading={loading}
                    onClick={changeStatus}
                  >
                    {t('common.text.activate')}
                  </Button>
                )}
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(AppHeader);

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

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { history, useModel } from 'umi';

import { Row, Col, Button, PageHeader, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';

import { AppInfo } from '@/common/types/Types';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import DataContext from '../../DataContext';

import AppModal, { MODAL_NAME as APP_MODAL_NAME } from '../../../components/AppModal';

import Tabs from '../Tabs';

import styles from './index.less';

const Header:React.FC<any> = ({ onTabChange, onStatusChange, onInfoUpdated }) => {
  const { appDetail, appValue, pageType, onAppValueChange } = useContext(DataContext);
  const { t } = useI18n(['workflow', 'common']);
  const [ appInfo, setAppInfo ] = useState<AppInfo>();

  const {
    updateStatusRequest,
    updateAppInfoRequest,
  } = useModel('App', model => ({
    updateStatusRequest: model.updateStatusRequest,
    updateAppInfoRequest: model.updateAppInfoRequest,
  }));

  const [appModal] = useModal(APP_MODAL_NAME);

  useEffect(() => {
    if (appDetail) {
      setAppInfo(appDetail)
    }
  }, [ appDetail ]);

  const handleEditAppInfo = useCallback(() => {
    appModal.show(appInfo)
  }, [ appInfo ]);

  const handleClick = (type, data?: any) => async () => {
    let result;
    if (type === 'save') {
      result = await updateAppInfoRequest.runAsync({
        ...appDetail,
        ...appValue,
        // configs: JSON.stringify(appValue.configs || []),
        // inPorts: appValue.inPorts.map(item => JSON.stringify(item)),
        // outPorts: appValue.outPorts.map(item => JSON.stringify(item))
      });
      if (result) {
        message.success('保存成功');
        onInfoUpdated?.(result);
      }
    } else if (type === 'active') {
      result = await updateStatusRequest.runAsync(appDetail?.nodeId as number, data);
      if (result) {
        message.success('更新成功');
        onStatusChange?.();
      }
    }
  };

  const handleTabChange = (tabKey: string) => {
    onTabChange(tabKey)
    // history.replace({
    //   pathname,
    //   query: {
    //     page: tabKey
    //   }
    // })
  }

  const pageBack = () => {
    history.goBack();
  };

  const handleAppSaved = (newData) => {
    if (newData) {
      setAppInfo(newData);
      onAppValueChange(newData);
    }
  };

  const renderAppModal = () => <AppModal onSuccess={handleAppSaved} />;

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
                <Col>{ appInfo?.name }</Col>
                <Col>
                  <Button
                    type="text"
                    size="small"
                    onClick={handleEditAppInfo}
                  >
                    <EditOutlined />
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col>
              <Row align="bottom" justify="center" style={{height: '100%'}}>
                <Col>
                  <Tabs
                    items={[{
                      key: 'base',
                      label: '连接&输入输出'
                    }, {
                      key: 'parameter',
                      label: '配置参数'
                    }, {
                      key: 'code',
                      label: '处理代码'
                    }]}
                    activeKey={pageType}
                    onChange={handleTabChange}
                  />
                </Col>
              </Row>
            </Col>
            <Col>
              <Row gutter={10}>
                <Col>
                  <Button onClick={pageBack}>{t('common.button.cancel')}</Button>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    loading={updateAppInfoRequest.loading}
                    onClick={handleClick('save')}
                  >
                    {t('common.button.save')}
                  </Button>
                </Col>
                <Col style={{ paddingRight: 20 }}>
                  {
                    appDetail?.status === 'ONLINE' ? (
                      <Button
                        danger
                        loading={updateStatusRequest.loading}
                        onClick={handleClick('active', 'OFFLINE')}
                      >
                        停用
                      </Button>
                    ) : (
                      <Button
                        className="ant-btn-green"
                        loading={updateStatusRequest.loading}
                        onClick={handleClick('active', 'ONLINE')}
                      >
                        启用
                      </Button>
                    )
                  }
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </PageHeader>
      { renderAppModal() }
    </div>
  );
};

export default React.memo(Header);

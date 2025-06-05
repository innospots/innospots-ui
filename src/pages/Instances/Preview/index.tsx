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

import React, {useEffect, useRef} from 'react';
import {Button, Col, message, Modal, Progress, Row, Space, Spin} from 'antd';
import Icon, {ExclamationCircleOutlined, LeftOutlined} from '@ant-design/icons';
import _ from 'lodash';

import {history, useModel} from 'umi';
import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import PageHelmet from '@/components/PageHelmet';

import styles from './index.less';
import Canvas from "../components/FlowCanvas/Canvas";
import InstanceContext from "@/pages/Instances/contexts/InstanceContext";
import {updateInstanceStatus} from "@/services/Instances";

const Index: React.FC<any> = ({location}) => {
  const {
    instanceDetail,

    instanceDetailRequest
  } = useModel('Instances');

  const canvasRef = useRef<any>();
  const taskInstanceId = location.query?.instanceId || 0;
  const {t, loading: i18nLoading} = useI18n(['instance', 'common']);

  useEffect(() => {
    instanceDetailRequest.run(taskInstanceId)
  }, []);


  const updateStatus = (type: string) => async () => {
    const res = await updateInstanceStatus(taskInstanceId, type)

    if (res) {
      message.success(t(type === 'STOP' ? 'instance.list.message.deactivated_success' : 'instance.list.message.rerun_success'));

      instanceDetailRequest.run(taskInstanceId)
    }
  }

  if (i18nLoading) {
    return <PageLoading/>;
  }

  const renderPageTitle = () => {
    const rerunSvg = () => (
      <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
        <path
          d="M512 938.678857C276.370286 938.678857 85.321143 747.629714 85.321143 512S276.370286 85.321143 512 85.321143 938.678857 276.370286 938.678857 512 747.629714 938.678857 512 938.678857zM512 146.285714C310.016 146.285714 146.285714 310.016 146.285714 512s163.730286 365.714286 365.714286 365.714286 365.714286-163.730286 365.714286-365.714286S713.984 146.285714 512 146.285714z m140.251429 316.708572a14.884571 14.884571 0 0 1-18.395429 0V420.571429h-243.748571a15.250286 15.250286 0 0 0-15.250286 15.250285v53.321143a30.464 30.464 0 1 1-60.964572 0V420.571429c0-33.645714 27.318857-60.964571 60.964572-60.964572h258.998857v-27.355428a14.921143 14.921143 0 0 1 18.395429 0l69.083428 57.673142a9.654857 9.654857 0 0 1 0 15.36l-69.083428 57.709715z m-262.070858 97.828571v34.998857h243.712c8.411429 0 15.250286-6.838857 15.250286-15.250285v-53.321143a30.464 30.464 0 1 1 60.964572 0v68.571428c0 33.645714-27.318857 60.928-60.964572 60.928h-258.998857v34.816a14.994286 14.994286 0 0 1-18.468571 0L302.445714 633.892571a9.654857 9.654857 0 0 1 0-15.36l69.266286-57.673142a14.994286 14.994286 0 0 1 18.468571 0z"
          fill="#ffffff"/>
      </svg>
    )
    const stopSvg = () => (
      <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
        <path
          d="M512 928.3c-229.2 0-415-185.8-415-415s185.8-415 415-415 415 185.8 415 415-185.8 415-415 415z m0.4-77.5c186.2 0 337.2-151 337.2-337.2s-151-337.2-337.2-337.2-337.2 151-337.2 337.2 150.9 337.2 337.2 337.2zM382.3 357.6h259.4c14.3 0 25.9 11.6 25.9 25.9V643c0 14.3-11.6 25.9-25.9 25.9H382.3c-14.3 0-25.9-11.6-25.9-25.9V383.6c0-14.4 11.6-26 25.9-26z" fill="#ffffff"></path>
      </svg>
    )

    return (
      <Row className={styles.pageTitle} justify="space-between">
        <Col>{instanceDetail?.taskName || '---'} - {t('instance.main.page.title')}</Col>
        <Col>
          <Space>
            <Button icon={<LeftOutlined/>} onClick={() => history.back()}>
              {t('instance.button.back')}
            </Button>

            {
              instanceDetail.executionStatus === 'FAILED' &&
                <Button type="primary" danger icon={<Icon component={rerunSvg}/>} onClick={() => {
                  Modal.confirm({
                    title: t('instance.list.operate.rerun.title'),
                    icon: <ExclamationCircleOutlined />,
                    content: t('instance.list.operate.rerun.content'),
                    okText: t('common.button.confirm'),
                    cancelText: t('common.button.cancel'),
                    onOk: () => updateStatus('RERUN')(),
                  });
                }}>
                  {t('instance.list.operate.again')}
                </Button>
            }

            {
              instanceDetail.executionStatus === 'RUNNING' &&
                <Button type="primary" danger icon={<Icon component={stopSvg}/>} onClick={() => {
                  Modal.confirm({
                    title: t('instance.list.operate.stop.title'),
                    icon: <ExclamationCircleOutlined />,
                    content: t('instance.list.operate.stop.content'),
                    okText: t('common.button.confirm'),
                    cancelText: t('common.button.cancel'),
                    onOk: () => updateStatus('STOP')(),
                  });
                }}>
                  {t('instance.list.operate.stop')}
                </Button>
            }

          </Space>
        </Col>
      </Row>
    );
  };

  const renderBaseInfoCard = () => {
    const infoObj = {
      col1: {
        span: 6,
        items: [
          {
            label: t('instance.list.column.id'),
            key: 'taskExecutionId',
          },
          {
            label: t('instance.list.column.progress'),
            key: 'percent',
            value: () => {
              return (
                <Progress percent={instanceDetail.percent} showInfo={false} strokeColor={'#b0d28a'}/>
              )
            }
          },
        ],
      },
      col2: {
        span: 6,
        items: [
          {
            label: t('instance.list.column.app'),
            key: 'appName',
          },
          {
            label: t('instance.list.column.create_time'),
            key: 'startTime',
          },
        ],
      },
      col3: {
        span: 6,
        items: [
          {
            label: t('instance.detail.label.creator'),
            key: 'createdBy',
          },
          {
            label: t('instance.list.column.end_time'),
            key: 'endTime',
          },
        ],
      },
      col4: {
        span: 6,
        items: [
          {
            label: t('instance.list.column.status'),
            key: 'executionStatus',
          },
          {
            label: t('instance.detail.label.execution_time'),
            key: 'timeConsume'
          },
        ],
      }
    };

    const renderInfoCol = (cols) => {
      return cols.map((item: any, index: any) => {
        return (
          <Row style={{height: `${100 / cols.length}%`}} key={'col_' + index}>
            <Col>
              <div className={styles.infoLabel}>{item.label}</div>
              <div className={styles.infoValue}>
                {item.value
                  ? _.isFunction(item.value)
                    ? item.value(instanceDetail)
                    : item.value
                  : instanceDetail[item.key] || '---'}
              </div>
            </Col>
          </Row>
        );
      });
    };

    return (
      <Spin spinning={instanceDetailRequest.loading}>
        <Row className={styles.baseInfoCard}>
          {Object.keys(infoObj).map((col: any) => {
            return (
              <Col span={infoObj[col].span} key={col}>{renderInfoCol(infoObj[col].items)}</Col>
            );
          })}
        </Row>
      </Spin>
    );
  };

  return (
    <InstanceContext.Provider value={{detailUrl: instanceDetail.detailUrl}}>
      <PageHelmet title={[instanceDetail?.taskName, t('instance.main.page.title')].join(' - ')}/>
      {renderPageTitle()}
      {renderBaseInfoCard()}

      <div className={styles.content}>
        <p className={styles.canvasTitle}>{t('instance.detail.workflow.title')}</p>

        <Canvas
          ref={canvasRef}
          mode={'preview'}
          workflowInstanceId={taskInstanceId}
        />
      </div>
    </InstanceContext.Provider>
  );
};

export default Index;

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

import React, {useEffect} from 'react';
import {Button, Col, Row, Spin, Statistic, Table, Tag, Tooltip} from 'antd';
import {ArrowUpOutlined, LeftOutlined, RightOutlined} from '@ant-design/icons';
import _ from 'lodash';
import * as echarts from 'echarts';

import {history, useModel} from 'umi';
import useI18n from '@/common/hooks/useI18n';
import {getTimeDiff} from '@/common/utils/Datetime';
import PageLoading from '@/components/PageLoading';
import PageHelmet from '@/components/PageHelmet';

import styles from './index.less';

const STATUS_TAG_COLORS = {
  OFFLINE: {
    color: '#FF4445',
    bgColor: '#FFF1F2',
  },
  ONLINE: {
    color: '#31CB8A',
    bgColor: '#DBF4EC',
  },
  '500': {
    color: '#FF4445',
    bgColor: '#FFF1F2',
  },
  '200': {
    color: '#31CB8A',
    bgColor: '#DBF4EC',
  },
  'FAILED': {
    color: '#FF4445',
    bgColor: '#FFF1F2',
  },
  'COMPLETE': {
    color: '#31CB8A',
    bgColor: '#DBF4EC',
  },
};

const STATUS_TAG = {
  OFFLINE: 'workflow.board.status.no.online',
  ONLINE: 'workflow.board.status.online',
};

const PREVIEW_TITLE = {
  CRONTIMER: 'workflow.overview.exec.scheduler.overview',
  WEBHOOK: 'workflow.overview.exec.webhook_trigger.overview',
  KAFKA_TRIGGER: 'workflow.overview.exec.kafka_trigger.title',
};

const STATISTIC_OBJ = {
  WEBHOOK: {
    firstStat: {
      key: 'todayTimes',
      label: 'workflow.overview.exec.webhook_trigger.today',
    },
    secondStat: {
      key: 'cumulativeTimes',
      label: 'workflow.overview.exec.webhook_trigger.total',
    },
  },
  KAFKA_TRIGGER: {
    firstStat: {
      key: 'todayTimes',
      label: 'workflow.overview.exec.kafka_trigger.today',
    },
    secondStat: {
      key: 'cumulativeTimes',
      label: 'workflow.overview.exec.kafka_trigger.total',
    },
  },
  CRONTIMER: {
    firstStat: {
      key: 'successJob',
      label: 'workflow.overview.exec.scheduler.successed',
    },
    secondStat: {
      key: 'failJob',
      label: 'workflow.overview.exec.scheduler.failed',
    },
  },
};

// 折线图容器节点
let CHART_DOM: any = null;
// 折线图节点
let MY_CHART: any = null;

const Index: React.FC<any> = ({location, match}) => {
  const {
    strategyDetail,
    changeRecordList,
    executionRecordData,
    strategyStatisticData,

    fetchStrategyDetailRequest,
    fetchChangeRecordRequest,
    fetchExecutionRecordRequest,
    fetchStrategyStatisticRequest
  } = useModel('Preview');

  const workflowId = location.query?.instanceId || 0;
  const chartDom = document.getElementById('lineChart');
  const currentStat = STATISTIC_OBJ[strategyDetail?.triggerCode] || {};
  const {t, loading: i18nLoading} = useI18n(['strategy', 'workflow', 'common']);

  useEffect(() => {
    fetchStrategyDetailRequest.run(workflowId);
    fetchChangeRecordRequest.run(workflowId);
    fetchStrategyStatisticRequest.run(workflowId);
    fetchExecutionRecordRequest.run({workflowId});
  }, []);

  useEffect(() => {
    CHART_DOM = chartDom;
    // 初始化chart实例
    MY_CHART = CHART_DOM && echarts.init(CHART_DOM);

    // 配置图表
    setChartOption();

    window.onresize = function () {
      MY_CHART && MY_CHART.resize();
    };

    return () => {
      // 销毁chart实例
      MY_CHART && MY_CHART.dispose();
    };
  }, [strategyStatisticData]);

  const setChartOption = () => {
    const charts = strategyStatisticData.charts?.reverse() || [];

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: 'red',
          },
        },
      },
      xAxis: [
        {
          type: 'category',
          data: charts.map((c) => c.time),
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: t('workflow.overview.exec.scheduler.last_30_days'),
          // min: 0,
          // max: 250,
          interval: 50,
          axisLabel: {
            formatter: '{value}',
          },
        },
        {
          type: 'value',
          name: '',
          // min: 0,
          // max: 25,
          interval: 50,
          axisLabel: {
            formatter: '{value}',
          },
        },
      ],
      series: [
        {
          name: 'successCount',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return value;
            },
          },
          data: charts.map((c) => c.successCount),
        },
        {
          name: 'failCount',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return value;
            },
          },
          data: charts.map((c) => c.failCount),
        },
        {
          name: 'count',
          type: 'line',
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: function (value) {
              return value;
            },
          },
          data: charts.map((c) => c.count),
        },
      ],
    };

    MY_CHART && MY_CHART.setOption(option);
  };

  if (i18nLoading) {
    return <PageLoading/>;
  }

  const renderPageTitle = () => {
    return (
      <Row className={styles.pageTitle} justify="space-between">
        <Col>{strategyDetail?.name || '---'}</Col>
        <Col>
          <Button icon={<LeftOutlined/>} onClick={() => history.goBack()}>
            {t('workflow.board.button.back')}
          </Button>
        </Col>
      </Row>
    );
  };

  const renderBaseInfoCard = () => {
    const infoObj = {
      col1: {
        span: 4,
        items: [
          {
            label: t('workflow.overview.trigger'),
            key: 'triggerCode',
          },
          {
            label: t('workflow.overview.status'),
            key: 'status',
            value: () => {
              const colors = STATUS_TAG_COLORS[strategyDetail?.status];
              return (
                <Tag
                  color={colors?.bgColor || '#E9EDF1'}
                  style={{
                    color: colors?.color || '#959EAD',
                  }}
                >
                  {t(STATUS_TAG[strategyDetail?.status])}
                </Tag>
              );
            },
          },
        ],
      },
      col2: {
        span: 5,
        items: [
          {
            label: t('workflow.overview.author'),
            key: 'createdBy',
          },
          {
            label: t('workflow.overview.create_time'),
            key: 'createdTime',
          },
        ],
      },
      col3: {
        span: 5,
        items: [
          {
            label: t('workflow.overview.editor'),
            key: 'updatedBy',
          },
          {
            label: t('workflow.overview.update_time'),
            key: 'updatedTime',
          },
        ],
      },
      col4: {
        span: 5,
        items: [
          {
            label: t('workflow.overview.active_time'),
            key: 'onlineTime',
          },
          {
            label: t('workflow.overview.execution_time'),
            key: 'lastedTime',
            value: (record) => getTimeDiff(record.onlineTime, new Date()),
          },
        ],
      },
      col5: {
        span: 5,
        items: [
          {
            label: t('workflow.overview.desc'),
            key: 'description',
          },
        ],
      },
    };

    const renderInfoCol = (cols) => {
      return cols.map((item: any) => {
        return (
          <Row style={{height: `${100 / cols.length}%`}}>
            <Col>
              <div className={styles.infoLabel}>{item.label}</div>
              <div className={styles.infoValue}>
                {item.value
                  ? _.isFunction(item.value)
                    ? item.value(strategyDetail)
                    : item.value
                  : strategyDetail[item.key] || '---'}
              </div>
            </Col>
          </Row>
        );
      });
    };

    return (
      <Spin spinning={fetchStrategyDetailRequest.loading}>
        <Row className={styles.baseInfoCard}>
          {Object.keys(infoObj).map((col: any) => {
            return (
              <Col span={infoObj[col].span}>{renderInfoCol(infoObj[col].items)}</Col>
            );
          })}
        </Row>
      </Spin>
    );
  };

  const renderPreviewCard = () => {
    // 当触发器类型为webhook、kafka时有统计比例展示
    const isHaveFrequency =
      strategyDetail?.triggerCode === 'WEBHOOK' || strategyDetail?.triggerCode === 'KAFKA_TRIGGER';

    return (
      <Spin spinning={fetchStrategyStatisticRequest.loading}>
        <div className={styles.previewCard}>
          <div className={styles.previewCardTitle}>
            {t(PREVIEW_TITLE[strategyDetail?.triggerCode])}
          </div>

          <Row justify="space-between" className={styles.frequencyContent}>
            <Col className={styles.ratioItem}>
              <Statistic
                title={t(currentStat.firstStat?.label) || '---'}
                value={strategyStatisticData[currentStat.firstStat?.key]}
              />
              {isHaveFrequency && (
                <div className={styles.frequencyNum}>
                  <div>
                    <span>+{strategyStatisticData.growthRate}%</span>
                    <ArrowUpOutlined/>
                  </div>
                </div>
              )}
            </Col>
            <Col>
              <Statistic
                title={t(currentStat.secondStat?.label) || '---'}
                value={strategyStatisticData[currentStat.secondStat?.key]}
              />
            </Col>
          </Row>

          <div className={styles.lineChart} id="lineChart"/>
        </div>
      </Spin>
    );
  };

  const renderChangeRecordCard = () => {
    const dataSource = (changeRecordList || []).slice(0, 8)

    const columns: any = [
      {
        width: '35%',
        title: t('workflow.overview.operation_log.operate_time'),
        dataIndex: 'operateTime',
      },
      {
        title: t('workflow.overview.operation_log.user'),
        dataIndex: 'username',
      },
      {
        width: '50%',
        title: t('workflow.overview.operation_log.operation'),
        dataIndex: 'detail',
      },
    ];

    return (
      <Spin spinning={fetchChangeRecordRequest.loading}>
        <div className={styles.changeRecordCard}>
          <Row justify="space-between" className={styles.changeRecordTitle}>
            <Col>{t('workflow.overview.operation_log.title')}</Col>
            <Col className={styles.moreLink}>
              <Button
                type="link"
                onClick={() => history.push(`/system/operation-logs`)}
              >
                {t('workflow.overview.operation_log.more')}
                <RightOutlined/>
              </Button>
            </Col>
          </Row>

          <div className={styles.recordTable}>
            <Table
              size="small"
              columns={columns}
              pagination={false}
              scroll={{y: 418}}
              dataSource={dataSource}
            />
          </div>
        </div>
      </Spin>
    );
  };

  const renderExecutionRecordCard = () => {
    const dataSource = (executionRecordData.list || []).slice(0, 5)
    const columns: any = {
      'WEBHOOK': [
        {
          title: t('workflow.board.card.columns.requestTime'),
          dataIndex: 'startTime',
        },
        {
          title: t('workflow.board.card.columns.lastedTime'),
          dataIndex: 'lastTime',
          render: (lastTime, record) => {
            const {startTime, endTime} = record;
            if (startTime && endTime) {
              const eT = new Date(endTime).getTime();
              const sT = new Date(startTime).getTime();

              const mss = eT - sT;

              return mss + ' ms ';
            } else {
              return '---';
            }
          },
        },
        {
          title: t('workflow.board.card.columns.requestIp'),
          dataIndex: 'ip',
          render: () => '127.0.0.1',
        },
        {
          title: t('workflow.board.card.columns.requestCode'),
          dataIndex: 'resultCode',
          render: (resultCode) => {
            const colors = STATUS_TAG_COLORS[resultCode];
            return (
              <Tag
                color={colors?.bgColor || '#E9EDF1'}
                style={{
                  color: colors?.color || '#959EAD',
                }}
              >
                {resultCode}
              </Tag>
            );
          },
        },
        {
          title: t('workflow.board.card.columns.requestBody'),
          ellipsis: {
            showTitle: false,
          },
          dataIndex: 'input',
          render: (input) => (
            <Tooltip placement="topLeft" title={JSON.stringify(input)}>
              {JSON.stringify(input)}
            </Tooltip>
          ),
        },
        {
          title: t('workflow.board.card.columns.responseData'),
          ellipsis: {
            showTitle: false,
          },
          dataIndex: 'output',
          render: (output) => (
            <Tooltip placement="topLeft" title={JSON.stringify(output)}>
              {JSON.stringify(output)}
            </Tooltip>
          ),
        },
      ],
      'KAFKA_TRIGGER': [
        {
          title: t('workflow.board.card.columns.processingTime'),
          dataIndex: 'createdTime',
        },
        {
          title: t('workflow.board.card.columns.lastedTime'),
          dataIndex: 'lastTime',
          render: (lastTime, record) => {
            const {startTime, endTime} = record;
            if (startTime && endTime) {
              const eT = new Date(endTime).getTime();
              const sT = new Date(startTime).getTime();

              const mss = eT - sT;

              return mss + ' ms ';
            } else {
              return '---';
            }
          },
        },
        {
          title: t('workflow.board.card.columns.kafka.requestBody'),
          ellipsis: {
            showTitle: false,
          },
          dataIndex: 'output',
          render: (output) => (
            <Tooltip placement="topLeft" title={JSON.stringify(output)}>
              {JSON.stringify(output)}
            </Tooltip>
          ),
        },
      ],
      'CRONTIMER': [
        {
          title: t('workflow.board.card.columns.jobId'),
          dataIndex: 'flowExecutionId',
        },
        {
          title: t('workflow.board.card.columns.triggerMode'),
          dataIndex: 'executeMode'
        },
        {
          title: t('workflow.board.card.columns.triggerTime'),
          dataIndex: 'createdTime',
        },
        {
          title: t('workflow.board.card.columns.status'),
          dataIndex: 'status',
          render: (status) => {
            const colors = STATUS_TAG_COLORS[status];
            return (
              <Tag
                color={colors?.bgColor || '#E9EDF1'}
                style={{
                  color: colors?.color || '#959EAD',
                }}
              >
                {status}
              </Tag>
            );
          },
        },
        {
          title: t('workflow.board.card.columns.startTime.and.endTime'),
          ellipsis: {
            showTitle: false,
          },
          dataIndex: 'time',
          render: (time, record) => (
            <>
              <div>{record.startTime || '---'}</div>
              <div>{record.endTime || '---'}</div>
            </>
          ),
        },
        {
          title: t('workflow.board.card.columns.lastedTime'),
          dataIndex: 'lastTime',
          render: (lastTime, record) => {
            const {startTime, endTime} = record;
            if (startTime && endTime) {
              const eT = new Date(endTime).getTime();
              const sT = new Date(startTime).getTime();

              const mss = eT - sT;

              return mss + ' ms ';
            } else {
              return '---';
            }
          },
        }
      ],
    }

    return (
      <Spin spinning={fetchExecutionRecordRequest.loading}>
        <div className={styles.executionRecordCard}>
          <Row justify="space-between" className={styles.executionRecordTitle}>
            <Col>{t('workflow.board.execution.record.title')}</Col>
            <Col className={styles.moreLink}>
              <Button
                type="link"
                onClick={() => history.push(`/workflow/index/record${location.search}`)}
              >
                {t('workflow.overview.operation_log.more')}
                <RightOutlined/>
              </Button>
            </Col>
          </Row>

          <div className={styles.recordTable}>
            <Table
              size="small"
              pagination={false}
              scroll={{y: 298}}
              rowKey="flowExecutionId"
              dataSource={dataSource}
              columns={columns[strategyDetail?.triggerCode] || []}
            />
          </div>
        </div>
      </Spin>
    );
  };

  return (
    <>
      <PageHelmet title={[strategyDetail?.name, t('workflow.board.breadcrumb.workflow.detail.title')].join(' - ')}/>
      {/*{renderBreadcrumb()}*/}
      {renderPageTitle()}
      {renderBaseInfoCard()}
      <div>
        {renderPreviewCard()}
        {renderChangeRecordCard()}
      </div>
      {renderExecutionRecordCard()}
    </>
  );
};

export default Index;

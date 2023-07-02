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

import React, { useCallback, useEffect, useState } from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import styles from './index.less';
import ReactEcharts from 'echarts-for-react';
import { ArrowUpOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import useI18n from "@/common/hooks/useI18n";

const Index: React.FC = (props) => {
  const { strategyPreviewData, getStrategyPreviewData } = useModel('StrategyDetail');
  const [echartOption, setEchartOption] = useState({});

  const { strategyId, dataSourceCode } = props['commonParams'];

  let strategyCharData = [];

  const {t} = useI18n('workspace');

  useEffect(() => {
    getStrategyPreviewData.run(strategyId);
  }, [strategyId]);

  useEffect(() => {
    if (strategyPreviewData && strategyPreviewData['charts']) {
      strategyCharData = strategyPreviewData['charts'].slice(0, 5);
      setEchartOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999',
            },
          },
        },
        xAxis: [
          {
            type: 'category',
            data: strategyCharData.map((c) => {
              return c.time;
            }),
            axisPointer: {
              type: 'shadow',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: t('workflow.overview.exec.kafka_trigger.success_number'),
            min: 0,
            max: 250,
            interval: 50,
            axisLabel: {
              formatter: '{value}次',
            },
          },
          {
            type: 'value',
            name: t('workflow.overview.exec.kafka_trigger.success_rate'),
            min: 0,
            max: 100,
            interval: 20,
            axisLabel: {
              formatter: '{value}%',
            },
          },
        ],
        series: [
          {
            name: 'successCount',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value) {
                return value + '';
              },
            },
            data: strategyCharData.map((c) => {
              return c.successCount;
            }),
          },
          {
            name: 'failCount',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value) {
                return value + '';
              },
            },
            data: strategyCharData.map((c) => {
              return c.failCount;
            }),
          },
          {
            name: 'successRate',
            type: 'line',
            yAxisIndex: 1,
            tooltip: {
              valueFormatter: function (value) {
                return value + '';
              },
            },
            data: strategyCharData.map((c) => {
              return c.successCount / c.count || 0;
            }),
          },
        ],
      });
    }
  }, [strategyPreviewData]);
  return (
    <Card
      title={t('workflow.overview.exec.webhook_trigger.overview')}
      bordered={true}
      style={{ width: '100%', border: '1px solid #000' }}
    >
      <Row style={{ padding: '0 24px' }}>
        <Col flex="140px">
          <Row>
            <Col>
              <Statistic
                title={t('workflow.overview.exec.webhook_trigger.today')}
                value={strategyPreviewData['todayTimes'] || 0}
                style={{ marginBottom: 24 }}
              />
            </Col>
            <Col style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 30, left: 14 }}>
                <ArrowUpOutlined style={{ color: '#87d068' }} />
              </div>
              <div style={{ position: 'absolute', bottom: 30, left: 28 }}>
                <span style={{ color: '#87d068' }}>{strategyPreviewData['growthRate'] || 0}%</span>
              </div>
            </Col>
          </Row>
          <Col span={24}>
            <Statistic title={t('workflow.overview.exec.webhook_trigger.total')} value={strategyPreviewData['cumulativeTimes'] || 0} />
          </Col>
        </Col>
        <Col flex="1">
          {echartOption['series'] ? (
            <ReactEcharts
              option={echartOption}
              style={{ height: '100%', width: '100%', minHeight: 250 }}
            />
          ) : (
            ''
          )}
        </Col>
      </Row>
    </Card>
  );
};
export default Index;

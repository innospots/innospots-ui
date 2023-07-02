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

import React, { useEffect } from 'react';
import { Card, Row, Select, Col } from 'antd';
import styles from './index.less';
import { useMemoizedFn } from 'ahooks';
import * as echarts from 'echarts';
import useI18n from '@/common/hooks/useI18n';

const Index: React.FC = () => {
  const { t } = useI18n('workspace');

  useEffect(() => {
    renderDualAxes();
  }, []);

  const renderDualAxes = useMemoizedFn(() => {
    var chartDom = document.getElementById('container')!;
    var myChart = echarts.init(chartDom);
    var option: EChartsOption;

    option = {
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
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Precipitation',
          min: 0,
          max: 250,
          interval: 50,
          axisLabel: {
            formatter: '{value} ml',
          },
        },
      ],
      series: [
        {
          name: 'Evaporation',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value: number) {
              return value + ' ml';
            },
          },
          data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
        },
        {
          name: 'Precipitation',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value: number) {
              return value + ' ml';
            },
          },
          data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
        },
      ],
    };

    option && myChart.setOption(option);
  });

  return (
    <div className={styles.content}>
      <Card
        title={t('workspace.scheduler.title')}
        extra={
          <Select defaultValue="seven" style={{ width: 100 }}>
            <Select.Option value="seven">{t('workspace.job_preview.select.seven_day')}</Select.Option>
            <Select.Option value="one">{t('workspace.job_preview.select.one_day')}</Select.Option>
          </Select>
        }
      >
        <Row style={{ textAlign: 'center' }}>
          <Col span={8}>
            <span className={styles.label}>{t('workspace.scheduler.scheduled')}</span>
            <div className={styles.value}>12</div>
          </Col>
          <Col span={8}>
            <span className={styles.label}>{t('workspace.scheduler.completed')}</span>
            <div className={styles.value}>138</div>
          </Col>
          <Col span={8}>
            <span className={styles.label}>{t('workspace.scheduler.failed')}</span>
            <div className={styles.value}>0</div>
          </Col>
        </Row>
        <div
          id="container"
          className={styles.lineBar}
          style={{ height: '267px', marginTop: -24 }}
        />
      </Card>
    </div>
  );
};
export default Index;

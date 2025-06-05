import React, { useEffect, useState } from 'react';
import { history, useParams } from 'umi';
import { useRequest } from 'ahooks';
import { Tabs, Row, Col, Spin, Button, Form, Input, message, Divider, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import PageHelmet from '@/components/PageHelmet';
import PageLoading from '@/components/PageLoading';

import { fetchScheduleJobExecutionDetail } from '@/services/ScheduleJob';

import Overview from './Overview';

import styles from './styles.less';

interface ScheduleJobExecutionDetail {
  jobName: string;
}

const { Title } = Typography;

const JobExecutionDetail: React.FC = () => {
  const { executionId } = useParams<{ executionId: string }>();
  const { t, loading: i18nLoading } = useI18n(['schedule', 'common']);

  

  const detailRequest = useRequest(
    (params: { executionId: string }) => fetchScheduleJobExecutionDetail(params.executionId),
    {
      manual: true
    }
  );

  const executionDetail = detailRequest.data as ScheduleJobExecutionDetail;
  const jobName = executionDetail?.jobName;

  useEffect(() => {
    detailRequest.run({ executionId });
  }, [executionId]);

  const renderHeader = () => {
    return (
      <div className={styles.header}>
        <Row align="middle">
          <Col>
            <Divider type="vertical" style={{ backgroundColor: '#999' }} />
          </Col>
          <Col>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => history.replace('/schedule/execution')} />
          </Col>
          <Col>
            {
              detailRequest.loading ? (
                <Spin size="small" />
              ) : (
                <Title level={5} style={{marginBottom: 0}}>
                  {jobName}
                </Title>
              )
            }
          </Col>
        </Row>
      </div>
    );
  };

  const renderTabChildren = (key: string) => {
    let children: any = null;
    switch (key) {
      case 'Overview':
        children = <Overview data={executionDetail} />;
        break;
      default:
        break;
    }
    return (
      <div className={styles.tabContent}>
        {children}
      </div>
    );
  }

  const renderContent = () => {
    const tabItems = [
      {
        key: 'Overview',
        label: 'Schedule Overview',
      }
    ].map((item) => ({
      ...item,
      children: renderTabChildren(item.key)
    }));
    return (
      <div className={styles.tabs}>
        <Tabs items={tabItems} tabBarStyle={{ borderColor: 'transparent' }} />
      </div>
    )
  }

  if (detailRequest.loading || i18nLoading) {
    return <PageLoading />;
  }

  return (
    <div className={styles.container}>
      <PageHelmet title={(jobName ? (jobName + ' - ') : '') + t('schedule.job_execution.detail.heading_title')} />
      {renderHeader()}
      {renderContent()}
    </div>
  );
};

export default JobExecutionDetail;

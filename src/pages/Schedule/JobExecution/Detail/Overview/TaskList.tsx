import React from 'react';
import { Table, Typography } from 'antd';

import { KeyValues } from '@/common/types/Types';
import useI18n from '@/common/hooks/useI18n';
import ListTable from '@/components/ListTable';
import StatusTag from '@/components/StatusTag';

const { Title } = Typography;

const TaskList: React.FC<{
  data: any
}> = ({ data }) => {
  const { t, loading: i18nLoading } = useI18n(['schedule', 'common']);

  const onPageChange = () => {}

  const renderList = () => {
    const columns: KeyValues[] = [
      {
        title: t('schedule.column.execution_id'),
        width: 120,
        fixed: 'left',
        dataIndex: 'executionId',
      },
      {
        title: t('schedule.column.schedule_key'),
        width: 120,
        dataIndex: 'scheduleKey',
      },
      {
        title: t('schedule.column.job_key'),
        width: 120,
        dataIndex: 'jobKey',
      },
      {
        title: t('schedule.column.job_name'),
        width: 120,
        dataIndex: 'jobName',
      },
      {
        title: t('schedule.column.job_type'),
        width: 120,
        dataIndex: 'jobType',
        render: (jobType: string) => t(`schedule.job_type.${jobType}`),
      },
      {
        title: t('schedule.column.execution_status'),
        width: 100,
        dataIndex: 'executionStatus',
        render: (status: string) => <StatusTag status={status} />,
      },
      {
        title: t('schedule.column.percent'),
        width: 100,
        dataIndex: 'percent',
        render: (percent: number) => `${percent}%`,
      },
      {
        title: t('schedule.column.sub_job_count'),
        width: 100,
        dataIndex: 'subJobCount',
      },
      {
        title: t('schedule.column.start_time'),
        width: 160,
        dataIndex: 'startTime',
      },
      {
        title: t('schedule.column.end_time'),
        width: 160,
        dataIndex: 'endTime',
      },
      {
        title: t('schedule.column.message'),
        width: 200,
        dataIndex: 'message',
      },
      {
        title: t('common.table.column.action'),
        width: 110,
        fixed: 'right',
        align: 'center',
        render: (_: any, record: any) => (
          <div>1</div>
        ),
      },
    ];

    return (
      <ListTable
        columns={columns}
        rowKey="executionId"
        loading={false}
        pagination={false}
        scroll={{ x: 'max-content' }}
        dataSource={data?.subExecutions}
        expandable={{
          childrenColumnName: 'subExecutions',
        }}
        onPageChange={onPageChange}
      />
    );
  };
  return (
    <div>
      <Title level={5}>Task List</Title>
      { renderList() }
    </div>
  );
};

export default TaskList;

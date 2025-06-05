import React, { useState } from 'react';
import { Space, Input, Form, Button, DatePicker, message } from 'antd';
import { useModel, history } from 'umi';
import { useDeepCompareEffect } from 'ahooks';
import { PauseCircleOutlined, RedoOutlined, PlayCircleOutlined, NodeIndexOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import { KeyValues } from '@/common/types/Types';
import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import IconButton from '@/components/IconButton';
import StatusTag from '@/components/StatusTag';
import PageLoading from '@/components/PageLoading';
import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

const defaultQueryData = {
  ...DEFAULT_PAGINATION_SETTINGS,
  sort: undefined,
};

const JobExecution: React.FC = () => {
  const { t, loading: i18nLoading } = useI18n(['schedule', 'common']);
  const {
    jobExecutionData,
    jobExecutionPageRequest,
    stopExecutionRequest,
    retryExecutionRequest,
    continueExecutionRequest,
  } = useModel('JobExecution', (model) => ({
    jobExecutionData: model.jobExecutionData,
    jobExecutionPageRequest: model.jobExecutionPageRequest,
    stopExecutionRequest: model.stopExecutionRequest,
    retryExecutionRequest: model.retryExecutionRequest,
    continueExecutionRequest: model.continueExecutionRequest,
  }));

  const [form] = Form.useForm();
  const [queryData, setQueryData] = useState({
    ...defaultQueryData,
  });

  useDeepCompareEffect(() => {
    jobExecutionPageRequest.run(queryData);
  }, [queryData]);

  const onPageChange = (page: number, size: number) => {
    setQueryData({
      ...queryData,
      page,
      size,
    });
  };

  const stopExecution = async (jobExecutionId: string) => {
    try {
      const result = await stopExecutionRequest.runAsync(jobExecutionId);
      if (result) {
        jobExecutionPageRequest.run(queryData);
      } else {
        message.error(t('common.notification.fail.title'));
      }
    } catch (error) {
    }
  };

  const continueExecution = async (jobExecutionId: string) => {
    try {
      const result = await continueExecutionRequest.runAsync(jobExecutionId);
      if (result) {
        jobExecutionPageRequest.run(queryData);
      } else {
        message.error(t('common.notification.fail.title'));
      }
    } catch (error) {
    }
  };

  const retryExecution = async (jobExecutionId: string) => {
    try {
      const result = await retryExecutionRequest.runAsync(jobExecutionId);
      if (result) {
        jobExecutionPageRequest.run(queryData);
      } else {
        message.error(t('common.notification.fail.title'));
      }
    } catch (error) {
    }
  };

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
    // {
    //   title: t('schedule.column.server_key'),
    //   width: 120,
    //   dataIndex: 'serverKey',
    // },
    // {
    //   title: t('schedule.column.success_count'),
    //   width: 100,
    //   dataIndex: 'successCount',
    // },
    // {
    //   title: t('schedule.column.fail_count'),
    //   width: 100,
    //   dataIndex: 'failCount',
    // },
    {
      title: t('common.table.column.action'),
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_: any, record: any) => (
        <Space>
          <IconButton icon="eye" tooltip={t('common.tooltip.view')} onClick={() => {
            history.push(`/schedule/execution/detail/${record.executionId}`);
          }} />
          {
            record.executionStatus === 'RUNNING' && (
              <IconButton
                icon={<PauseCircleOutlined />}
                tooltip={t('common.tooltip.pause')}
                popConfirm={{
                  placement: 'topRight',
                  title: t('schedule.job_execution.stop_confirmation'),
                  onConfirm: () => stopExecution(record.executionId),
                  okText: t('common.button.confirm'),
                  cancelText: t('common.button.cancel'),
                  okButtonProps: {
                    loading: stopExecutionRequest.loading,
                  },
                }}
              />
            )
          }
          {
            record.executionStatus === 'FAILED' && (
              <IconButton
                icon={<RedoOutlined />}
                tooltip={t('common.tooltip.retry')}
                popConfirm={{
                  placement: 'topRight',
                  title: t('schedule.job_execution.retry_confirmation'),
                  onConfirm: () => retryExecution(record.executionId),
                  okText: t('common.button.confirm'),
                  cancelText: t('common.button.cancel'),
                  okButtonProps: {
                    loading: retryExecutionRequest.loading,
                  },
                }}
              />
            )
          }
          {
            record.executionStatus === 'STOPPED' && (
              <IconButton
                icon={<PlayCircleOutlined />}
                tooltip={t('common.tooltip.run')}
                popConfirm={{
                  placement: 'topRight',
                  title: t('schedule.job_execution.continue_confirmation'),
                  onConfirm: () => continueExecution(record.executionId),
                  okText: t('common.button.confirm'),
                  cancelText: t('common.button.cancel'),
                  okButtonProps: {
                    loading: continueExecutionRequest.loading,
                  },
                }}
              />
            )
          }
          <IconButton icon={<NodeIndexOutlined />} tooltip={t('schedule.job_execution.job_flow')} onClick={() => {}} />
        </Space>
      ),
    },
  ];

  const onSearch = (values: any) => {
    ['startTime', 'endTime'].forEach((key) => {
      if (values[key]) {
        values[key] = values[key].format('YYYY-MM-DD HH:mm:ss');
      }
    });
    setQueryData({
      ...queryData,
      ...values,
    });
  };

  const renderRightContent = () => {
    return (
      <Form form={form} layout="inline" onFinish={onSearch}>
        <Form.Item name="startTime">
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder={t('schedule.column.start_time')} />
        </Form.Item>
        <Form.Item name="endTime">
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder={t('schedule.column.end_time')} />
        </Form.Item>
        <Form.Item name="jobName">
          <Input placeholder={t('schedule.column.job_name')} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {t('common.button.search')}
          </Button>
        </Form.Item>
        <Form.Item>
          <Button onClick={() => {
            form.resetFields();
            setQueryData({
              ...defaultQueryData,
            });
          }}>
            {t('common.button.reset')}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      <PageTitle
        title={t('schedule.job_execution.page_title')}
        rightContent={renderRightContent()}
      />
      <ListTable
        columns={columns}
        rowKey="executionId"
        dataSource={jobExecutionData?.list || []}
        loading={jobExecutionPageRequest.loading}
        pagination={jobExecutionData?.pagination}
        scroll={{ x: 'max-content' }}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default JobExecution;

import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Space, message, Form, Select, Input, Button } from 'antd';
import { RollbackOutlined, ContainerOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import { KeyValues } from '@/common/types/Types';
import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import IconButton from '@/components/IconButton';
import PageLoading from '@/components/PageLoading';

import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

import JobQueueDrawer, { DRAWER_NAME } from '../components/JobQueueDrawer';

const JobQueue: React.FC = () => {
  const { t, loading: i18nLoading } = useI18n(['schedule', 'common']);
  const [drawer] = useModal(DRAWER_NAME);

  const [form] = Form.useForm();

  const {
    jobQueueData,
    jobQueuePageRequest,
    updateJobQueueStatusRequest,
  } = useModel('JobQueue', model => ({
    jobQueueData: model.jobQueueData,
    jobQueuePageRequest: model.jobQueuePageRequest,
    updateJobQueueStatusRequest: model.updateJobQueueStatusRequest,
  }));

  const [queryData, setQueryData] = useState({
    ...DEFAULT_PAGINATION_SETTINGS,
  });

  useEffect(() => {
    loadData();
  }, [queryData]);

  const loadData = () => {
    jobQueuePageRequest.run(queryData);
  };

  const columns: KeyValues[] = [
    {
      title: t('schedule.column.job_ready_key'),
      width: 160,
      fixed: 'left',
      align: 'center',
      dataIndex: 'jobReadyKey',
    },
    {
      title: t('schedule.column.schedule_key'),
      width: 100,
      key: 'scheduleKey',
      dataIndex: 'scheduleKey',
    },
    {
      title: t('schedule.column.job_key'),
      width: 100,
      key: 'jobKey',
      dataIndex: 'jobKey',
    },
    {
      title: t('schedule.column.job_name'),
      width: 120,
      key: 'jobName',
      dataIndex: 'jobName',
    },
    {
      title: t('schedule.column.job_type'),
      width: 120,
      key: 'jobType',
      dataIndex: 'jobType',
      render: (text: string) => {
        return t(`schedule.job_type.${text}`);
      },
    },
    {
      title: t('schedule.column.group_key'),
      width: 100,
      key: 'groupKey',
      dataIndex: 'groupKey',
      render: (text: string) => text || '-',
    },
    {
      title: t('schedule.column.message_status'),
      width: 100,
      key: 'messageStatus',
      dataIndex: 'messageStatus',
      render: (text: string) => text ? t(`schedule.message_status.${text}`) : '-',
    },
    {
      title: t('common.table.column.action'),
      width: 100,
      key: 'action',
      fixed: 'right',
      dataIndex: 'action',
      align: 'center',
      render: (_: any, record: any) => {
        return (
          <Space>
            <IconButton
              icon="eye"
              tooltip={t('common.tooltip.view')}
              onClick={() => drawer.show({ ...record, type: 'view' })}
            />
            <IconButton
              icon={<RollbackOutlined />}
              tooltip={t('common.tooltip.revoke')}
              popConfirm={{
                title: t('schedule.confirm.is_revoke'),
                onConfirm: async () => {
                  try {
                    await updateJobQueueStatusRequest.run(record.jobReadyKey, 'CANCELLED');
                    message.success(t('common.message.update_success'));
                    loadData();
                  } catch (error) {
                    message.error(t('common.message.update_failed'));
                  }
                }
              }}
            />
            <IconButton
              icon={<ContainerOutlined />}
              tooltip={t('schedule.tooltip.execution_details')}
            />
          </Space>
        );
      },
    },
  ];

  const onSearch = (values: any) => {
    setQueryData({
      ...queryData,
      ...values,
    });
  };

  const renderTopRightContent = () => {
    const statusOptions = [
      'DELETED',
      'CANCEL',
      'ASSIGNED',
      'READ',
      'UNREAD',
    ].map(status => ({
      label: t(`schedule.message_status.${status}`),
      value: status,
    }));
    return (
      <Form form={form} layout="inline" onFinish={onSearch}>
        <Form.Item name="scheduleStatus">
          <Select allowClear options={statusOptions} style={{ width: 200 }} placeholder={t('schedule.jobQueue.search.status.placeholder')} />
        </Form.Item>
        <Form.Item name="jobName">
          <Input allowClear placeholder={t('schedule.jobQueue.search.job_name.placeholder')} />
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
              ...DEFAULT_PAGINATION_SETTINGS,
            });
          }}>
            {t('common.button.reset')}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const renderPageHeader = () => {
    return (
      <PageTitle
        title={t('schedule.jobQueue.page_title')}
        rightContent={renderTopRightContent()}
      />
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      {renderPageHeader()}
      <ListTable
        rowKey="jobReadyKey"
        columns={columns}
        loading={jobQueuePageRequest.loading}
        dataSource={jobQueueData.list || []}
        scroll={{ x: 'max-content' }}
        pagination={{
          total: jobQueueData.pagination?.total,
          current: queryData.page,
          pageSize: queryData.size,
          onChange: (page: number, size: number) => {
            setQueryData({ 
              ...queryData,
              page, 
              size });
          },
        }}
      />
      <JobQueueDrawer />
    </div>
  );
};

export default JobQueue;
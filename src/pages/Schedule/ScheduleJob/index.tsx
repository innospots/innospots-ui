import { PlusOutlined, RocketOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Button, Col, Input, message, Row, Select, Space } from 'antd';
import React, { useEffect, useMemo } from 'react';
import { useModel } from 'umi';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';
import { KeyValues } from '@/common/types/Types';
import IconButton from '@/components/IconButton';
import ListTable from '@/components/ListTable';
import PageLoading from '@/components/PageLoading';
import PageTitle from '@/components/PageTitle';
import StatusTag, { Status } from '@/components/StatusTag';

import ScheduleJobDrawer, {
  DRAWER_NAME,
} from '../components/ScheduleJobDrawer';
import ScheduleJobExecuteModal, { MODAL_NAME } from './ExecuteModal';

import styles from '../style.less';

import { JOB_TYPES } from '../config';

const ScheduleJob: React.FC = () => {
  const { t, loading: i18nLoading } = useI18n(['schedule', 'common']);
  const [drawer] = useModal(DRAWER_NAME);
  const [executeModal] = useModal(MODAL_NAME);

  const {
    scheduleJobData,
    executeJobRequest,
    scheduleJobPageRequest,
    deleteScheduleJobRequest,
    updateScheduleJobStatusRequest,
  } = useModel('ScheduleJob', (model) => ({
    scheduleJobData: model.scheduleJobData,
    executeJobRequest: model.executeJobRequest,
    scheduleJobPageRequest: model.scheduleJobPageRequest,
    deleteScheduleJobRequest: model.deleteScheduleJobRequest,
    updateScheduleJobStatusRequest: model.updateScheduleJobStatusRequest,
  }));

  const [queryData, setQueryData] = useSetState({
    ...DEFAULT_PAGINATION_SETTINGS,
    jobName: '',
    jobType: undefined,
  });

  useEffect(() => {
    loadData();
  }, [queryData]);

  const jobTypeOptions = useMemo(() => {
    return JOB_TYPES.map((type) => ({
      value: type,
      label: t(`schedule.job_type.${type}`),
    }));
  }, [t]);

  const loadData = () => {
    scheduleJobPageRequest.run(queryData);
  };

  const handleDelete = async (jobKey: string) => {
    try {
      const result = await deleteScheduleJobRequest.runAsync(jobKey);
      if (result) {
        loadData();
        message.success(t('common.notification.success.title'));
      }
    } catch (error) {}
  };

  const updateStatus = (record: any, status: string) => () => {
    return new Promise<void>(async (resolve) => {
      if (record) {
        const result = await updateScheduleJobStatusRequest.runAsync(
          record.scheduleKey,
          status,
        );
        if (result) {
          loadData();
          message.success(t('common.error_message.save.success'));
        }
      }

      resolve();
    });
  };

  const columns: KeyValues[] = [
    {
      title: t('schedule.column.schedule_key'),
      width: 140,
      fixed: 'left',
      align: 'center',
      dataIndex: 'scheduleKey',
    },
    {
      title: t('schedule.column.job_key'),
      width: 140,
      dataIndex: 'jobKey',
    },
    {
      title: t('schedule.column.job_name'),
      dataIndex: 'jobName',
    },
    {
      title: t('schedule.column.job_type'),
      dataIndex: 'jobType',
      render: (jobType: string) => {
        return t(`schedule.job_type.${jobType}`);
      },
    },
    {
      title: t('schedule.column.schedule_mode'),
      width: 140,
      dataIndex: 'scheduleMode',
      render: (scheduleMode: string) => {
        return t(`schedule.schedule_mode.${scheduleMode}`);
      },
    },
    {
      title: t('schedule.column.schedule_status'),
      dataIndex: 'scheduleStatus',
      width: 100,
      render: (status: Status) => <StatusTag status={status} />,
    },
    // {
    //   title: t('schedule.column.run_time'),
    //   dataIndex: 'runTime',
    // },
    {
      width: 120,
      title: t('schedule.column.updated_time'),
      dataIndex: 'updatedTime',
    },
    {
      title: t('common.table.column.action'),
      width: 140,
      fixed: 'right',
      dataIndex: 'action',
      align: 'center',
      render: (_: any, record: any) => {
        return (
          <Space>
            <IconButton
              icon={<RocketOutlined />}
              tooltip={t('schedule.column.tooltip.execute')}
              onClick={() =>
                executeModal.show({ scheduleKey: record.scheduleKey })
              }
            />
            <IconButton
              icon="eye"
              tooltip={t('common.tooltip.view')}
              onClick={() => drawer.show({ ...record, type: 'view' })}
            />
            <IconButton
              icon="edit"
              tooltip={t('common.tooltip.edit')}
              onClick={() => drawer.show({ ...record, type: 'edit' })}
            />
            {record.scheduleStatus === 'OFFLINE' ? (
              <IconButton
                icon="play"
                tooltip={t('common.text.activate')}
                popConfirm={{
                  title: t('schedule.tooltip.activate'),
                  onConfirm: updateStatus(record, 'ONLINE'),
                  okButtonProps: {
                    loading: updateScheduleJobStatusRequest.loading,
                  },
                }}
                permissions=""
              />
            ) : (
              <IconButton
                icon="pause"
                tooltip={t('common.text.deactivate')}
                popConfirm={{
                  title: t('schedule.tooltip.deactivate'),
                  onConfirm: updateStatus(record, 'OFFLINE'),
                  okButtonProps: {
                    loading: updateScheduleJobStatusRequest.loading,
                  },
                }}
                permissions=""
              />
            )}
            <IconButton
              icon="delete"
              tooltip={t('common.tooltip.delete')}
              popConfirm={{
                placement: 'bottomRight',
                title: t('common.text.delete_confirmation'),
                onConfirm: () => handleDelete(record.scheduleKey),
              }}
            />
          </Space>
        );
      },
    },
  ];

  const onListPageChange = (page: number, size: number) => {
    setQueryData({
      ...queryData,
      page,
      size,
    });
  };

  const renderPageHeader = () => {
    return (
      <>
        <PageTitle
          title={t('schedule.job.page_title')}
          rightContent={
            <Row gutter={16}>
              <Col>
                <Select
                  allowClear
                  value={queryData.jobType}
                  options={jobTypeOptions}
                  placeholder={t('schedule.search.mode_placeholder')}
                  onChange={(value: any) =>
                    setQueryData({ ...queryData, page: 1, jobType: value })
                  }
                />
              </Col>
              <Col>
                <Input.Search
                  placeholder={t('schedule.search.text_placeholder')}
                  onSearch={(value) =>
                    setQueryData({ ...queryData, page: 1, jobName: value })
                  }
                />
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => drawer.show()}
                >
                  {t('common.button.create')}
                </Button>
              </Col>
            </Row>
          }
        />
      </>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      {renderPageHeader()}
      <ListTable
        rowKey="scheduleKey"
        columns={columns}
        loading={scheduleJobPageRequest.loading}
        dataSource={scheduleJobData.list || []}
        scroll={{ x: 'max-content' }}
        pagination={scheduleJobData.pagination}
        onPageChange={onListPageChange}
      />
      <ScheduleJobDrawer onSuccess={loadData} />
      <ScheduleJobExecuteModal onSuccess={loadData} />
    </div>
  );
};

export default ScheduleJob;

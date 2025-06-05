import React from 'react';
import { Drawer, Form, Input } from 'antd';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

export const DRAWER_NAME = 'JobQueueDrawer';

const JobQueueDrawer: React.FC = () => {
  const { t } = useI18n(['jobQueue', 'common']);
  const [form] = Form.useForm();
  const [drawer, drawerInfo] = useModal(DRAWER_NAME);
  const { visible, initValues = {} } = drawerInfo;

  return (
    <Drawer
      width={600}
      open={visible}
      onClose={drawer.hide}
      title={t('common.button.view')}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initValues}
        disabled={true}
      >
        <Form.Item
          name="jobReadyKey"
          label={t('schedule.column.job_ready_key')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="scheduleKey"
          label={t('schedule.column.schedule_key')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="jobName"
          label={t('schedule.column.job_name')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="jobType"
          label={t('schedule.column.job_type')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="serverKey"
          label={t('schedule.column.server_key')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="groupKey"
          label={t('schedule.column.group_key')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default JobQueueDrawer;
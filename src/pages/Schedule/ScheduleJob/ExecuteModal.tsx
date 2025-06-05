import { Modal, message } from 'antd';
import { useModel } from 'umi';
import { useState, useEffect } from 'react';

import useModal from '@/common/hooks/useModal';
import useI18n from '@/common/hooks/useI18n';
import JobParams, { KeyValuePair } from '../components/ScheduleJobDrawer/JobParams';

export const MODAL_NAME = 'ScheduleJobExecuteModal';

const ScheduleJobExecuteModal: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, initValues } = modalInfo;

  const { executeJobRequest } = useModel('ScheduleJob', (model) => ({
    executeJobRequest: model.executeJobRequest,
  }));

  const { t } = useI18n(['common', 'schedule']);

  const [jobParams, setJobParams] = useState<KeyValuePair[]>([]);

  useEffect(() => {
    setJobParams([]);
  }, [visible]);

  const executeJob = async () => {
    try {
      const postData = jobParams.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      const result = await executeJobRequest.runAsync(initValues?.scheduleKey, postData);
      if (result) {
        onSuccess();
        modal.hide();
        message.success(t('schedule.execute_job.succeeded'));
      } else {
        message.error(t('schedule.execute_job.failed'));
      }
    } catch (error) {}
  };

  const handleOk = () => {
    executeJob();
  };

  const handleCancel = () => {
    modal.hide();
  };

  const renderContent = () => {
    return (
      <div>
        <JobParams value={jobParams} title={t('schedule.execute_job.job_params.title')} onChange={setJobParams} />
      </div>
    );
  };

  return (
    <Modal
      title={t('schedule.execute_job.title')}
      width={600}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={executeJobRequest.loading}
    >
      {renderContent()}
    </Modal>
  );
};

export default ScheduleJobExecuteModal;

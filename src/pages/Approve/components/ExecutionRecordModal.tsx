import React from 'react';

import useI18n from '@/common/hooks/useI18n';
import NiceModal, { NiceModalProps } from '@/components/Nice/NiceModal';

import ExecutionRecords from './ExecutionRecords';

const ExecutionRecordModal: React.FC<{ listType?: string, approveInstanceKey: any } & NiceModalProps> = ({
  listType,
  approveInstanceKey,
  ...rest
}) => {
  const { t, loading: i18nLoading } = useI18n(['common', 'approve']);

  const renderRecordList = () => {
    return (
      <ExecutionRecords listType={listType} approveInstanceKey={approveInstanceKey} />
    );
  };

  return (
    <NiceModal
      width={'80%'}
      title={t('approve.text.execution_record')}
      visible={!!approveInstanceKey}
      okButtonProps={{ hidden: true }}
      cancelButtonProps={{ hidden: true }}
      {...rest}
    >
      {renderRecordList()}
    </NiceModal>
  );
};

export default ExecutionRecordModal;

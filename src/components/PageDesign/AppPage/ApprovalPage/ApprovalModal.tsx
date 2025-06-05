import React, { useState } from 'react';
import { Modal, Input, Button } from 'antd';

import useI18n from '@/common/hooks/useI18n';

type CustomModalProps = {
  title: string;
  visible: boolean;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (auditInfo: string) => void;
};

const ApprovalModal: React.FC<CustomModalProps> = ({ title, visible, loading, onCancel, onSubmit }) => {
  const [auditInfo, setAuditInfo] = useState('');

  const { t, loading: i18nLoading } = useI18n(['common', 'approve']);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAuditInfo(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(auditInfo);
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} className="mr-2">
          {t('common.button.cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {t('common.button.submit')}
        </Button>,
      ]}
    >
      <p className="mb-2">{t('approve.auditInfo.title')} <span style={{ color: '#999', fontSize: '12px' }}>({t('approve.auditInfo.message')})</span></p>
      <Input.TextArea
        value={auditInfo}
        onChange={handleInputChange}
        maxLength={100}
        placeholder={t('approve.auditInfo.placeholder')}
        rows={4}
      />
    </Modal>
  );
};

export default ApprovalModal;

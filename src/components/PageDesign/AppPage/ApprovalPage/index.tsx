import _ from 'lodash';
import { FormInstance } from 'antd/es/form';
import { message, Typography } from 'antd';
import { history, useModel, useSearchParams } from 'umi';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import PageHelmet from '@/components/PageHelmet';
import useI18n from '@/common/hooks/useI18n';

import {
  startApprove,
  revokeApprove,
  approveAudit,
  rejectAudit,
  reeditApprove,
  fetchApproveInfo,
  saveApproveProposer,
  fetchApproveAuditInfo,
} from '@/services/Approve';

import PageLoading from '@/components/PageLoading';
import ExecutionRecords from '@/pages/Approve/components/ExecutionRecords';

import { AppPageInfo } from '../Types';
import FormPage from '../FormPage';
import Header from './Header';
import ApprovalModal from './ApprovalModal';

import styles from './style.less';

export type pageType = 'create' | 'detail' | 'audit' | 'record';

const { Title } = Typography;

type ApprovalPageProps = {
  appInfo: AppPageInfo;
  pageType?: pageType;
};

const reloadPage = (delay: number = 1500) => {
  setTimeout(() => {
    window.location.reload();
  }, delay);
};

const ApprovalPage: React.FC<ApprovalPageProps> = ({ appInfo, pageType }) => {
  const formInstanceRef = useRef<FormInstance | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [reeditLoading, setReeditLoading] = useState(false);
  const [approveInfo, setApproveInfo] = useState<any>(null);
  const [widgetType, setWidgetType] = useState<string>('view');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [handleModalSubmit, setHandleModalSubmit] = useState<((auditInfo: string) => void) | null>(
    null,
  );
  const [isModalLoading, setIsModalLoading] = useState(false);

  const { t, loading: i18nLoading } = useI18n(['common', 'approve']);

  const { setIsAudited } = useModel('App', (model) => ({
    setIsAudited: model.setIsAudited,
  }));

  const [searchParams] = useSearchParams();

  const getApproveInfo = useCallback(async (aik: string) => {
    const result = await fetchApproveInfo(aik);
    if (result) {
      setApproveInfo(result);
    }
  }, []);

  const getApproveAuditInfo = useCallback(async (aik: string) => {
    const result = await fetchApproveAuditInfo(aik);
    if (result) {
      setApproveInfo(result);
    }
    setIsModalVisible(false);
  }, []);

  useEffect(() => {
    const aik = searchParams.get('aik');
    if (aik) {
      if (['detail', 'record', 'list-detail'].includes(pageType || '')) {
        getApproveInfo(aik);
      } else if (pageType === 'audit') {
        getApproveAuditInfo(aik);
      }
      setIsAudited(false);
    }
  }, [searchParams.get('aik'), pageType]);

  useEffect(() => {
    if (approveInfo && formInstanceRef.current) {
      formInstanceRef.current.setFieldsValue(approveInfo.formData);
    }
  }, [approveInfo, formInstanceRef.current]);

  useEffect(() => {
    if (pageType === 'create') {
      setWidgetType('create');
    } else {
      setWidgetType('view');
    }
  }, [pageType]);

  const getFormInstance = (form: FormInstance) => {
    formInstanceRef.current = form;
  };

  const saveApprove = async () => {
    try {
      setSubmitLoading(true);
      const formData = await formInstanceRef.current?.validateFields();
      if (formData) {
        const appKey = appInfo.appKey;
        const appName = appInfo.name;
        const pageConfig = appInfo.resources.pages[0].configs || {};
        const tableKey = pageConfig.table.value;
        const approveType = pageConfig.approveType;
        const regItem = _.find(
          appInfo.resources.registries,
          (item) => item.registryId === tableKey,
        );
        if (regItem) {
          const flowKey = regItem.code;
          const postData: any = {
            appKey,
            appName,
            flowKey,
            formData,
            approveType,
          };

          if (approveInfo?.approveInstanceKey) {
            postData.approveInstanceKey = approveInfo.approveInstanceKey;
          }
          const result = await saveApproveProposer(postData);
          if (result?.approveInstanceKey) {
            message.success(t('common.message.saveSuccess'));
            setApproveInfo(result);
            setWidgetType('view');
            history.replace(`/approve/page/detail/${appKey}?aik=${result.approveInstanceKey}`);
          }
        }
      }
    } catch (error) {
      message.error(t('common.message.saveFailed'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const doStartApprove = async (approveInstanceKey: string) => {
    try {
      setIsApproving(true);
      const result = await startApprove(approveInstanceKey);
      if (result) {
        message.success(t('approve.message.approveSuccess'));
        // setApproveInfo(result);
        reloadPage();
      }
    } catch (error) {
      message.error(t('approve.message.approveFailed'));
    } finally {
      setIsApproving(false);
    }
  };

  const doRevokeApprove = async (approveInstanceKey: string) => {
    try {
      setIsRevoking(true);
      const result = await revokeApprove(approveInstanceKey);
      if (result) {
        message.success(t('approve.message.revokeSuccess'));
        // getApproveInfo(approveInstanceKey);
        reloadPage();
      }
    } catch (error) {
      message.error(t('approve.message.revokeFailed'));
    } finally {
      setIsRevoking(false);
    }
  };

  const onSave = useCallback(() => {
    if (formInstanceRef.current) {
      saveApprove();
    }
  }, [formInstanceRef.current, approveInfo]);

  const onEdit = useCallback(() => {
    setWidgetType('create');
  }, []);

  const onRevoke = useCallback(() => {
    if (approveInfo?.approveInstanceKey) {
      doRevokeApprove(approveInfo.approveInstanceKey);
    }
  }, [approveInfo?.approveInstanceKey]);

  const onCancel = useCallback(() => {
    if (formInstanceRef.current && approveInfo?.formData) {
      formInstanceRef.current.setFieldsValue(approveInfo.formData);
    }
    setWidgetType('view');
  }, [formInstanceRef.current, approveInfo?.formData]);

  const onSubmit = useCallback(() => {
    if (approveInfo?.approveInstanceKey) {
      doStartApprove(approveInfo.approveInstanceKey);
    }
  }, [approveInfo]);

  const onReedit = useCallback(async () => {
    if (approveInfo?.approveInstanceKey) {
      try {
        setReeditLoading(true);
        const result = await reeditApprove(approveInfo.approveInstanceKey);
        if (result) {
          // setWidgetType('create');
          getApproveInfo(approveInfo.approveInstanceKey);
        }
      } catch (error) {
      } finally {
        setReeditLoading(false);
      }
    }
  }, [approveInfo?.approveInstanceKey]);

  const showApprovalModal = (title: string, onSubmit: (auditInfo: string) => void) => {
    setModalTitle(title);
    setHandleModalSubmit(() => async (auditInfo) => {
      try {
        setIsModalLoading(true);
        await onSubmit(auditInfo);
      } finally {
        setIsModalLoading(false);
      }
    });
    setIsModalVisible(true);
  };

  const handleApproveAudit = async (approveInstanceKey: string, auditInfo: string) => {
    try {
      const result = await approveAudit(approveInstanceKey, auditInfo);
      if (result) {
        message.success(t('approve.message.operationSuccess'));
        setIsAudited(true);
        // getApproveAuditInfo(approveInstanceKey);
        reloadPage();
      }
    } catch (error) {
      message.error(t('approve.message.operationFailed'));
    }
  };

  const handleRejectAudit = async (approveInstanceKey: string, auditInfo: string) => {
    try {
      const result = await rejectAudit(approveInstanceKey, auditInfo);
      if (result) {
        message.success(t('approve.message.operationSuccess'));
        // getApproveAuditInfo(approveInstanceKey);
        reloadPage();
      }
    } catch (error) {
      message.error(t('approve.message.operationFailed'));
    }
  };

  const onApproveAudit = useCallback(() => {
    if (approveInfo?.approveInstanceKey) {
      showApprovalModal(t('approve.approveApproval.title'), (auditInfo) =>
        handleApproveAudit(approveInfo.approveInstanceKey, auditInfo),
      );
    }
  }, [approveInfo?.approveInstanceKey]);

  const onRejectAudit = useCallback(() => {
    if (approveInfo?.approveInstanceKey) {
      showApprovalModal(t('approve.rejectApproval.title'), (auditInfo) =>
        handleRejectAudit(approveInfo.approveInstanceKey, auditInfo),
      );
    }
  }, [approveInfo?.approveInstanceKey]);

  const renderExecutionRecords = () => {
    if (!approveInfo?.approveInstanceKey || widgetType !== 'view' || ['DRAFT'].includes(approveInfo?.approveStatus)) {
      return null;
    }

    return (
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          {t('approve.execution.title')}
        </Title>
        <ExecutionRecords approveInstanceKey={approveInfo?.approveInstanceKey} />
      </div>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <div className={styles.container}>
      <Header
        appInfo={appInfo}
        pageType={pageType}
        isApproving={isApproving}
        isRevoking={isRevoking}
        approveInfo={approveInfo}
        reeditLoading={reeditLoading}
        submitLoading={submitLoading}
        onSave={onSave}
        onEdit={onEdit}
        onCancel={onCancel}
        onRevoke={onRevoke}
        onSubmit={onSubmit}
        onReedit={onReedit}
        onApproveAudit={onApproveAudit}
        onRejectAudit={onRejectAudit}
      />
      <div id="form-page-content" className={styles.content}>
        <FormPage appInfo={appInfo} widgetType={widgetType} getFormInstance={getFormInstance} />
        {renderExecutionRecords()}
      </div>
      <PageHelmet title={appInfo && appInfo.name} />
      <ApprovalModal
        title={modalTitle}
        visible={isModalVisible}
        loading={isModalLoading}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={(auditInfo) => {
          if (handleModalSubmit) handleModalSubmit(auditInfo);
        }}
      />
    </div>
  );
};

export default ApprovalPage;

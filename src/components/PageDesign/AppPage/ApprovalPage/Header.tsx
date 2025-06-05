import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  FormOutlined,
  PrinterOutlined,
  RedoOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { Button, Col, Modal, Row, Typography } from 'antd';
import html2pdf from 'html2pdf.js';
import printJS from 'print-js';
import { useCallback, useEffect, useState } from 'react';
import { history, useModel } from 'umi';

import useI18n from '@/common/hooks/useI18n';
import { getBackPageUrl } from '@/pages/Approve/utils';

import styles from './style.less';

const { confirm } = Modal;
const { Title } = Typography;

let isSaving = false;

const Header = ({
  appInfo,
  pageType,
  isRevoking,
  isApproving,
  reeditLoading,
  submitLoading,
  approveInfo,
  onSave,
  onSubmit,
  onEdit,
  onCancel,
  onRevoke,
  onReedit,
  onApproveAudit,
  onRejectAudit,
}) => {
  const [isEdit, setIsEdit] = useState(false);

  const { t, loading: i18nLoading } = useI18n(['common', 'approve']);

  const { isAudited, hasWidgetProcessing } = useModel('App', (model) => ({
    isAudited: model.isAudited,
    hasWidgetProcessing: model.hasWidgetProcessing,
  }));

  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (!submitLoading && isEdit && isSaving) {
      setIsEdit(false);
      isSaving = false;
    }
  }, [submitLoading, isEdit]);

  const pageBack = () => {
    const backUrl = getBackPageUrl(pageType);
    if (backUrl) {
      history.replace(backUrl);
    } else {
      history.back();
    }
  };

  const onPrint = useCallback(() => {
    try {
      setIsPrinting(true);
      const pageContent = document.getElementById(
        'form-page-content',
      ) as HTMLElement;
      const marginTop = pageContent.style.marginTop;
      pageContent.style.marginTop = '10px';
      setTimeout(async () => {
        const worker = html2pdf();
        const png = await worker.from(pageContent).outputImg('datauri');
        printJS({
          type: 'image',
          base64: true,
          printable: png,
          documentTitle: appInfo.name,
          style: `@media print { body{margin:0}}`,
        });
        setIsPrinting(false);
        pageContent.style.marginTop = marginTop;
      }, 1);
    } catch (e) {
      setIsPrinting(false);
    }
  }, [appInfo?.name]);

  const showConfirm = () => {
    confirm({
      title: t('approve.submitApproval.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('approve.submitApproval.content'),
      onOk() {
        onSubmit && onSubmit();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const handleSave = () => {
    onSave && onSave();
    isSaving = true;
  };

  const handleEdit = () => {
    onEdit && onEdit();
    setIsEdit(true);
  };

  const handleRevoke = () => {
    confirm({
      title: t('approve.revokeApproval.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('approve.revokeApproval.content'),
      onOk() {
        onRevoke && onRevoke();
      },
    });
  };

  const handleCancel = () => {
    confirm({
      title: t('approve.cancelEdit.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('approve.cancelEdit.content'),
      onOk() {
        setIsEdit(false);
        onCancel && onCancel();
      },
    });
  };

  const renderButtons = () => {
    if (isAudited) return null;

    let buttons;
    const approveStatus = approveInfo?.approveStatus;
    const approveButton = (
      <Button
        key="approveButton"
        color="cyan"
        variant="solid"
        icon={<SafetyCertificateOutlined />}
        loading={isApproving}
        disabled={
          !approveInfo?.approveInstanceKey ||
          submitLoading ||
          isEdit ||
          hasWidgetProcessing
        }
        onClick={showConfirm}
      >
        {t('approve.submitApproval.button_text')}
      </Button>
    );

    const saveButton = (
      <Button
        key="saveButton"
        type="primary"
        icon={<SaveOutlined />}
        loading={submitLoading}
        disabled={isApproving || hasWidgetProcessing}
        onClick={handleSave}
      >
        {t('common.button.save')}
      </Button>
    );

    const cancelButton = (
      <Button
        key="cancelButton"
        icon={<CloseOutlined />}
        disabled={isApproving || hasWidgetProcessing}
        onClick={handleCancel}
      >
        {t('common.button.cancel')}
      </Button>
    );

    if (isEdit) {
      buttons = (
        <Row gutter={10}>
          <Col>{saveButton}</Col>
          <Col>{cancelButton}</Col>
          <Col>{approveButton}</Col>
        </Row>
      );
    } else if (pageType === 'create') {
      buttons = (
        <Row gutter={10}>
          <Col>{saveButton}</Col>
          <Col>{approveButton}</Col>
        </Row>
      );
    } else if (
      pageType === 'audit' &&
      ['STARTING', 'PROCESSING'].includes(approveStatus)
    ) {
      buttons = (
        <Row gutter={10}>
          <Col>
            <Button
              danger
              key="rejectButton"
              icon={<CloseCircleOutlined />}
              onClick={onRejectAudit}
            >
              {t('approve.rejectApproval.button_text')}
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              key="approveAuditButton"
              icon={<CheckCircleOutlined />}
              onClick={onApproveAudit}
            >
              {t('approve.approveApproval.button_text')}
            </Button>
          </Col>
        </Row>
      );
    } else {
      const editButton = (
        <Button
          key="editButton"
          icon={<FormOutlined />}
          loading={submitLoading}
          onClick={handleEdit}
        >
          {t('common.button.edit')}
        </Button>
      );

      if (approveStatus === 'STARTING') {
        buttons = (
          <Row gutter={10}>
            <Col>
              <Button
                danger
                icon={<UndoOutlined />}
                loading={isRevoking}
                onClick={handleRevoke}
              >
                {t('approve.revokeApproval.button_text')}
              </Button>
            </Col>
          </Row>
        );
      } else if (approveStatus === 'DRAFT') {
        buttons = (
          <Row gutter={10}>
            <Col>{editButton}</Col>
            <Col>{approveButton}</Col>
          </Row>
        );
      } else if (approveStatus === 'REJECTED' && pageType == 'detail') {
        buttons = (
          <Button
            key="reeditButton"
            icon={<RedoOutlined />}
            loading={reeditLoading}
            onClick={onReedit}
          >
            {t('approve.reeditApproval.button_text')}
          </Button>
        );
      } else if (approveStatus === 'APPROVED') {
        buttons = (
          <Button
            icon={<PrinterOutlined />}
            loading={isPrinting}
            onClick={onPrint}
          >
            {t('approve.print.button_text')}
          </Button>
        );
      }
    }
    return <Col style={{ paddingRight: 20 }}>{buttons}</Col>;
  };

  return (
    <div className={styles.header}>
      <Row align="middle" justify="space-between" style={{ flex: 1 }}>
        <Col>
          <Row align="middle" gutter={10}>
            <Col flex="none">
              <div className={styles.backIcon} onClick={pageBack}>
                <ArrowLeftOutlined />
              </div>
            </Col>
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                {appInfo && appInfo.name}
              </Title>
            </Col>
          </Row>
        </Col>
        {(pageType !== 'audit' || appInfo?.permission === 'PASS') &&
          renderButtons()}
      </Row>
    </div>
  );
};

export default Header;

import _ from 'lodash';
import { useModel } from 'umi';
import { useControllableValue } from 'ahooks';
import { Row, Col, Select, message } from 'antd';
import React, { useState, useEffect, useMemo, forwardRef } from 'react';

import { fetchCredentials } from '@/services/Credential';

import type { WidgetItemType } from '@/models/AppEditor';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import { IconFont } from '@/components/Nice/NiceIcon';
import CredentialModal, { MODAL_NAME } from '@/components/CredentialModal';

import ReadOnlyWidget from '../ReadOnlyWidget';

import styles from './index.less';

const credentialsMap = {}

const CredentialSelect: React.FC<WidgetItemType> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const { t } = useI18n(['workflow', 'common']);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [curValue, setCurValue] = useControllableValue<any[]>(props);

  const [credentialModal] = useModal(MODAL_NAME);

  const options = useMemo(() => {
    return _.map(credentials, (item) => ({
      value: item.credentialKey,
      label: item.name,
    }));
  }, [credentials]);

  const { nodeInfo } = useModel('FlowNode', (model) => ({
    nodeInfo: model.nodeInfo,
  }));

  const getCredentials = async () => {
    const credentialTypeCode = nodeInfo.credentialTypeCode
    const result = await fetchCredentials({
      credentialTypeCode
    });
    setCredentials(result);
    credentialsMap[credentialTypeCode] = result
  };

  useEffect(() => {
    const credentialTypeCode = nodeInfo.credentialTypeCode
    if (!credentialsMap[credentialTypeCode]) {
      getCredentials();
    } else {
      setCredentials(credentialsMap[credentialTypeCode])
    }
  }, [ nodeInfo.credentialTypeCode ]);

  const renderCredentialModal = () => {
    return <CredentialModal onSuccess={getCredentials} />;
  };

  const showCredentialModal = (type?: string) => {
    if (type === 'edit') {
      if (curValue) {
        const credentialItem = _.find(credentials, (item) => item.credentialKey === curValue);
        if (credentialItem) {
          credentialModal.show(credentialItem);
        }
      } else {
        message.error('请先选择凭据');
      }
    } else {
      credentialModal.show();
    }
  };

  const renderFormItem = () => {
    return (
      <Select
        value={curValue}
        options={options}
        placeholder="请选择"
        style={{ width: '100%' }}
        onChange={setCurValue}
      />
    );
  };

  if (widgetType === 'view') {
    return <ReadOnlyWidget options={options} {...props} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.createBtn}>
        <span className="b-button" onClick={() => showCredentialModal()}>
          + 新建
        </span>
      </div>
      <Row align="middle">
        <Col flex="auto">{renderFormItem()}</Col>
        <Col flex="30px" style={{ textAlign: 'right' }}>
          <span className="g-button" onClick={() => showCredentialModal('edit')}>
            <IconFont type="innospot-icon-edit" className={styles.editIcon} />
          </span>
        </Col>
      </Row>
      {renderCredentialModal()}
    </div>
  );
})

export default CredentialSelect;

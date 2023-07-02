/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { useRef } from 'react';

import { Space, Button } from 'antd';
import { useModel } from 'umi';

import { useToggle } from 'ahooks';

import PageTitle from '@/components/PageTitle';
import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import PermissionSection from '@/components/PermissionSection';
import ReceivingSettingTable from './components/ReceivingSettingTable';
import ReceivingConfigContext from './components/contexts/ReceivingConfigContext';

import styles from './style.less';

const Index: React.FC = () => {
  const tableRef: any = useRef(null);
  const { t, loading: i18nLoading } = useI18n(['notification', 'common']);

  const [isEditing, { toggle: editToggle }] = useToggle();

  const { saveReceivingSettingRequest } = useModel('Notification', (model) => ({
    saveReceivingSettingRequest: model.saveReceivingSettingRequest,
  }));

  const handleButtonClick = (type?: string) => {
    switch (type) {
      case 'cancel':
        editToggle();
        tableRef.current?.onCancel();
        break;
      case 'submit':
        tableRef.current?.onSubmit();
        break;
      case 'edit':
        editToggle();
        break;
      default:
    }
  };

  const renderPageHeader = () => {
    return (
      <>
        <PageTitle title={t('notification.assignment.title')} style={{ height: 64 }} />
        <div className={styles.headerButton}>
          {isEditing ? (
            <Space>
              <Button
                onClick={() => handleButtonClick('cancel')}
                loading={saveReceivingSettingRequest.loading}
              >
                {t('common.button.cancel')}
              </Button>
              <Button
                type="primary"
                onClick={() => handleButtonClick('submit')}
                loading={saveReceivingSettingRequest.loading}
              >
                {t('common.button.save')}
              </Button>
            </Space>
          ) : (
            <PermissionSection itemKey="NotificationSetting-saveMessageSetting">
              <Button type="primary" onClick={() => handleButtonClick('edit')}>
                {t('common.button.edit')}
              </Button>
            </PermissionSection>
          )}
        </div>
      </>
    );
  };

  const renderDataContent = () => {
    return (
      <div className={styles.listWrapper}>
        <ReceivingConfigContext.Provider value={{ isEditing, editToggle }}>
          <ReceivingSettingTable ref={tableRef} />
        </ReceivingConfigContext.Provider>
      </div>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageHeader()}
      {renderDataContent()}
    </>
  );
};

export default Index;

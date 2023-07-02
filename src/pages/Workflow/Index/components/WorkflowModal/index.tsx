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

import React, {useEffect, useState} from 'react';

import {useModel} from 'umi';
import {useMemoizedFn} from 'ahooks';
import _ from 'lodash';
import cls from 'classnames';

import {Button, Form, Input, message, Modal, Select, Space} from 'antd';
import {AimOutlined, CoffeeOutlined, CompassOutlined, CrownOutlined} from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import {renderNodeIcon} from '@/pages/Workflow/Builder/components/NodeIcon';

import styles from './style.less';

/**
 * DUMMY,SCHEDULE,STREAM,WEBHOOK
 */
export const TYPE_ICONS = {
  SCHEDULE: <AimOutlined/>,
  WEBHOOK: <CoffeeOutlined/>,
  STREAM: <CompassOutlined/>,
  DUMMY: <CrownOutlined/>
};

const triggerDataList = [
  {
    type: 'SCHEDULE',
    title: 'workflow.form.scheduler.name',
    description: 'workflow.form.scheduler.introduction'
  },
  {
    type: 'WEBHOOK',
    title: 'workflow.form.trigger.webhook.name',
    description: 'workflow.form.trigger.webhook.introduction'
  },
  {
    type: 'STREAM',
    title: 'workflow.form.kafka_trigger.name',
    description: 'workflow.form.kafka_trigger.introduction'
  },
  {
    type: 'DUMMY',
    title: 'workflow.form.trigger.dummy.name',
    description: 'workflow.form.trigger.dummy.introduction'
  }
];

export const MODAL_NAME = 'WorkflowModal';

const WorkflowModal: React.FC<{
  onSuccess: () => void;
}> = ({onSuccess}) => {
  const [modal, modalInfo] = useModal(MODAL_NAME);

  const {visible, modalType, initValues} = modalInfo;

  const [baseForm] = Form.useForm();
  const [triggerCode, setTriggerCode] = useState<string>();
  const [validateStatus, setValidateStatus] = useState<{
    name: string | undefined;
  }>({
    name: undefined
  });
  const {t} = useI18n(['workflow', 'common']);

  const {
    categoryOptions,
    workflowTemplates,
    saveWorkflowRequest,
    fetchWorkflowTemplatesRequest
  } = useModel('Workflow', (model) => ({
    categoryOptions: model.categoryOptions,
    workflowTemplates: model.workflowTemplates,
    saveWorkflowRequest: model.saveWorkflowRequest,
    fetchWorkflowTemplatesRequest: model.fetchWorkflowTemplatesRequest
  }));

  useEffect(() => {
    if (visible) {
      baseForm.setFieldsValue(_.pick(initValues, ['name', 'categoryId']));
    }
  }, [visible, initValues]);

  useEffect(() => {
    if (visible) {
      if (!workflowTemplates.length) {
        fetchWorkflowTemplatesRequest.run({primitive: 'trigger'});
      } else {
        if (initValues?.triggerCode) {
          setTriggerCode(initValues.triggerCode);
        } else {
          setTriggerCode(workflowTemplates[0].code);
        }
      }
    }
  }, [visible, initValues, workflowTemplates]);

  const saveFormData = async (values: any) => {
    const currentTrigger = _.find(workflowTemplates, item => item.code === triggerCode);
    const result = await saveWorkflowRequest.runAsync(modalType, {
      ...initValues,
      ...values,
      triggerCode,
      templateCode: 'APPS',
      description: currentTrigger?.description
    });

    if (result) {
      message.success(t('common.error_message.save.success'));
      modal.hide();
      onSuccess?.();
    }
  };

  const handleSaveData = useMemoizedFn(() => {
    baseForm.validateFields().then((values: any) => {
      if (!values.name) {
        setValidateStatus({
          ...validateStatus,
          name: 'error'
        });
      } else {
        saveFormData(values);
      }
    });
  });

  const renderTriggerList = () => {
    return (
      <div className={styles.trigger}>
        <p>{t('workflow.form.trigger.label')}：</p>
        <div className={styles.triggerBox}>
          {workflowTemplates.map((item: any) => {
            return (
              <div
                key={item.code}
                className={cls(styles.triggerItem, {
                  [styles.active]: item.code === triggerCode
                })}
                onClick={() => setTriggerCode(item.code)}
              >
                <div className={styles.iconNode}>{renderNodeIcon(item)}</div>
                <div className={styles.content}>
                  <p className={styles.title}>{t(`${item.name}`)}</p>
                  <p className={styles.desc}>{t(`${item.description}`)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className={styles.footer}>
        <Space size={16}>
          <Button onClick={modal.hide}>{t('common.button.cancel')}</Button>
          <Button
            type="primary"
            loading={saveWorkflowRequest.loading}
            onClick={handleSaveData}
          >
            {t('common.button.confirm')}
          </Button>
        </Space>
      </div>
    );
  };

  const renderLeftContent = () => {
    return (
      <div className={styles.left}>
        <div className={styles.inner}>
          <p>{t('workflow.form.introduction')}</p>
        </div>
      </div>
    );
  };

  const renderRightContent = () => {
    return (
      <div className={styles.right}>
        <div className={styles.inner}>
          <h1 className={styles.title}>{t('workflow.form.new.title')}</h1>
          <div>
            <Form form={baseForm} layout="vertical">
              <Form.Item
                required
                name="name"
                label={t('workflow.form.name.label')}
                rules={[
                  {
                    pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]{1,32}$/,
                    message: t('workflow.form.input.name.error_message2')
                  }
                ]}
                // @ts-ignore
                validateStatus={validateStatus.name}
              >
                <Input
                  className={styles.formItem}
                  placeholder={t('workflow.form.name.placeholder')}
                />
              </Form.Item>
              <Form.Item
                name="categoryId"
                label={t('workflow.category.linput.category.label')}
                required
              >
                <Select
                  className={styles.formItem}
                  placeholder={t('workflow.form.category.placeholder')}
                  options={_.filter(categoryOptions, item => item.value !== -1)}
                />
              </Form.Item>
            </Form>
          </div>
          {renderTriggerList()}
        </div>
        {renderFooter()}
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className={styles.wrapper}>
        {renderLeftContent()}
        {renderRightContent()}
      </div>
    );
  };

  return (
    <Modal
      width={1024}
      title={null}
      footer={null}
      open={visible}
      style={{top: 20}}
      bodyStyle={{padding: 0}}
      wrapClassName={styles.modalWrapper}
      onCancel={() => modal.hide()}
    >
      {renderContent()}
    </Modal>
  );
};

export default WorkflowModal;

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

import _ from 'lodash';
import React, { useEffect } from 'react';
import { useModel, useParams } from 'umi';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Row, Select, Spin } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import PermissionSection from '@/components/PermissionSection';

import { BUTTON_PERMISSION_MAP } from '@/pages/Workflow/Index/config';

import VersionList from './VersionList';

import styles from './index.less';

const Header = ({
  mode,
  detail,
  saveButton,
  dataLoading,
  publishButton,
  onClick,
}) => {
  const [baseForm] = Form.useForm();
  const { t } = useI18n(['workflow', 'common']);
  const { workflowType } = useParams();

  const {
    categoryOptions,
    fetchCategoriesRequest,
    saveToDraftRequest,
    workflowVersion,
  } = useModel('Workflow', (model) => ({
    categoryOptions: model.categoryOptions,
    fetchCategoriesRequest: model.fetchCategoriesRequest,
    saveToDraftRequest: model.saveToDraftRequest,
    workflowVersion: model.workflowVersion,
  }));

  useEffect(() => {
    fetchCategoriesRequest.run({
      workflowType:
        workflowType && workflowType !== 'index' ? workflowType : '',
    });
  }, [workflowType]);

  const buttonPermissions = BUTTON_PERMISSION_MAP[workflowType] || {};

  useEffect(() => {
    if (detail?.workflowInstanceId) {
      baseForm.setFieldsValue(_.pick(detail, ['name', 'categoryId']));
    }
  }, [detail?.workflowInstanceId, detail?.name, detail?.categoryId]);

  const saveToDraft = async () => {
    try {
      const result = await saveToDraftRequest.runAsync(
        detail.templateCode,
        detail.workflowInstanceId,
        workflowVersion,
      );
      if (result) {
        onClick?.('edit');
      }
    } finally {
    }
  };

  const handleClick = (type) => () => {
    if (['edit', 'cancel'].includes(type)) {
      if (type === 'edit' && workflowVersion != 0) {
        Modal.confirm({
          title: t('common.tips.title'),
          content: t('workflow.version.saveToDraftContent', {
            version: workflowVersion,
          }),
          confirmLoading: saveToDraftRequest.loading,
          onOk: saveToDraft,
        });
      } else {
        onClick?.(type);
      }
    } else {
      baseForm.validateFields().then((values) => {
        onClick?.(type, values);
      });
    }
  };

  const pageBack = () => {
    onClick?.('pageBack');
  };

  const renderBaseForm = () => {
    return (
      <Form layout="inline" form={baseForm}>
        <Form.Item label={t('workflow.form.name.label')} name="name">
          <Input
            placeholder={t('workflow.form.name.placeholder')}
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item
          label={t('workflow.category.linput.category.label')}
          name="categoryId"
        >
          <Select
            style={{ width: 200 }}
            options={categoryOptions}
            placeholder={t('workflow.form.category.placeholder')}
          />
        </Form.Item>
      </Form>
    );
  };

  const renderBaseInfo = () => {
    const category = categoryOptions.find(
      (item) => item.value === detail?.categoryId,
    );
    return (
      <div>
        <Row gutter={20}>
          <Col>
            <strong>{t('workflow.form.name.label')}：</strong>
            <span>{detail?.name}</span>
          </Col>
          <Col>
            <strong>{t('workflow.category.linput.category.label')}：</strong>
            <span>{category?.label}</span>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className={styles.pageHeader}>
      <Row justify="space-between" style={{ flex: 1 }}>
        <Col span={16}>
          <Row align="middle">
            <Col flex="none">
              <div className={styles.backIcon} onClick={pageBack}>
                <ArrowLeftOutlined />
              </div>
            </Col>
            <Col flex="auto">
              {mode === 'preview' ? renderBaseInfo() : renderBaseForm()}
            </Col>
          </Row>
        </Col>
        {!dataLoading ? (
          <Col>
            <Row gutter={[10, 0]}>
              {mode === 'preview' ? (
                <>
                  <Col>
                    <VersionList
                      templateCode={detail?.templateCode}
                      workflowInstanceId={detail?.workflowInstanceId}
                    />
                  </Col>
                  <Col>
                    <Button type="primary" onClick={handleClick('edit')}>
                      {t('common.button.edit')}
                    </Button>
                  </Col>
                  <Col />
                </>
              ) : (
                <>
                  <Col>
                    <Button onClick={handleClick('cancel')}>
                      {t('common.button.cancel')}
                    </Button>
                  </Col>
                  <Col>
                    <PermissionSection itemKey={buttonPermissions.builderOpt}>
                      <Button {...saveButton} onClick={handleClick('save')}>
                        {t('common.button.save')}
                      </Button>
                    </PermissionSection>
                  </Col>
                  <Col style={{ paddingRight: 20 }}>
                    <PermissionSection
                      itemKey={buttonPermissions.builderPublish}
                    >
                      <Button
                        type="primary"
                        {...publishButton}
                        onClick={handleClick('publish')}
                      >
                        {t('common.button.publish')}
                      </Button>
                    </PermissionSection>
                  </Col>
                </>
              )}
            </Row>
          </Col>
        ) : (
          <Col>
            <div style={{ paddingRight: 20 }}>
              <Spin size="small" />
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default React.memo(Header);

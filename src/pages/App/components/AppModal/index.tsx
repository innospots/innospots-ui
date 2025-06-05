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
import _ from 'lodash'
import {useModel} from 'umi';
import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Form, Radio, Input, Select, Modal, Button } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import { formatImagePath } from '@/common/utils';

import IconSelect from '@/components/IconSelect/IconSelect';

import styles from './style.less';

export const MODAL_NAME = 'AppModal';

const FormItem = Form.Item;

const MODAL_TITLE = {
  'add': 'app.modal.title.add',
  'edit': 'app.modal.title.edit',
  'saveAs': 'app.modal.title.saveAs'
}

export const typeOptions = [
  { label: 'app.type.form', value: 'FORM' },
  { label: 'app.type.chat', value: 'CHAT' },
  // { label: 'app.type.interactive', value: 'APP_PAGE' },
  { label: 'app.type.approval', value: 'APPROVAL' },
]

const AppModal:React.FC<{ onSuccess: (result) => void }> = ({ onSuccess }) => {
  const { t } = useI18n(['common', 'app']);

  const {
    categories,
    saveAppRequest,
    categoryRequest
  } = useModel('App', (model) => ({
    categories: model.categories,
    saveAppRequest: model.saveAppRequest,
    categoryRequest: model.categoryRequest
  }));

  const [formRes] = Form.useForm();
  const [appIcon, setAppIcon] = useState<string>('');

  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, modalType, initValues } = modalInfo;

  const isEdit = modalType === 'edit';

  useEffect(() => {
    if (visible) {
      if (!categories?.length) {
        categoryRequest.run()
      }

      const formValues = {
        appType: 'FORM',
        ...initValues
      };
      if (formValues && formValues.icon) {
        const curIcon = formatImagePath(formValues.icon);
        setAppIcon(curIcon);
      }

      if (modalType === 'saveAs') {
        formValues.name = [formValues.name, '1'].join('_')
        formValues.code = [formValues.code, '1'].join('_')
      }

      formRes.setFieldsValue(formValues)
    } else {
      formRes.resetFields();
    }
  }, [ visible, initValues ])

  const categoryOptions = useMemo(() => (categories || []).map(item => ({
    value: item.categoryId,
    label: item.categoryName,
  })), [categories]);

  const handleFormSubmit = () => {
    formRes.validateFields().then(values => {
      let postData: any = {
        ...values
      }

      if (appIcon) {
        postData.icon = appIcon;
      }

      if (isEdit) {
        postData = _.extend({}, initValues, postData)
      }

      postAppInfo(postData)
    })
  }

  const postAppInfo = async (data) => {
    if (isEdit && !data.nodeType) {
      data.nodeType = 'io.innospots.workflow.node.app.script.ScriptNode';
    }

    const result = await saveAppRequest.runAsync(data, isEdit ? 'put' : 'post');
    if (result) {
      modal.hide();
      onSuccess?.({
        ...result,
        modalType
      });
    }
  }

  const renderForm = () => {

    return (
      <Form form={formRes} layout="vertical" preserve={false}>
        <FormItem name="name" label={t('app.form.name')} rules={[{ required: true }]}>
          <Input placeholder={t('app.form.name.placeholder')} maxLength={20} />
        </FormItem>
        <FormItem name="categoryId" label={t('app.form.category')} rules={[{ required: true }]}>
          <Select showSearch options={categoryOptions} placeholder={t('app.form.select.placeholder')} />
        </FormItem>
        <FormItem name="appType" label={t('app.form.type')} rules={[{ required: true }]}>
          <Radio.Group options={typeOptions.map(opt => ({ ...opt, label: t(opt.label) }))} />
        </FormItem>
        <FormItem name="icon" label={t('app.form.icon')} >
          <IconSelect />
        </FormItem>
        <FormItem>
          <Row gutter={8} justify="end">
            <Col>
              <Button onClick={modal.hide}>{t('common.button.cancel')}</Button>
            </Col>
            <Col>
              <Button type="primary" loading={saveAppRequest.loading} onClick={handleFormSubmit}>{t('common.button.confirm')}</Button>
            </Col>
          </Row>
        </FormItem>
      </Form>
    )
  }

  return (
    <Modal
      width={680}
      destroyOnClose
      open={visible}
      footer={null}
      onCancel={modal.hide}
    >
      <div className={styles.modalBody}>
        <Row>
          <Col flex="240px">
            <div className={styles.leftWrapper}></div>
          </Col>
          <Col flex="auto">
            <div className={styles.formWrapper}>
              <h3 className={styles.title}>{ t(MODAL_TITLE[modalType]) }</h3>
              { renderForm() }
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  )
}

export default AppModal;

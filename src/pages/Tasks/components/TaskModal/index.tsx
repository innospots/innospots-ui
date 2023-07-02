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

import React, {useContext, useEffect} from 'react';

import {Col, DatePicker, Form, Input, message, Row, Select} from 'antd';

import {useModel} from 'umi';

import moment from 'moment'

import styles from './style.less'

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import NiceModal from '@/components/Nice/NiceModal';
import RichTextBox from '@/components/RichTextBox'
import {DEFAULT_PAGINATION_SETTINGS} from '@/common/constants';

import TaskContext from '../../contexts/TaskContext'

const formItemLayout = {
  labelCol: {flex: '80px'},
  // wrapperCol: { span: 16 },
};

export const MODAL_NAME = 'TaskModal';

const TaskModal: React.FC = () => {
  const [formRes] = Form.useForm();

  const {t} = useI18n(['common', 'task']);

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const {visible, modalType, initValues} = modalInfo;

  const {
    taskRequest,
    saveTaskRequest
  } = useModel('Tasks');

  const {filterOptions = {}, dateFormat} = useContext(TaskContext);

  useEffect(() => {
    if (visible) {
      setInitValues();
    }
  }, [visible, modalType, initValues]);

  const setInitValues = () => {
    const values = {...initValues}

    if (modalType === 'edit') {
      if (values.startDate) {
        values.startDate = moment(values.startDate)
      }

      if (values.endDate) {
        values.endDate = moment(values.endDate)
      }
    }

    formRes.setFieldsValue({
      ...values
    });
  };

  const onRichTextChange = (editor) => {
    // const html = editor.toHTML()
    // formRes.setFieldsValue({description: html})
  }

  const handleFormSubmit = () => {
    // 校验一下富文本内容是否为空
    const descr = formRes.getFieldValue('description').toHTML()
    const len = descr.replace(/(<p>|<\/p>)/g, '').trim().length;

    formRes.validateFields().then((values) => {

      if (!len) {
        formRes.setFields([{
          name: 'description',
          errors: [t('task.form.placeholder.description')]
        }])
        return
      }

      values = {
        ...values,
        description: descr
      }

      saveTaskData(values);
    }).catch((err) => {
      if (!len) {
        formRes.setFields([{
          name: 'description',
          errors: [t('task.form.placeholder.description')]
        }])
      }
    })

  };

  const saveTaskData = async (values: any) => {
    try {
      let postData = values;

      if (postData.startDate) {
        postData.startDate = postData.startDate.format(dateFormat);
      }

      if (postData.endDate) {
        postData.endDate = postData.endDate.format(dateFormat);
      }

      if (modalType === 'edit' && initValues) {
        postData = {
          ...initValues,
          ...postData,
        };

        delete postData.createdTime
        delete postData.updatedTime
      }

      const result = await saveTaskRequest.runAsync(modalType, postData);

      if (result) {
        message.success(t('common.error_message.save.success'));
        modal.hide();

        taskRequest.run({
          ...DEFAULT_PAGINATION_SETTINGS,
        });
      }
    } catch (e) {
    }
  };

  const renderForm = () => {
    return (
      <Form className={styles.taskForm} form={formRes} preserve={false} {...formItemLayout}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="taskName"
              label={t('task.form.label.title')}
              rules={[
                {
                  required: true,
                  message: t('task.form.placeholder.title'),
                }
              ]}
            >
              <Input placeholder={t('task.form.placeholder.title')}/>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="principalUserId"
              label={t('task.form.label.principal')}
              rules={[{required: true, message: t('task.form.placeholder.principal')}]}
            >
              <Select options={filterOptions.userList} placeholder={t('task.form.placeholder.principal')}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="taskPriority"
              label={t('task.form.label.priority')}
              rules={[{required: true, message: t('task.form.placeholder.priority')}]}
            >
              <Select options={filterOptions.priority} placeholder={t('task.form.placeholder.priority')}/>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label={t('task.form.label.start_time')}
              rules={[{required: true, message: t('task.form.placeholder.start_time')}]}
            >
              <DatePicker style={{width: '100%'}}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endDate"
              label={t('task.form.label.end_time')}
              rules={[{required: true, message: t('task.form.placeholder.end_time')}]}
            >
              <DatePicker style={{width: '100%'}}/>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="tags"
              label={t('task.form.label.tag')}
            >
              <Select
                mode="tags"
                notFoundContent={t('task.form.reminder.tag')}
                placeholder={t('task.form.placeholder.tag')}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={t('task.form.label.description')}
              name="description"
              rules={[{required: true, message: t('task.form.placeholder.description')}]}
            >
              <RichTextBox
                className="my-editor"
                onChange={(editor) => onRichTextChange(editor)}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <NiceModal
      width={716}
      destroyOnClose
      visible={visible}
      title={modalType ? t(`task.form.${modalType}.title`) : ''}
      okButtonProps={{
        loading: false,
        onClick: handleFormSubmit,
      }}
      onCancel={modal.hide}
    >
      {renderForm()}
    </NiceModal>
  );
};

export default TaskModal;

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

import {Button, Col, Drawer, Form, message, Row, Select, Space, Spin, Tag, Typography} from 'antd';

import {CloseOutlined, DeleteOutlined} from '@ant-design/icons'

import _ from 'lodash'
import {useModel} from 'umi';
import cls from 'classnames';

import styles from './style.less'

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import {PRIORITY_TYPES, STATUS_TYPES} from '../../constants'
import UserAvatar from "@/components/UserAvatar";
import {DEFAULT_PAGINATION_SETTINGS} from "@/common/constants";
import RichTextBox from "@/components/RichTextBox";
import {usePermission} from "@/components/PermissionSection";

const {Paragraph} = Typography;

const formItemLayout = {
  labelCol: {span: 4},
  wrapperCol: {span: 20},
};

export const DRAWER_NAME = 'TaskDrawer';

const TaskModal: React.FC = () => {
  const [formRes] = Form.useForm();

  const {t} = useI18n(['common', 'task']);

  const [updateAuth] = usePermission('TodoTask-updateTodoTask');

  const [drawer, drawerInfo] = useModal(DRAWER_NAME);

  const {visible, drawerType, initValues = {}} = drawerInfo;

  const [updatingComment, setUpdatingComment] = useState<any>(null)

  const plCols = document.getElementsByClassName('pl-col')
  const descrDiv = document.getElementById('description-text')

  const {
    taskRequest,
    taskCommentData,

    saveTaskRequest,
    taskCommentRequest,
    saveTaskCommentRequest,
    deleteTaskCommentRequest,
  } = useModel('Tasks');

  const {sessionData} = useModel('Account');

  useEffect(() => {
    if (visible) {
      setInitValues();

      taskCommentRequest.run(initValues.taskId);
    }
  }, [visible, drawerType, initValues]);

  useEffect(() => {
    const comments = taskCommentData.comments || []

    for (let i = 0; i < plCols.length; i++) {
      const comment = comments[i]
      const plCol = plCols[i]

      plCol.innerHTML = comment.content
    }

  }, [taskCommentData, plCols]);

  useEffect(() => {
    const decr = initValues.description

    if (descrDiv) {
      descrDiv.innerHTML = decr
    }

  }, [initValues, descrDiv]);

  const setInitValues = () => {
    const values = {...initValues}

    formRes.setFieldsValue({
      ...values
    });
  };

  const saveTaskCommentData = async (values: any) => {
    try {
      const result = await saveTaskCommentRequest.runAsync(values);

      if (result) {
        setUpdatingComment(null)
        taskCommentRequest.run(initValues.taskId);
      }
    } catch (e) {
    }
  };

  const handleUpdateTask = () => {
    formRes.validateFields().then((values) => {
      // 校验一下富文本内容是否为空
      const descr = values.description.toHTML()
      const len = descr.replace(/(<p>|<\/p>)/g, '').trim().length;

      if (!len) {
        return
      }

      values = {
        ...values,
        description: values.description.toHTML()
      }

      saveTaskData(values);
    });
  };

  const saveTaskData = async (values: any) => {
    const drawerType = 'edit'

    try {
      let postData = values;

      if (drawerType === 'edit' && initValues) {
        postData = {
          ...initValues,
          ...postData,
        };

        delete postData.createdTime
        delete postData.updatedTime
      }

      const result = await saveTaskRequest.runAsync(drawerType, postData);

      if (result) {
        message.success(t('common.error_message.save.success'));
        drawer.hide();

        taskRequest.run({
          ...DEFAULT_PAGINATION_SETTINGS,
        });
      }
    } catch (e) {
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      const result = await deleteTaskCommentRequest.runAsync(id);

      if (result) {
        taskCommentRequest.run(initValues.taskId);
      }
    } catch (e) {
    }
  }

  const handleSubmitComment = () => {
    // 校验一下富文本内容是否为空
    const comment = updatingComment.toHTML()
    const len = comment.replace(/(<p>|<\/p>)/g, '').trim().length;
    if (!len) {
      message.warning(t('task.detail.comment.no.empty'))
      return
    }

    let postData = {
      content: updatingComment.toHTML(),
      taskId: initValues.taskId,
      createdBy: sessionData.userName,
      avatarKey: sessionData.avatarKey
    };

    saveTaskCommentData(postData)
  }

  const onCommentChange = (editor) => {
    setUpdatingComment(editor)
  }

  const onDescChange = (editor) => {
    // 描述内容非空校验
    const descr = editor.toHTML()
    const len = descr.replace(/(<p>|<\/p>)/g, '').trim().length;

    let errorText = ''

    if (!len) {
      errorText = t('task.form.placeholder.description')
    }

    formRes.setFields([{
      name: 'description',
      errors: [errorText]
    }])
  }

  const renderDescForm = () => {
    return (
      <Form className="desc-form" form={formRes} preserve={false} {...formItemLayout}>
        <Form.Item
          labelAlign="left"
          name="description"
          label={t('task.form.label.description')}
        >
          {
            updateAuth ? (
              <RichTextBox className="my-editor-1" onChange={onDescChange}/>
            ) : (
              <div id="description-text"></div>
            )
          }
        </Form.Item>
      </Form>
    );
  };

  const renderTags = () => {

    if (initValues.tags?.length > 0) {
      return (
        _.map(initValues.tags || [], (tag: any, index) => {
          return (
            <Tag
              color={'#ecf0ff'}
              style={{color: '#53555a'}}
              key={[tag, index].join('_')}
            >
              {tag}
            </Tag>
          )
        })
      )
    }
    return '---'
  }

  const renderDetailHeader = () => {

    const taskName = initValues.taskName || '---'

    return (
      <>
        <div className={styles.detailTile}>
          <Paragraph ellipsis={{rows: 2, tooltip: taskName}}>{taskName}</Paragraph>
        </div>

        <div className={styles.titleDesc}>
          <Space size={4}>
            <span>{initValues.createdBy || '---'}</span>
            <span>{t('task.detail.drawer.description.create_at')}</span>
            <span>{initValues.createdTime || '---'},</span>
            <span>{t('task.detail.drawer.description.updated_in')}</span>
            <span>{initValues.updatedTime || '---'}</span>
          </Space>
        </div>
      </>
    )
  }

  const renderTaskDetail = () => {
    const priority = PRIORITY_TYPES[initValues.taskPriority] || {}

    return (
      <div className={styles.detailDrawer}>

        {renderDetailHeader()}

        <Row className={styles.taskInfo}>
          <Col span={12}>
            <Row>
              <Col span={8}>
                {t('task.form.label.principal')}：
              </Col>
              <Col span={16}>
                {initValues.principalUserName}
              </Col>
            </Row>
          </Col>

          <Col span={12}>
            <Row>
              <Col span={8}>
                {t('task.form.label.priority')}：
              </Col>
              <Col span={16}>
                <Tag
                  color={priority.bgColor}
                  style={{color: priority.color}}
                >
                  {t(priority.text)}
                </Tag>
              </Col>
            </Row>
          </Col>

          <Col span={12}>
            <Row>
              <Col span={8}>
                {t('task.form.label.start_time')}：
              </Col>
              <Col span={16}>
                {initValues.startDate}
              </Col>
            </Row>
          </Col>

          <Col span={12}>
            <Row>
              <Col span={8}>
                {t('task.form.label.end_time')}：
              </Col>
              <Col span={16}>
                {initValues.endDate}
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row>
              <Col span={4}>
                {t('task.form.label.tag')}：
              </Col>
              <Col span={16}>
                {renderTags()}
              </Col>
            </Row>
          </Col>

          <Col span={24} className={styles.desContent}>
            {renderDescForm()}
          </Col>

        </Row>
      </div>
    )
  }

  const renderCommentList = () => {

    return (
      _.map(taskCommentData.comments || [], comment => {

        return (
          <Row justify="space-between" key={comment.commentId} className={styles.commentItem}>
            <Col>
              <Row gutter={12}>
                <Col flex="36px">
                  <UserAvatar
                    size={36}
                    userInfo={{avatarKey: `/api/${comment.avatarKey}`}}
                    style={{width: 36, height: 36}}
                  />
                </Col>
                <Col flex="auto">
                  <Row>
                    <Col span={24} className={styles.commentUser}>
                      {comment.createdBy}
                    </Col>
                    <Col span={24} className={cls('pl-col', styles.commentText)}>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>

            <Col style={{cursor: 'pointer'}}>
              <Space size={4} onClick={() => handleDeleteComment(comment.commentId)}>
                <DeleteOutlined/>

                <span>
                  {t('common.button.delete')}
                </span>
              </Space>
            </Col>
          </Row>
        )
      })
    )
  }

  const renderCommentForm = () => {
    return (
      <>
        <Row gutter={12} style={{marginTop: 12}}>
          <Col flex="36px">
            <UserAvatar
              size={36}
              userInfo={{avatarKey: `/api/${sessionData.avatarKey}`}}
              style={{width: 36, height: 36}}
            />
          </Col>
          <Col style={{width: 'calc(100% - 48px)'}}>
            <RichTextBox
              className="my-editor-2"
              value={updatingComment}
              onChange={onCommentChange}
            />
          </Col>
        </Row>

        <Row justify="end" className={styles.commentButton}>
          <Col>
            <Button onClick={() => handleSubmitComment()} loading={saveTaskCommentRequest.loading}>
              {t('task.detail.comment.button')}
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  const renderCommentContent = () => {

    const commentCount = taskCommentData.comments?.length || 0
    const loading = taskCommentRequest.loading || saveTaskCommentRequest.loading || deleteTaskCommentRequest.loading

    return (
      <div className={styles.commentContent}>
        <Space>
          <span className={styles.commentTitle}>
            {t('task.detail.comment.title')}
          </span>
          <div className={styles.commentBadge}>
            {commentCount}
          </div>
        </Space>

        <div className={styles.commentList}>
          <Spin spinning={loading} style={{minHeight: 48}}>
            {
              commentCount == 0 ?
                <span className={styles.emptyText}>
                  {t('task.detail.comment.reminder')}
                </span> : (
                  renderCommentList()
                )
            }
          </Spin>

          {renderCommentForm()}
        </div>
      </div>
    )
  }

  const renderDrawerFooter = () => {
    return (
      <Row justify="end" className={styles.detailFooter}>
        <Col>
          <Space>
            {
              updateAuth && (
                <div>
                  <Form className="status-form" form={formRes} preserve={false}>
                    <Form.Item
                      label={t('task.detail.drawer.form.status')}
                      name="taskStatus"
                    >
                      <Select
                        style={{width: 150, borderRadius: 10}}
                        placeholder={t('common.select.placeholder')}
                        options={_.map(Object.keys(STATUS_TYPES), (key) => ({
                          value: key,
                          label: t(STATUS_TYPES[key].text),
                        }))}
                      />
                    </Form.Item>
                  </Form>
                </div>
              )
            }
            <Button type="primary" onClick={handleUpdateTask} disabled={saveTaskRequest.loading}>
              {t('common.button.confirm')}
            </Button>
          </Space>
        </Col>
      </Row>
    )
  }

  return (
    <Drawer
      width={716}
      destroyOnClose
      open={visible}
      closable={false}
      title={t(`task.detail.drawer.title`)}
      maskClosable={false}
      extra={
        <div onClick={() => drawer.hide()}>
          <CloseOutlined/>
        </div>
      }
      footer={renderDrawerFooter()}
    >
      {renderTaskDetail()}
      {renderCommentContent()}
    </Drawer>
  );
};

export default TaskModal;

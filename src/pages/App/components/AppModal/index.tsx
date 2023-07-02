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

import React, { useEffect, useState, useMemo } from 'react';

import { Row, Col, Form, Input, Radio, Select, Upload, Spin } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { PlusOutlined } from '@ant-design/icons';

import {useModel} from 'umi';

import useModal from '@/common/hooks/useModal';
import NiceModal from '@/components/Nice/NiceModal';

import { AJAX_PREFIX } from '@/common/constants';
import { getAuthHeader } from '@/common/request/header';
import { extractResult, formatImagePath } from '@/common/utils';

import { renderNodeIcon } from '@/pages/Workflow/Builder/components/NodeIcon';

import styles from './style.less';

export const MODAL_NAME = 'AppModal';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const FormItem = Form.Item;

const AppModal:React.FC<{ onSuccess: (result) => void }> = ({ onSuccess }) => {

  const {
    categories,
    saveAppRequest
  } = useModel('App', (model) => ({
    categories: model.categories,
    saveAppRequest: model.saveAppRequest
  }));

  const [formRes] = Form.useForm();
  const [appIcon, setAppIcon] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, modalType, initValues } = modalInfo;

  const isEdit = modalType === 'edit';

  const appInfo = useMemo(() => {
    if (!uploading) {
      if (fileList?.length) {
        const newFile = fileList[0] as any;
        if (!newFile.icon && appIcon) {
          newFile.icon = appIcon;
        }
        return newFile
      } else if (initValues?.icon) {
        return initValues
      }
    }

    return null
  }, [initValues, uploading, appIcon, fileList]);

  useEffect(() => {
    if (visible) {
      const formValues = {
        ...initValues
      };
      if (formValues && formValues.icon) {
        const curIcon = formatImagePath(formValues.icon);
        setAppIcon(curIcon);
        // setFileList([{
        //   uid: '-1',
        //   url: curIcon,
        //   name: formValues.name,
        //   status: 'done'
        // }]);
      }
      formRes.setFieldsValue(formValues)
    } else {
      setFileList([]);
      formRes.resetFields();
    }
  }, [ visible, initValues ])

  const categoryOptions = useMemo(() => (categories || []).map(item => ({
    value: item.categoryId,
    label: item.categoryName,
  })), [categories]);

  const handleFormSubmit = () => {
    formRes.validateFields().then(values => {
      const postData = {
        ...values
      };

      if (appIcon) {
        postData.icon = appIcon;
      }

      postAppInfo({
        ...initValues,
        ...postData
      })
    })
  }

  const postAppInfo = async (data) => {
    if (isEdit && !data.nodeType) {
      data.nodeType = 'io.innospots.workflow.node.app.script.ScriptNode';
    }
    
    const result = await saveAppRequest.runAsync(data, isEdit ? 'put' : 'post');
    if (result) {
      modal.hide();
      onSuccess?.(result);
    }
  }

  const handleUploadChange = (info) => {
    setUploading(info.file?.status === 'uploading');

    const list = [ ...info.fileList ];
    let icon;

    if (list.length) {
      const image = extractResult(list[0].response);
      icon = 'data:image/png;base64,' + image;
    }

    setAppIcon(icon);
    setFileList(list);
  }

  const renderForm = () => {

    return (
      <Form form={formRes} preserve={false} {...formItemLayout}>
        <Row>
          <Col span={12}>
            <FormItem name="name" label="应用名称" rules={[{ required: true }]}>
              <Input placeholder="请输入应用名称" maxLength={20} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem name="code" label="应用编码" rules={[{ required: true }]}>
              <Input placeholder="请输入应用编码" maxLength={20} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem initialValue="normal" name="primitive" label="应用类型" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio value="trigger">触发器</Radio>
                <Radio value="normal">常规</Radio>
              </Radio.Group>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem name="nodeGroupId" label="应用分类" rules={[{ required: true }]}>
              <Select showSearch options={categoryOptions} placeholder={'请选择'} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="应用图标" required>
              <Upload
                name="image"
                maxCount={1}
                fileList={fileList}
                showUploadList={false}
                headers={getAuthHeader()}
                accept=".jpg,.jpeg,.png,.gif"
                action={AJAX_PREFIX + 'image/APP'}
                listType="picture-card"
                className={styles.upload}
                onChange={handleUploadChange}
              >
                <Spin spinning={uploading} size="small">
                  <div>
                    {
                      appInfo ? renderNodeIcon(appInfo) : (
                        <>
                          <PlusOutlined />
                          <div className={styles.label}>Upload</div>
                        </>
                      )
                    }
                  </div>
                </Spin>
              </Upload>
            </FormItem>
          </Col>
          <Col span={12} />
          <Col span={24}>
            <FormItem name="description" label="应用描述" labelCol={{flex: '105px'}} wrapperCol={{span: 20}} rules={[{ required: true }]}>
              <Input.TextArea showCount maxLength={60} rows={4} placeholder="请输入应用描述" />
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }

  return (
    <NiceModal
      simple
      width={890}
      destroyOnClose
      visible={visible}
      title={isEdit ? '编辑应用' : '添加应用'}
      onCancel={modal.hide}
      onOk={handleFormSubmit}
      okButtonProps={{
        loading: saveAppRequest.loading
      }}
    >
      { renderForm() }
    </NiceModal>
  )
}

export default AppModal;
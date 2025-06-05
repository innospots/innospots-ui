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

import { Row, Col, Form, Input, Radio, Select, Upload, Spin, Empty, Typography } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';

import cls from 'classnames'
import {useModel} from 'umi';
import { useRequest } from 'ahooks';

import { ArrayType } from '@/common/types/Types';
import useModal from '@/common/hooks/useModal';
import NiceModal from '@/components/Nice/NiceModal';
import { AJAX_PREFIX } from '@/common/constants';

import { fetchCredentialTypes } from '@/services/Credential';

import { getAuthHeader } from '@/common/request/header';
import { extractResult, formatImagePath } from '@/common/utils';

import { renderNodeIcon } from '@/pages/Workflow/Builder/components/NodeIcon';

import styles from './style.less';

export const MODAL_NAME = 'NodeModal';

const { Paragraph } = Typography;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const FormItem = Form.Item;

const MODAL_TITLE = {
  'add': '添加节点',
  'edit': '编辑节点',
  'saveAs': '另存节点'
}

const CredentialTypes:React.FC<{
  value?: string
  onChange?: (value: string) => void
}> = ({ value, onChange }) => {

  const [credentialTypes, setCredentialTypes] = useState<any[]>([])

  const credentialTypesRequest = useRequest<ArrayType, any>(fetchCredentialTypes, {
    manual: true,
    onSuccess: (result: ArrayType) => {
      setCredentialTypes([{
        name: '无连接',
        typeCode: 'none'
      }].concat(result));
    },
  });

  useEffect(() => {
    credentialTypesRequest.run()
  }, [])

  return (
    <div className={styles.credentialTypesWrapper}>
      <p className={styles.description}>请选择此节点需要连接的服务类型，如数据库读写、HTTP调用、邮件发送等。</p>
      <div className={styles.credentialTypes}>
      {!credentialTypes.length ? (
          <Row
            key={['empty', 'categoryCode'].join('-')}
            justify="center"
            align="middle"
            style={{ width: '100%' }}
          >
            <Col>
              <Empty />
            </Col>
          </Row>
        ) : (
          <Row
            key={['configs', 'categoryCode'].join('-')}
            gutter={[0, 12]}
            align="top"
            justify="start"
          >
            {_.map(credentialTypes, (item, index) => (
              <Col
                span={4}
                key={['config', index].join('')}
                onClick={() => {
                  onChange?.(item.typeCode)
                }}
              >
                <Row align="middle">
                  <Col span={24}>
                    <div className={styles.appItem}>
                      <div
                        className={cls(styles.inner, {
                          [styles.active]: value === item.typeCode,
                        })}
                      >
                        {
                          item.typeCode === 'none' ? (
                            <StopOutlined style={{fontSize: 28}} />
                          ) : renderNodeIcon(item, { baseUrl: AJAX_PREFIX })
                        }
                        <Paragraph ellipsis className={styles.label}>
                          {item.name}
                        </Paragraph>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  )
}

const NodeModal:React.FC<{ flowCode?: string, onSuccess: (result) => void }> = ({ flowCode, onSuccess }) => {

  const {
    primitives,
    nodeGroups,
    saveNodeInfo,
    saveNodeLoading
  } = useModel('FlowNode');

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

      if (!formValues.credentialTypeCode) {
        formValues.credentialTypeCode = 'none'
      }

      if (modalType === 'saveAs') {
        formValues.name = [formValues.name, '1'].join('_')
        formValues.code = [formValues.code, '1'].join('_')
      }

      formRes.setFieldsValue(formValues)
    } else {
      setFileList([]);
      formRes.resetFields();
    }
  }, [ visible, initValues ])

  const categoryOptions = useMemo(() => (nodeGroups || []).map(item => ({
    value: item.nodeGroupId,
    label: item.name,
  })), [nodeGroups]);

  const handleFormSubmit = () => {
    formRes.validateFields().then(values => {
      let postData = {
        flowCode,
        ...values
      };

      if (appIcon) {
        postData.icon = appIcon;
      }

      if (isEdit) {
        postData = {
          ...initValues,
          ...postData
        }
      }

      if (postData.credentialTypeCode === 'none') {
        postData.credentialTypeCode = ''
      }

      postNodeInfo(postData)
    })
  }

  const postNodeInfo = async (data) => {
    // if (isEdit && !data.nodeType) {
    //   data.nodeType = 'io.innospots.workflow.node.app.script.ScriptNode';
    // }

    const result = await saveNodeInfo(data, modalType);
    if (result) {
      modal.hide();
      onSuccess?.({
        ...result,
        modalType
      });
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
            <FormItem name="name" label="节点名称" rules={[{ required: true }]}>
              <Input placeholder="请输入节点名称" maxLength={20} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem name="code" label="节点编码" rules={[{ required: true }]}>
              <Input placeholder="请输入节点编码" maxLength={20} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem initialValue="normal" name="primitive" label="节点类型" rules={[{ required: true }]}>
              <Select options={primitives} placeholder={'请选择'} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem name="nodeGroupId" label="节点分类" rules={[{ required: true }]}>
              <Select showSearch options={categoryOptions} placeholder={'请选择'} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="节点图标" required>
              <Upload
                name="image"
                maxCount={1}
                fileList={fileList}
                showUploadList={false}
                headers={getAuthHeader()}
                accept=".jpg,.jpeg,.png,.gif"
                action={AJAX_PREFIX + 'image/NODE'}
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
            <FormItem name="credentialTypeCode" label="连接服务" labelCol={{flex: '105px'}} wrapperCol={{span: 20}} rules={[{ required: true }]}>
              <CredentialTypes />
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
      title={MODAL_TITLE[modalType]}
      onCancel={modal.hide}
      onOk={handleFormSubmit}
      okButtonProps={{
        loading: saveNodeLoading
      }}
    >
      { renderForm() }
    </NiceModal>
  )
}

export default NodeModal;

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

import React, { useRef, useContext, useEffect, useMemo, useState } from 'react';

import { useModel } from 'umi';
import _ from 'lodash';
import cls from 'classnames';
import multiAvatar from '@multiavatar/multiavatar';

import { Button, Col, Form, Input, message, Row, Select, Spin, Upload } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import NiceModal from '@/components/Nice/NiceModal';
import NiceAvatar from '@/components/Nice/NiceAvatar';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import UserConfigContext from '../contexts/UserConfigContext';

import { encrypt, randomString } from '@/common/utils';

import styles from './style.less';

export const MODAL_NAME = 'MemberModal';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

let randomHash, randomHashConstructed;

const MemberModal: React.FC = () => {
  const [formRes] = Form.useForm();
  const multiAvatarRef = useRef<{
    innerHTML?: string
  }>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadImg, setUploadImg] = useState('');
  const [avatarKey, setAvatarKey] = useState('');
  const { publicKey, saveUserRequest, publicKeyRequest } = useModel('User', (model) => ({
    publicKey: model.publicKey,
    saveUserRequest: model.saveUserRequest,
    publicKeyRequest: model.publicKeyRequest,
  }));

  const { roleData } = useModel('Role');

  const { t } = useI18n(['member', 'common']);
  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, modalType, initValues } = modalInfo;

  const { onFormSubmitSuccess } = useContext(UserConfigContext);

  useEffect(() => {
    if (visible) {
      if (modalType === 'edit' && initValues) {
        setInitValues();
        if (initValues.avatarBase64) {
          setUploadImg(initValues.avatarBase64);
        } else if (initValues.avatarKey) {
          setAvatarKey(initValues.avatarKey);
          setTimeout(() => {
            renderSvgAvatar(initValues.avatarKey);
          }, 300)
        } else {
          setAvatarKey('')
        }
      } else {
        setAvatarKey('')
        publicKeyRequest();
      }
    }
  }, [visible, modalType, initValues]);

  const roleList = useMemo(
    () =>
      roleData.list?.map((role: { roleId: string; roleName: string }) => ({
        value: role.roleId,
        label: role.roleName,
      })),
    [roleData.list],
  );

  const setInitValues = () => {
    const values = {
      ...initValues,
    };
    values.roleIds = values.roleIds?.[0];
    formRes.setFieldsValue(values);
  };

  const renderSvgAvatar = (svg) => {
    multiAvatarRef.current && (multiAvatarRef.current.innerHTML = multiAvatar(svg));
  }

  const generateSvgAvatar = () => {

    setUploadImg('');

    randomHashConstructed = '';
    randomHash = randomString(18);

    setAvatarKey(randomHash);

    runAvatar();
  }

  const runAvatar = () => {
    if (randomHashConstructed.length < 18) {
      setTimeout(() => {
        const lastChar = randomHash.substring(randomHash.length - 1);
        randomHash = randomHash.slice(0, -1);
        randomHashConstructed += lastChar;

        renderSvgAvatar(randomHashConstructed);

        runAvatar();
      }, 30);
    }
  }

  const onFormSubmit = () => {
    formRes.validateFields().then((values) => {
      onSaveMember(values);
    });
  };

  const onUploadChange = (info: any) => {
    const file = info.file;

    if (!uploading) {
      setUploading(true);
    }

    if (randomHashConstructed) {
      randomHashConstructed = '';
    }

    if (file.status === 'done') {
      setUploading(false);
      const response = file.response || {};
      if (response.code === '10000') {
        setUploadImg('data:image/png;base64,' + response.body);
      }
    }
  };

  const onSaveMember = async (values: any) => {
    try {
      const role = roleList?.find((r: any) => r.value === values.roleIds);
      if (role) {
        values.roleNames = [role.label];
      }
      values.roleIds = [values.roleIds];

      let postData = values;

      if (modalType === 'edit') {
        postData = {
          ...initValues,
          ...postData,
        };
      } else {
        postData.password = encrypt(publicKey, postData.password);
      }

      if (uploadImg) {
        postData.avatarBase64 = uploadImg;
      } else if (randomHashConstructed) {
        postData.avatarKey = randomHashConstructed;
      }

      const result = await saveUserRequest.runAsync(modalType, postData);

      if (result) {
        message.success(t('common.error_message.save.success'));
        modal.hide();

        onFormSubmitSuccess && _.isFunction(onFormSubmitSuccess) && onFormSubmitSuccess(modalType);
      }
    } catch (e) {}
  };

  const renderForm = () => {
    return (
      <Form form={formRes} preserve={false} {...formItemLayout}>
        <Form.Item
          label={t('user.form.input.email.label')}
          name="email"
          rules={[
            { required: true, type: 'email', message: t('user.form.input.email.error_message') },
          ]}
        >
          <Input placeholder={t('user.form.input.email.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('user.form.input.name.label')}
          name="realName"
          rules={[{ required: true, message: t('user.form.input.name.error_message') }]}
        >
          <Input placeholder={t('user.form.input.name.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('user.form.input.username.label')}
          name="userName"
          rules={[{ required: true, message: t('user.form.input.username.error_message') }]}
        >
          <Input placeholder={t('user.form.input.username.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('user.form.input.role.label')}
          name="roleIds"
          rules={[{ required: true, message: t('user.form.input.role.error_message') }]}
        >
          <Select options={roleList} placeholder={t('common.select.placeholder')} />
        </Form.Item>
        {modalType !== 'edit' ? (
          <Form.Item
            label={t('user.form.input.password.label')}
            name="password"
            rules={[{ required: true, message: t('user.form.input.password.error_message') }]}
          >
            <Input.Password placeholder={t('user.form.input.password.placeholder')} />
          </Form.Item>
        ) : null}
        <Form.Item
          label={t('user.form.input.mobile.label')}
          name="mobile"
          rules={[{ message: t('user.form.input.mobile.error_message') }]}
        >
          <Input placeholder={t('user.form.input.mobile.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('user.form.input.department.label')}
          name="department"
          rules={[{ message: t('user.form.input.department.error_message') }]}
        >
          <Input placeholder={t('user.form.input.department.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('user.form.input.comment.label')}
          name="remark"
          rules={[{ message: t('member.slip.comment.tips') }]}
        >
          <Input.TextArea placeholder={t('user.form.input.comment.placeholder')} />
        </Form.Item>
      </Form>
    );
  };

  const renderAvatar = () => {
    return (
      <div className={styles.avatarContainer}>
        <div className={cls(styles.icon, {
          [styles.upload]: !!(uploading || uploadImg || !avatarKey)
        })}>
          <div className={styles.uploadAvatar}>
            <Spin spinning={uploading}>
              <NiceAvatar
                size={190}
                src={uploadImg}
                style={{ backgroundColor: '#1245fa' }}
              />
            </Spin>
          </div>
          {/*@ts-ignore*/}
          <div ref={multiAvatarRef} className={styles.multiAvatar} />
        </div>
        {/*<PermissionSection itemKey="User-uploadAvatar">*/}
        {/*  <Upload*/}
        {/*    name="image"*/}
        {/*    maxCount={1}*/}
        {/*    headers={getAuthHeader()}*/}
        {/*    accept=".jpg,.jpeg,.png,.gif"*/}
        {/*    showUploadList={false}*/}
        {/*    action={AJAX_PREFIX + 'user/avatar'}*/}
        {/*    onChange={onUploadChange}*/}
        {/*  >*/}
        {/*    <Button style={{marginBottom: 6}} size="small" icon={<UploadOutlined />}>*/}
        {/*      {t('user.form.button.upload')}*/}
        {/*    </Button>*/}
        {/*  </Upload>*/}
        {/*</PermissionSection>*/}
        <Button
          size="small"
          icon={<SyncOutlined />}
          onClick={generateSvgAvatar}
        >
          {t('user.form.button.random')}
        </Button>
      </div>
    );
  };

  return (
    <NiceModal
      width={890}
      destroyOnClose
      visible={visible}
      title={t(`user.form.${modalType}.title`)}
      okButtonProps={{
        loading: saveUserRequest.loading,
        onClick: onFormSubmit,
      }}
      onCancel={modal.hide}
    >
      <Row gutter={[24, 0]}>
        <Col flex="528px">{renderForm()}</Col>
        <Col flex="auto">{renderAvatar()}</Col>
      </Row>
    </NiceModal>
  );
};

export default MemberModal;

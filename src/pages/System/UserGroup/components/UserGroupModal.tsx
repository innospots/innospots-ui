import _ from 'lodash';
import React, { useEffect } from 'react';
import { useModel } from 'umi';

import { Form, Input, message, Cascader } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import NiceModal from '@/components/Nice/NiceModal';

export const MODAL_NAME = 'UserGroupModal';

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

function getParentGroupIds(item: any, dataMap: any) {
  const ids: string[] = [];

  function recurse(currentItem: any) {
    if (currentItem && currentItem.parentGroup) {
      const parentGroupId = currentItem.parentGroup.groupId + '';
      ids.push(parentGroupId);
      recurse(dataMap[parentGroupId]);
    }
  }

  recurse(item);

  return ids.reverse();
}

function findItemById(groupId: string, data: any) {
  // 创建一个以 groupId 为键的对象映射，方便查找
  const dataMap = {};
  data.forEach((item: any) => {
    dataMap[item.groupId] = item;
  });

  // 查找给定 groupId 的项
  const item = dataMap[groupId];
  if (!item) {
    throw new Error(`No item found with groupId: ${groupId}`);
  }

  // 获取此项的所有 parentGroup 的 groupId 并返回反转后的数组
  return getParentGroupIds(item, dataMap);
}

const UserGroupModal = ({ onSuccess }: { onSuccess: () => void }) => {
  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, modalType, initValues } = modalInfo;
  const { t } = useI18n(['user-group', 'common']);

  const { userGroups, userGroupOptions, saveUserGroupRequest } = useModel('User', (model) => ({
    userGroups: model.userGroups,
    userGroupOptions: model.userGroupOptions,
    saveUserGroupRequest: model.saveUserGroupRequest,
  }));

  const [formRes] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (modalType === 'edit' && initValues) {
        const parentGroupIds = findItemById(initValues.groupId, userGroups);
        formRes.setFieldsValue({
          ...initValues,
          parentGroupId: parentGroupIds,
        });
      }
    }
  }, [visible, modalType, initValues]);

  const saveUserGroup = async (data?: any) => {
    try {
      if (_.isArray(data.parentGroupId)) {
        data.parentGroupId = _.last(data.parentGroupId);
      }

      const postData = _.merge({}, {
        ...initValues,
      }, data);

      const result = await saveUserGroupRequest.runAsync(modalType, postData);

      if (result) {
        onSuccess?.();
        modal.hide();
        message.success(t('common.message.saveSuccess'));
      }
    } catch (error) {}
  };

  const handleOk = () => {
    formRes.validateFields().then((values) => {
      saveUserGroup(values);
    });
  };

  const renderForm = () => {
    return (
      <Form form={formRes} preserve={false} {...formItemLayout}>
        <Form.Item
          name="groupName"
          rules={[{ required: true }]}
          label={t('user-group.form.name.label')}
        >
          <Input maxLength={20} placeholder={t('common.input.placeholder')} />
        </Form.Item>
        <Form.Item label={t('user-group.form.name.label')} name="parentGroupId">
          <Cascader
            allowClear
            options={userGroupOptions}
            fieldNames={{ label: 'groupName', value: 'groupId' }}
            placeholder={t('common.input.placeholder')}
          />
        </Form.Item>
      </Form>
    );
  };

  return (
    <NiceModal
      title={t(`user-group.form.${modalType}.title`)}
      visible={visible}
      onOk={handleOk}
      onCancel={modal.hide}
      okButtonProps={{ loading: saveUserGroupRequest.loading }}
    >
      {renderForm()}
    </NiceModal>
  );
};

export default UserGroupModal;

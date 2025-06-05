import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Radio, Button, message } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import { saveEnvConfig } from '@/services/Setting';

export const MODAL_NAME = 'EnvModal';

export const TYPE_OPTIONS = ['boolean', 'number', 'string'];

const EnvModal: React.FC<{
  onSuccess: () => void;
}> = ({ onSuccess }) => {
  const { t } = useI18n(['system', 'common']);
  const [form] = Form.useForm();
  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, modalType, initValues } = modalInfo;

  const [curType, setCurType] = useState<string>('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (modalType === 'edit') {
        form.setFieldsValue(initValues);
      }
      setCurType(initValues?.type || '');
    } else {
      form.resetFields();
    }
  }, [modalType, visible, initValues]);

  const saveEnvConfigData = async (values: any) => {
    setLoading(true);
    try {
      const result = await saveEnvConfig(modalType === 'edit' ? 'put' : 'post', {
        ...(modalType === 'edit' ? initValues : {}),
        ...values,
      });
      if (result) {
        modal.hide();
        onSuccess?.();
        message.success(t('common.error_message.save.success'));
      } else {
        message.error('Save error');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = () => {
    form.validateFields().then(values => {
      saveEnvConfigData(values);
    });
  };

  const handleTypeChange = (type: string) => {
    let defaultValue: any = undefined;

    if (type === 'boolean') {
      defaultValue = 'true';
    }

    form.setFieldsValue({ value: defaultValue });
    
    if (!defaultValue) {
      form.resetFields(['value']);
    }

    setCurType(type);
  };

  const renderValueInput = () => {
    switch (curType) {
      case 'boolean':
        return (
          <Radio.Group>
            <Radio value="true">true</Radio>
            <Radio value="false">false</Radio>
          </Radio.Group>
        );
      case 'number':
        return <InputNumber placeholder={t('common.input.placeholder')} style={{ width: '100%' }} />;
      default:
        return (
          <Input.TextArea
            rows={4}
            maxLength={200}
            placeholder={t('common.input.placeholder')}
          />
        );
    }
  };

  return (
    <Modal 
      open={visible}
      width={600}
      maskClosable={false}
      title={t(`system.env.modal.${modalType}_title`)}
      footer={[
        <Button key="cancel" onClick={modal.hide}>
          {t('common.button.cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {t('common.button.confirm')}
        </Button>
      ]}
      onCancel={modal.hide}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        style={{ marginTop: 32 }}
        onFinish={handleSubmit}
        onValuesChange={(changedValues) => {
          if ('type' in changedValues) {
            handleTypeChange(changedValues.type);
          }
        }}
      >
        <Form.Item
          name="name"
          label={t('system.env.modal.form_label_name')}
          rules={[{ required: true }]}
        >
          <Input maxLength={60} placeholder={t('common.input.placeholder')} />
        </Form.Item>

        <Form.Item
          name="code"
          label={t('system.env.modal.form_label_code')}
          rules={[{ required: true }]}
        >
          <Input maxLength={60} placeholder={t('common.input.placeholder')} />
        </Form.Item>

        <Form.Item
          name="type"
          label={t('system.env.modal.form_label_type')}
          rules={[{ required: true }]}
        >
          <Select placeholder={t('common.select.placeholder')}>
            {TYPE_OPTIONS.map(type => (
              <Select.Option key={type} value={type}>
                {_.upperFirst(type)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="value"
          label={t('system.env.modal.form_label_value')}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (getFieldValue('type') === 'number' && isNaN(Number(value))) {
                  return Promise.reject(t('system.env.modal.number_invalid'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          {renderValueInput()}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EnvModal;
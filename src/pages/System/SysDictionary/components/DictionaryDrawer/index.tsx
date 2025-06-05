import React, { useEffect } from 'react';
import { Drawer, Form, Input, Button, Space, Row, Col, message, Spin } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

export const DRAWER_NAME = 'DictionaryDrawer';

const DictionaryDrawer: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { t } = useI18n(['sysDictionary', 'common']);

  const [drawer, drawerInfo] = useModal(DRAWER_NAME);
  const { visible, modalType, initValues = {} } = drawerInfo;

  const { saveDictionaryRequest, dictionaryDetailsRequest } = useModel(
    'SysDictionary',
    (model) => ({
      saveDictionaryRequest: model.saveDictionaryRequest,
      dictionaryDetailsRequest: model.dictionaryDetailsRequest,
    }),
  );

  useEffect(() => {
    if (visible) {
      if (['edit', 'view'].includes(modalType)) {
        getDictionaryDetails(initValues.type);
      }
    } else {
      form.resetFields();
    }
  }, [visible, modalType, initValues]);

  const setInitValues = (values: any) => {
    form.setFieldsValue(values);
  };

  const getDictionaryDetails = async (type: string) => {
    const result = await dictionaryDetailsRequest.runAsync(type);
    setInitValues(result);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const postData = modalType === 'edit' ? { ...initValues, ...values } : values;

      const result = await saveDictionaryRequest.runAsync(postData);

      if (result) {
        message.success(t('common.error_message.save.success'));
        drawer.hide();
        onSuccess?.();
      }
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <Drawer
      width={600}
      open={visible}
      onClose={drawer.hide}
      title={t(`sysDictionary.drawer.${modalType}.title`)}
      footer={
        modalType !== 'view' && (
          <Row justify="end">
            <Space>
              <Button onClick={drawer.hide}>{t('common.button.cancel')}</Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={
                  modalType === 'edit'
                    ? saveDictionaryRequest.loading
                    : saveDictionaryRequest.loading
                }
              >
                {t('common.button.confirm')}
              </Button>
            </Space>
          </Row>
        )
      }
    >
      <Spin spinning={dictionaryDetailsRequest.loading}>
        <Form form={form} layout="vertical" disabled={modalType === 'view'}>
          <Form.Item
            name="type"
            label={t('sysDictionary.form.label.type')}
            rules={[{ required: true, message: t('sysDictionary.form.rule.type_required') }]}
          >
            <Input maxLength={60} placeholder={t('common.input.placeholder')} />
          </Form.Item>

          <Form.Item
            name="typeName"
            label={t('sysDictionary.form.label.type_name')}
            rules={[{ required: true, message: t('sysDictionary.form.rule.type_name_required') }]}
          >
            <Input maxLength={60} placeholder={t('common.input.placeholder')} />
          </Form.Item>

          <Form.List name="dictionaries">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Form.Item
                    key={key}
                    required={false}
                    label={name === 0 ? t('sysDictionary.form.label.dictionaries') : ''}
                    style={{ marginBottom: 0 }}
                  >
                    <Row gutter={8}>
                      <Col span={11}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              required: true,
                              message: t('sysDictionary.form.rule.detail_name_required'),
                            },
                          ]}
                        >
                          <Input
                            maxLength={60}
                            placeholder={t('sysDictionary.form.name.placeholder')}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={11}>
                        <Form.Item
                          {...restField}
                          name={[name, 'dictValue']}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              required: true,
                              message: t('sysDictionary.form.rule.detail_value_required'),
                            },
                          ]}
                        >
                          <Input
                            maxLength={60}
                            placeholder={t('sysDictionary.form.value.placeholder')}
                          />
                        </Form.Item>
                      </Col>
                      {modalType !== 'view' && (
                        <Col span={2} style={{ lineHeight: '32px' }}>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Col>
                      )}
                    </Row>
                  </Form.Item>
                ))}
                {modalType !== 'view' && (
                  <Form.Item
                    label={fields.length === 0 ? t('sysDictionary.form.label.dictionaries') : ''}
                  >
                    <Button block type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                      {t('sysDictionary.form.button.add_item')}
                    </Button>
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>
        </Form>
      </Spin>
    </Drawer>
  );
};

export default DictionaryDrawer;

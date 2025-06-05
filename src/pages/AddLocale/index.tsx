import { Button, Form, Input, Select, message } from 'antd';
import { fetch } from '@/common/request';
import { useRequest } from 'ahooks';

const LOCALE_OPTIONS = [
  { label: 'zh_CN', value: 'zh_CN' },
  { label: 'en_US', value: 'en_US' },
];

const FILE_PATH_OPTIONS = {
  'zh_CN': '/tmp/locales/cn.json',
  'en_US': '/tmp/locales/en.json',
};

const addLocaleService = (data: any) => {
  return fetch('i18n/translation/import-json', {
    method: 'POST',
    params: data,
  });
};

export default function AddLocale() {
  const [form] = Form.useForm();

  const addRequest = useRequest(addLocaleService, {
    manual: true,
  });

  const handleSubmit = async (values: any) => {
    await addRequest.runAsync(values);
    message.success('Add locale success');
    form.resetFields();
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.locale) {
      const filePath = FILE_PATH_OPTIONS[allValues.locale as keyof typeof FILE_PATH_OPTIONS];
      form.setFieldsValue({ filePath });
    }
  };

  return (
    <div style={{ width: '500px', margin: '60px auto 0' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} onValuesChange={handleValuesChange}>
        <Form.Item required label="Locale" name="locale" initialValue="zh_CN">
          <Select options={LOCALE_OPTIONS} placeholder="Select Locale" />
        </Form.Item>
        <Form.Item required label="File Path" name="filePath" initialValue="/tmp/locales/cn.json">
          <Input placeholder="Please enter the file path" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={addRequest.loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
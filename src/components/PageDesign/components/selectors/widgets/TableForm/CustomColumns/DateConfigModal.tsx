import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Row, Col, Table, Input, Form, Select, Switch } from 'antd';
import {DeleteOutlined} from '@ant-design/icons';

import useModal from '@/common/hooks/useModal';
import NiceModal from '@/components/Nice/NiceModal';

export const MODAL_NAME = 'DateConfigModal';

const DATE_FORMAT_OPTIONS = [
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { label: 'YYYY-MM-DD HH:mm', value: 'YYYY-MM-DD HH:mm' },
  { label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
]

const DateConfigModal = ({ onComplete }) => {
  const curIndex = useRef()
  const [options, setOptions] = useState<any[]>([])
  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, initValues } = modalInfo;

  const [form] = Form.useForm()

  useEffect(() => {
    if (initValues) {
      curIndex.current = initValues.index
      form.setFieldsValue(initValues.config)
    } else {
      form.resetFields()
    }
  }, [ initValues ])

  const handleComplete = () => {
    form.validateFields().then(values => {
      onComplete?.({
        config: values,
        index: curIndex.current
      })
    })
  }

  return (
    <NiceModal
      simple
      width={600}
      destroyOnClose
      open={visible}
      title="日期配置"
      onCancel={modal.hide}
      onOk={handleComplete}
    >
      <Form form={form} labelCol={{span: 6}}>
        <Form.Item label="日期格式" name="format">
          <Select options={DATE_FORMAT_OPTIONS} placeholder="请选择日期格式" />
        </Form.Item>
        <Form.Item label="是否日期范围" name="isRange" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </NiceModal>
  )
}

export default DateConfigModal

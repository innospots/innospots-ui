import React from 'react';
import { Form, FormItemProps } from 'antd';

export const WidgetFormItem:React.FC<{
  itemProps: FormItemProps
}> = ({ children, itemProps }) => {

  return (
    <Form.Item { ...itemProps }>
      { children }
    </Form.Item>
  )
}
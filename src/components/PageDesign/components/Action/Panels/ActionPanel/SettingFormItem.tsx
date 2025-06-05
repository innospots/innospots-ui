import React from 'react'

import { Form, FormItemProps } from 'antd'

const SettingFormItem:React.FC<FormItemProps> = ({ children, ...rest }) => {

  return (
    <Form.Item { ...rest }>
      { children }
    </Form.Item>
  )
}

export default SettingFormItem
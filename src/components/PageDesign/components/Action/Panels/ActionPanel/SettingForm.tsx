import React, { useEffect } from 'react'
import { useModel } from 'umi'
import {Form, FormProps} from 'antd'

const SettingForm:React.FC<FormProps> = ({ children, ...rest }) => {

  const [form] = Form.useForm()
  const { setActionFormIns, updateActionFormData } = useModel('Action', model => ({
    setActionFormIns: model.setActionFormIns,
    updateActionFormData: model.updateActionFormData,
  }))

  useEffect(() => {
    setActionFormIns(form)
  }, [ form ])

  const handleValuesChange = (changedValues, allValues) => {
    updateActionFormData(allValues)
  }

  return (
    <Form
      form={form}
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      autoComplete="off"
      onValuesChange={handleValuesChange}
      { ...rest }
    >
      { children }
    </Form>
  )
}

export default SettingForm
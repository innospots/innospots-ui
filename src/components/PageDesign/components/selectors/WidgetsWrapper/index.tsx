import _ from 'lodash'
import React, { useMemo, useEffect } from 'react';
import { Form } from 'antd';
import { useModel } from 'umi';
import { useDeepCompareEffect } from 'ahooks'

const WidgetsWrapper: React.FC<{
  onValuesChange?: (changedValues, allValues) => void
  getFormInstance?: (form: any) => void
}> = ({ onValuesChange, getFormInstance, children }) => {
  const [form] = Form.useForm();

  const { formValues, widgetInited, updateFormValue, setFormErrorFields } = useModel('AppEditor', (model) => ({
    formValues: model.formValues,
    widgetInited: model.widgetInited,
    updateFormValue: model.updateFormValue,
    setFormErrorFields: model.setFormErrorFields,
  }));

  useEffect(() => {
    getFormInstance?.({
      ...form,
      validateFields: async (nameList) => {
        try {
          setFormErrorFields([])
          const result = await form.validateFields(nameList)
          return Promise.resolve(_.merge({}, formValues.initialValues, result))
        } catch (e: any) {
          setFormErrorFields(e?.errorFields)
          return Promise.reject(e)
        }
      }
    })
  }, [ form ])

  useDeepCompareEffect(() => {
    form.resetFields()
    form.setFieldsValue(_.cloneDeep({
      ...formValues.initialValues
    }))
  }, [ formValues.initialValues ])

  const handleValuesChange = (changedValues, allValues) => {
    formValues.editValues = {
      ...allValues
    }

    updateFormValue(formValues)
    onValuesChange?.(changedValues, allValues)
  };

  return (
    <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
      { widgetInited && children }
    </Form>
  );
};

export default WidgetsWrapper;

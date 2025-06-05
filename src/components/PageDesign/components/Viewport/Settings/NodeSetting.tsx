import _ from 'lodash'
import React, {useEffect} from 'react';
import { useModel } from 'umi'
import {Form, Input, Switch} from 'antd';

import { SettingItem } from './index'

export const NodeSetting = () => {
  const [form] = Form.useForm()

  const {
    nodeInfo,
    updateNodeInfoData
  } = useModel('FlowNode', model => ({
    nodeInfo: model.nodeInfo,
    updateNodeInfoData: model.updateNodeInfoData
  }))

  useEffect(() => {
    if (form && nodeInfo) {
      form.setFieldsValue({
        ...nodeInfo
      })
    }
  }, [ form, nodeInfo ])

  const handleValuesChange = _.debounce((changedValues, allValues) => {
    updateNodeInfoData({
      ...allValues
    })
  }, 1000)

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
    >
      <div>
        <SettingItem name={['settings', 'formWidth']} label="表单宽度" required>
          <Input placeholder="请输入" />
        </SettingItem>
        <SettingItem name={['settings', 'isFixedWidth']} label="固定宽度" valuePropName="checked" required>
          <Switch />
        </SettingItem>
        <SettingItem name={['settings', 'formMinWidth']} label="表单最小宽度" required>
          <Input placeholder="请输入" />
        </SettingItem>
        <SettingItem name={['settings', 'formMaxWidth']} label="表单最大宽度" required>
          <Input placeholder="请输入" />
        </SettingItem>
      </div>
    </Form>
  )
}
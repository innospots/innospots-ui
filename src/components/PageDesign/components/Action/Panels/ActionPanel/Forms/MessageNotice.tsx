import React from 'react'
import { useModel } from 'umi'
import { Form, Radio, Input } from 'antd'
import {CheckCircleFilled, InfoCircleFilled, CloseCircleFilled, ExclamationCircleFilled} from '@ant-design/icons'

import SettingFormItem from '../SettingFormItem'
import DropdownSelect from './components/DropdownSelect'
// import ContentExpressionInput from './components/ContentExpressionInput'

const getIconStyle = (color) => {
  return {
    color,
    fontSize: 14,
    marginRight: 8
  }
}

export const defaultData = {
  type: 'FIXED_VALUE',
  style: 'success',
  content: '处理成功',
  failContent: '处理失败',
  successContent: '处理成功'
}

export const MessageNotice:React.FC = () => {
  const { currentFormData } = useModel('Action', model => ({
    currentFormData: model.currentActionFormData
  }))
  const alertType = currentFormData.type

  const noticeItems = [{
    key: 'success',
    label: (
      <>
        <CheckCircleFilled style={getIconStyle('var(--polaris-success-color)')} />
        <span>Success</span>
      </>
    )
  }, {
    key: 'warning',
    label: (
      <>
        <ExclamationCircleFilled style={getIconStyle('var(--polaris-warning-color)')} />
        <span>Warning</span>
      </>
    )
  }, {
    key: 'error',
    label: (
      <>
        <CloseCircleFilled style={getIconStyle('var(--polaris-error-color)')} />
        <span>Error</span>
      </>
    )
  }, {
    key: 'info',
    label: (
      <>
        <InfoCircleFilled style={getIconStyle('var(--polaris-info-color)')} />
        <span>Info</span>
      </>
    )
  }]

  const renderFormItems = () => {
    if (!alertType) return null

    if (alertType === 'FIXED_VALUE') {
      return (
        <>
        <SettingFormItem
          name="style"
          label="提示样式"
          rules={[{required: true, message: '请选择提示样式'}]}
        >
          <DropdownSelect items={noticeItems} />
        </SettingFormItem>
        <SettingFormItem
          name="content"
          label="消息内容"
          rules={[{required: true, message: '请输入消息内容'}]}
        >
          <Input placeholder="请输入" />
        </SettingFormItem>
        </>
      )
    } else {
      return (
        <>
        <SettingFormItem
          name="successContent"
          label="成功时提示内容"
        >
          <Input placeholder="请输入" />
        </SettingFormItem>
        <SettingFormItem
          name="failContent"
          label="失败时提示内容"
        >
          <Input placeholder="请输入" />
        </SettingFormItem>
        </>
      )
    }
  }

  return (
    <>
      <SettingFormItem
        name="type"
        label="提示类型"
        rules={[{required: true, message: '请选择提示样式'}]}
      >
        <Radio.Group>
          <Radio value="FIXED_VALUE">固定类型提示</Radio>
          <Radio value="LAST_EVENT_VALUE">根据上一事件结果</Radio>
        </Radio.Group>
      </SettingFormItem>
      { renderFormItems() }
      {/* <SettingFormItem
        name="autoClose"
        label="自动关闭"
        valuePropName="checked"
      >
        <Switch />
      </SettingFormItem> */}
    </>
  )
}
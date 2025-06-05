import React, {useState, useEffect} from 'react';
import { useModel } from 'umi'
import { Form, Select } from 'antd';

import * as ApproveService from '@/services/Approve'

import { SettingItem } from './index'
import DataSourceSelect
  from '@/components/PageDesign/components/Action/Panels/ActionPanel/Forms/components/DataSourceSelect';

let _approveTypes

export const ApproveDataSetting = () => {
  const [form] = Form.useForm()
  const [approveTypes, setApproveTypes] = useState<any[]>([])

  const {
    currentPage,
    updateCurrentPage
  } = useModel('AppEditor', model => ({
    currentPage: model.currentPage,
    updateCurrentPage: model.updateCurrentPage
  }))

  useEffect(() => {
    if (form) {
      form.setFieldsValue({
        ...currentPage
      })
    }
  }, [ form, currentPage ])

  const getApproveApps = async () => {

    if (_approveTypes) {
      setApproveTypes(_approveTypes)
      return
    }

    try {
      const result = await ApproveService.fetchApproveTypes();
      _approveTypes = result;
      setApproveTypes(_approveTypes)
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getApproveApps()
  }, [])

  const handleValuesChange = (changedValues) => {
    updateCurrentPage(changedValues)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
    >
      <div>
        <SettingItem name={['configs', 'table']} label="数据提交接口" required>
          <DataSourceSelect />
        </SettingItem>
        <SettingItem name={['configs', 'approveType']} label="审批类型" required>
          <Select placeholder="请选择" style={{width: '100%'}}>
            {approveTypes?.map((item) => <Select.Option key={item.value} value={item.value}>{item.name}</Select.Option>)}
          </Select>
        </SettingItem>
      </div>

      {/*<SettingBox title="布局">*/}
      {/*  <SettingItem label="整体布局" required>*/}
      {/*    <Select placeholder="请选择" style={{width: '100%'}}>*/}
      {/*      <Select.Option value="1">一行一列</Select.Option>*/}
      {/*      <Select.Option value="2">一行两列</Select.Option>*/}
      {/*      <Select.Option value="3">一行三列</Select.Option>*/}
      {/*    </Select>*/}
      {/*  </SettingItem>*/}
      {/*  <SettingItem label="标签展示模式" required>*/}
      {/*    <Radio.Group>*/}
      {/*      <Radio value="apple">单独一行</Radio>*/}
      {/*      <Radio value="pear">同行</Radio>*/}
      {/*    </Radio.Group>*/}
      {/*  </SettingItem>*/}
      {/*</SettingBox>*/}
    </Form>
  )
}
import React, { useRef } from 'react';
import { useModel } from 'umi'
import { Tabs, Switch, Select, InputNumber, Input } from 'antd'

import { WidgetSetting, SettingBox, SettingItem, WidgetNameSetting, WidgetCommonSetting } from '@/components/PageDesign/components/Viewport/Settings'

import DataQuery from './DataQuery'
import PageParams from './PageParams'
import RowClickEvent from './RowClickEvent'

const Settings:React.FC = () => {
  const {
    getSettings
  } = useModel('AppEditor', model => ({
    getSettings: model.getSelectedWidgetSettings
  }))

  const {
    serverPaging
  } = getSettings()

  const renderSettingsSettings = () => {
    return (
      <>
        <SettingBox title="数据">
          <SettingItem required name={['settings', 'dataOptions']} label="关联数据">
            <DataQuery />
          </SettingItem>
        </SettingBox>
        <SettingBox title="分页">
          <SettingItem required name={['settings', 'paging']} label="启用分页" valuePropName="checked">
            <Switch />
          </SettingItem>
          <SettingItem required name={['settings', 'pageSize']} label="每页显示条数">
            <InputNumber precision={0} placeholder="请输入" style={{width: '100%'}} />
          </SettingItem>
          <SettingItem required name={['settings', 'serverPaging']} label="启用服务器端分页" valuePropName="checked">
            <Switch />
          </SettingItem>
          {
            serverPaging && (
              <>
                <SettingItem required name={['settings', 'total']} label="数据总数">
                  <Select placeholder="请选择API" />
                </SettingItem>
                <SettingItem required name={['settings', 'pageParams']} label="分页参数绑定">
                  <PageParams />
                </SettingItem>
              </>
            )
          }
        </SettingBox>
        <SettingBox title="事件">
          <SettingItem name={['settings', 'rowClickEvent']} label="OnRowClick">
            <RowClickEvent />
          </SettingItem>
        </SettingBox>
      </>
    )
  }

  const tabItems = [
    { label: '属性设置', key: 'settings', children: renderSettingsSettings() },
    { label: '样式', key: 'styles', children: '内容 2' },
  ]

  return (
    <WidgetSetting>
      <WidgetNameSetting />
      <SettingItem required name={['settings', 'label']} label="标题">
        <Input placeholder="请输入标题名称" />
      </SettingItem>
      <WidgetCommonSetting />
      <Tabs items={tabItems} tabBarStyle={{paddingLeft: 24, paddingRight: 24}} />
    </WidgetSetting>
  )
}

export default Settings
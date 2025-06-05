import { useModel } from 'umi'
import React, { useRef, useMemo, useEffect } from 'react';
import {Input, Radio, Select, Divider} from 'antd'

import type { FormInstance } from 'antd'

import { getFormatOptions } from '@/components/PageDesign/utils'
import { WidgetSetting, SettingItem, WidgetNameSetting, WidgetCommonSetting, WidgetFieldSource, WidgetConditionRule } from '@/components/PageDesign/components/Viewport/Settings'

import OptionsTable from '../../KeyValueEditor/Widget';

const VIEW_TYPE_OPTIONS = [
  { label: '选择器', value: 'picker' },
  { label: '单选框', value: 'radio' },
  { label: '按钮组', value: 'button' },
]

const DATA_SOURCE_OPTIONS = [
  { label: '手动输入', value: 'static' },
  { label: '接口输入', value: 'interface' },
  { label: '输入字段', value: 'input' }
]

const OPTIONS_METHOD = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
]

const Settings:React.FC = () => {
  const {
    getSettings
  } = useModel('AppEditor', model => ({
    getSettings: model.getSelectedWidgetSettings
  }))

  const formRef = useRef<FormInstance>()
  const { options, dataSource } = getSettings()
  const isStatic = useMemo(() => (dataSource === 'static'), [ dataSource ])
  const isInterface = useMemo(() => (dataSource === 'interface'), [ dataSource ])
  const isInputField = useMemo(() => (dataSource === 'input'), [ dataSource ])

  const isDynamic = (isInputField || isInterface)

  useEffect(() => {
    if (formRef.current) {
      formRef.current.setFieldsValue({
        settings: getSettings()
      })
    }
  }, [ formRef.current, isDynamic ])

  const formatOptions = useMemo(() => getFormatOptions(options), [ options ])

  const getForm = form => {
    formRef.current = form
  }

  return (
    <WidgetSetting getForm={getForm}>
      <WidgetNameSetting />
      <WidgetCommonSetting />
      <SettingItem required name={['settings', 'label']} label="标题">
        <Input placeholder="请输入标题名称" />
      </SettingItem>
      <SettingItem required name={['settings', 'placeholder']} label="提示信息">
        <Input placeholder="请输入提示信息" />
      </SettingItem>
      <SettingItem name={['settings', 'initialValue']} label="默认值">
        <Select placeholder="请选择" options={formatOptions} allowClear />
      </SettingItem>
      <SettingItem name={['settings', 'viewType']} label="展现形式">
        <Radio.Group options={VIEW_TYPE_OPTIONS} />
      </SettingItem>
      <SettingItem name={['settings', 'dataSource']} label="选项数据源">
        <Radio.Group options={DATA_SOURCE_OPTIONS} />
      </SettingItem>
      <SettingItem noStyle hidden={isStatic}>
        {
          isInterface && (
            <>
              <SettingItem required name={['settings', 'dynamicOptions', 'url']} label="选项URL">
                <Input placeholder="请输入" />
              </SettingItem>
              <SettingItem required name={['settings', 'dynamicOptions', 'method']} initialValue="GET" label="请求方式">
                <Radio.Group options={OPTIONS_METHOD} />
              </SettingItem>
              <div style={{padding: '0 8px'}}>
                <span style={{paddingLeft: 12}}>字段映射：</span>
                <Divider style={{margin: '8px 0'}} />
                <SettingItem name={['settings', 'dynamicOptions', 'fieldNames', 'value']} label="字段值">
                  <Input placeholder="请输入" />
                </SettingItem>
                <SettingItem name={['settings', 'dynamicOptions', 'fieldNames', 'label']} label="字段文字">
                  <Input placeholder="请输入" />
                </SettingItem>
              </div>
            </>
          )
        }
        {
          isInputField && <WidgetFieldSource />
        }
      </SettingItem>
      <SettingItem hidden={isDynamic} name={['settings', 'options']} label="选项">
        <OptionsTable />
      </SettingItem>
      <WidgetConditionRule />
    </WidgetSetting>
  )
}

export default Settings
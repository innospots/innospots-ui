import React, { useMemo } from 'react';
import _ from 'lodash'
import { useModel } from 'umi'
import { Switch, Input, Select, Radio } from 'antd'

import { ExpressionInput } from '@/components/Expression'
import RowClickEvent from '../RowClickEvent'

import { SettingDrawer, WidgetSetting, SettingBox, SettingItem, SettingDrawerProps } from '@/components/PageDesign/components/Viewport/Settings';

const DATA_TYPES = [
  'Number',
  'String',
  'Button'
].map(type => ({
  value: type,
  label: type
}))
const ALIGN_OPTIONS = [{
  value: 'left',
  label: '左对齐'
}, {
  value: 'center',
  label: '居中'
}, {
  value: 'right',
  label: '右对齐'
}]

const ColumnSetting: React.FC<SettingDrawerProps & {
  value: any
  onChange: (v: any) => void
}> = ({ value: index, onChange, ...rest }) => {
  const {
    selectedWidget
  } = useModel('AppEditor', model => ({
    selectedWidget: model.selectedWidget
  }))

  const currentColumn = useMemo(() => {
    if (selectedWidget) {
      const dataOptions = selectedWidget.settings?.dataOptions || {}
      return dataOptions.columns?.[index]
    }

    return null
  }, [ selectedWidget, index ])

  const isShowFieldValue = useMemo(() => ['String', 'Number'].includes(currentColumn?.dataType), [ currentColumn ])

  const getFormItemName = (name: string) => ['settings', 'dataOptions', 'columns', index, name]

  const renderButtonSetting = () => {
    return (
      <SettingBox hideCollapsed title="按钮">
        <SettingItem required name={getFormItemName('buttonText')} label="名称">
          <Input placeholder="请输入" maxLength={20} />
        </SettingItem>
        <SettingItem name={['settings', 'rowClickEvent']} label="OnClick">
          <RowClickEvent />
        </SettingItem>
      </SettingBox>
    )
  }

  const renderDataTypeSettings = () => {
    if (!currentColumn) return null

    const dataType = currentColumn.dataType

    if (dataType === 'Button') {
      return renderButtonSetting()
    }

    return null
  }

  return (
    <SettingDrawer title="列设置" { ...rest }>
      <WidgetSetting>
        <SettingBox>
          <SettingItem required name={getFormItemName('name')} label="列名称">
            <Input placeholder="请输入" maxLength={20} />
          </SettingItem>
        </SettingBox>
        <SettingBox hideCollapsed title="数据">
          <SettingItem required name={getFormItemName('dataType')} label="数据类型">
            <Select placeholder="请选择" options={DATA_TYPES} />
          </SettingItem>
          {
            isShowFieldValue && (
              <SettingItem required name={getFormItemName('fieldValue')} label="字段值">
                <ExpressionInput />
              </SettingItem>
            )
          }
        </SettingBox>
        { renderDataTypeSettings() }
        <SettingBox hideCollapsed title="通用">
          <SettingItem required name={getFormItemName('visible')} label="是否展示" valuePropName="checked">
            <Switch />
          </SettingItem>
          <SettingItem required name={getFormItemName('width')} label="列宽度">
            <Input placeholder="请输入" maxLength={20} />
          </SettingItem>
          <SettingItem required name={getFormItemName('align')} label="文本对齐">
            <Radio.Group options={ALIGN_OPTIONS} />
          </SettingItem>
          <SettingItem required name={getFormItemName('isWrap')} label="自动换行" valuePropName="checked">
            <Switch />
          </SettingItem>
        </SettingBox>
      </WidgetSetting>
    </SettingDrawer>
  )
};

export default ColumnSetting;

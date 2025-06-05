import React, {useEffect} from 'react';
import { useModel } from 'umi'
import { Form, Input, Switch } from 'antd';

import useI18n from '@/common/hooks/useI18n';

import { SettingItem } from './index'
import DataSourceSelect
  from '@/components/PageDesign/components/Action/Panels/ActionPanel/Forms/components/DataSourceSelect';

export const AppDataSetting = () => {
  const [form] = Form.useForm() 
  const { t } = useI18n(['app', 'common'])

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

  const handleValuesChange = (changedValues) => {
    updateCurrentPage(changedValues)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        configs: {
          messageField: 'message',
          collapse: false,
          close: false,
        },
      }}
      onValuesChange={handleValuesChange}
    >
      <div>
        <SettingItem name={['configs', 'table']} label={t('app.data.setting.table')} required>
          <DataSourceSelect />
        </SettingItem>
        <SettingItem name={['configs', 'messageField']} label={t('app.data.setting.message_name')} required>
          <Input placeholder={t('common.input.placeholder')} />
        </SettingItem>
        <SettingItem name={['configs', 'collapse']} label={t('app.data.setting.collapse')} valuePropName="checked">
          <Switch />
        </SettingItem>
        <SettingItem name={['configs', 'close']} label={t('app.data.setting.close')} valuePropName="checked">
          <Switch />
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
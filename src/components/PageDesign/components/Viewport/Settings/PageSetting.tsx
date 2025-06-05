import React, {useEffect} from 'react';
import { useModel } from 'umi'
import {Form, Input, Switch} from 'antd';

import useI18n from '@/common/hooks/useI18n';

import { SettingItem } from './index'

export const PageSetting = () => {
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
      onValuesChange={handleValuesChange}
    >
      <div>
        <SettingItem name="pageName" label={t('app.page.form.pageName')} required>
          <Input placeholder={t('common.input.placeholder')} />
        </SettingItem>
        <SettingItem name="pageUrl" label={t('app.page.form.pageUrl')} required>
          <Input placeholder={t('common.input.placeholder')} />
        </SettingItem>
        <SettingItem name="showNavigation" label={t('app.page.form.showNavigation')} valuePropName="checked" required>
          <Switch />
        </SettingItem>
        <SettingItem name="setHomePage" label={t('app.page.form.setHomePage')} valuePropName="checked" required>
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
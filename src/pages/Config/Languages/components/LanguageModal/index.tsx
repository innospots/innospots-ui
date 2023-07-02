/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { useMemo, useEffect } from 'react';

import { useModel } from 'umi';

import { Form, Input, Select, Switch, message } from 'antd';

import NiceModal from '@/components/Nice/NiceModal';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import FlagIcon from '@/components/Icons/FlagIcon';
import { getFormattedLocale } from '@/common/utils';
import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

export const MODAL_NAME = 'LanguageModal';

const LanguageModal: React.FC = () => {
  const [formRes] = Form.useForm();

  const { locales, saveLanguageRequest, fetchLocalesRequest, fetchLanguagesRequest } =
    useModel('I18n');

  const { currencies } = useModel('Currency', (model) => ({
    currencies: model.currencies,
  }));

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const { visible, modalType, initValues } = modalInfo;

  const { t } = useI18n(['language', 'common']);

  const localeListData = useMemo(
    () =>
      Object.keys(locales)?.map((key) => ({
        label: locales?.[key],
        value: key,
      })),
    [locales],
  );

  const flagListData = useMemo(
    () =>
      Object.keys(locales)?.reduce((pre: any[], cur: string) => {
        const [, , , code] = getFormattedLocale(cur);
        pre.push({
          label: <FlagIcon code={code} />,
          value: cur,
        });
        return pre;
      }, []),
    [locales],
  );

  const currencyListData = useMemo(
    () =>
      currencies?.map((currency: { name: string; currencyId: string }) => ({
        label: currency.name,
        value: currency.currencyId,
      })),
    [currencies],
  );

  useEffect(() => {
    if (visible) {
      setInitValues();
      fetchLocalesRequest.run();
    }
  }, [visible, modalType, initValues]);

  const setInitValues = () => {
    formRes.setFieldsValue({
      ...initValues,
      status: initValues.status === 'ONLINE',
    });
  };

  const handleFormSubmit = () => {
    formRes.validateFields().then((values) => {
      saveLanguageData(values);
    });
  };

  const saveLanguageData = async (values: any) => {
    try {
      let postData = values;

      if (modalType === 'edit' && initValues) {
        postData = {
          ...initValues,
          ...postData,
        };
      }

      postData = {
        ...postData,
        status: postData.status ? 'ONLINE' : 'OFFLINE',
      };

      const result = await saveLanguageRequest.runAsync(modalType, postData);

      if (result) {
        message.success(t('common.error_message.save.success'));
        modal.hide();

        fetchLanguagesRequest.run({
          ...DEFAULT_PAGINATION_SETTINGS,
        });
      }
    } catch (e) {}
  };

  const renderForm = () => {
    return (
      <Form form={formRes} preserve={false} {...formItemLayout}>
        <Form.Item
          name="name"
          label={t('language.form.input.name.label')}
          rules={[
            {
              required: true,
              message: t('language.form.name.error_message'),
            },
            {
              pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]{1,32}$/,
              message: t('language.form.name.error_message2'),
            },
          ]}
        >
          <Input placeholder={t('language.form.input.name.placeholder')} />
        </Form.Item>
        <Form.Item
          name="locale"
          label={t('language.form.locale.label')}
          rules={[{ required: true, message: t('language.form.locale.placeholder') }]}
        >
          <Select options={localeListData} placeholder={t('language.form.locale.placeholder')} />
        </Form.Item>
        <Form.Item
          name="locale"
          label={t('language.form.flag.label')}
          // rules={[{required: true, message: t('language.form.flag.placeholder')}]}
        >
          <Select
            options={flagListData}
            disabled
            placeholder={t('language.form.flag.placeholder')}
          />
        </Form.Item>
        <Form.Item
          name="currencyId"
          label={t('language.form.currency.label')}
          rules={[{ required: true, message: t('language.form.currency.placeholder') }]}
        >
          <Select
            options={currencyListData}
            placeholder={t('language.form.currency.placeholder')}
          />
        </Form.Item>
        <Form.Item
          name="thousandSeparator"
          label={t('language.form.comma.label')}
          rules={[
            {
              required: true,
              message: t('language.form.comma.error_message'),
            },
          ]}
        >
          <Input placeholder={t('language.form.comma.placeholder')} />
        </Form.Item>
        <Form.Item
          name="decimalSeparator"
          label={t('language.form.separator.label')}
          rules={[
            {
              required: true,
              message: t('language.form.separator.error_message'),
            },
          ]}
        >
          <Input placeholder={t('language.form.separator.placeholder')} />
        </Form.Item>
        {/*<Form.Item
          label={t('language.form.default_lan.label')}
          name="defaultLan"
          rules={[{required: true, message: t('请选择默认语言!')}]}
        >
          <Radio.Group style={{marginTop: 8}}>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>*/}
        <Form.Item
          name="status"
          label={t('language.form.status.label')}
          valuePropName="checked"
          rules={[{ required: true }]}
        >
          <Switch
            checkedChildren={t('common.text.activate')}
            unCheckedChildren={t('common.text.deactivate')}
          />
        </Form.Item>
      </Form>
    );
  };

  return (
    <NiceModal
      width={716}
      destroyOnClose
      visible={visible}
      title={t(`language.form.${modalType}.title`)}
      okButtonProps={{
        loading: saveLanguageRequest.loading,
        onClick: handleFormSubmit,
      }}
      onCancel={modal.hide}
    >
      {renderForm()}
    </NiceModal>
  );
};

export default LanguageModal;

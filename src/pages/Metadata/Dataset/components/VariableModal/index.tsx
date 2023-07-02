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

import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import { Tag, Form, Input, Radio, Checkbox, DatePicker, InputNumber } from 'antd';
import { useReactive, useMemoizedFn, useControllableValue } from 'ahooks';

import { randomString } from '@/common/utils';
import { VARIABLE_TYPES } from '@/common/constants';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import NiceModal, { NiceModalProps } from '@/components/Nice/NiceModal';

type Props = {} & NiceModalProps;
type ValueProps = {
  value?: string;
  valueType?: string;
  exprValue?: string;
  expression?: boolean;
  onChange?: (value: string) => void;
};

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

export const MODAL_NAME = 'VariableModal';

const DefaultValue: React.FC<ValueProps> = (props) => {
  const { valueType, expression } = props;
  const [curValue, setCurValue] = useControllableValue(props);
  // const [valueList, setValueList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<any>();

  const valueList = curValue?.valueList || [];
  const exprValue = curValue?.exprValue;

  useEffect(() => {
    setInputValue(undefined);
  }, [valueType, expression]);

  const { t } = useI18n(['dataset', 'common']);

  // useEffect(() => {
  //     setCurValue({
  //         valueList
  //     })
  // }, [ valueList ]);
  //
  // useEffect(() => {
  //     setValueList(curValue.valueList)
  // }, [ curValue.valueList ]);

  const handleValueChange = (event) => {
    if (event) {
      if (event.target) {
        valueList.push(event.target.value);
      } else {
        valueList.push(event.format('YYYY-MM-DD HH:mm:ss'));
      }

      setCurValue({
        ...curValue,
        valueList: [...valueList],
      });
    }
    setInputValue(undefined);
  };

  const handleExprValueChange = (event) => {
    setCurValue({
      ...curValue,
      exprValue: event.target.value,
    });
  };

  const handleExprChange = (event) => {
    setCurValue({
      ...curValue,
      valueList: [],
      expression: event.target.checked,
    });
  };

  const handleInputChange = (event) => {
    if (event?.target) {
      setInputValue(event.target.value);
    } else {
      setInputValue(event);
    }
  };

  const renderValueForm = () => {
    let formNode;

    if (valueType === 'FRAGMENT' || expression) {
      return renderExprInput();
    }

    switch (valueType) {
      case 'STRING':
        formNode = (
          <Input
            value={inputValue}
            placeholder={t('dataset.variable.input.placeholder')}
            onChange={handleInputChange}
            onPressEnter={handleValueChange}
          />
        );
        break;

      case 'NUMERIC':
        formNode = (
          <InputNumber
            value={inputValue}
            style={{ width: '100%' }}
            placeholder={t('dataset.variable.input.placeholder')}
            onChange={handleInputChange}
            onPressEnter={handleValueChange}
          />
        );
        break;

      case 'DATE':
        formNode = (
          // @ts-ignore
          <DatePicker
            showTime
            value={inputValue}
            style={{ width: '100%' }}
            onChange={handleInputChange}
            onOk={handleValueChange}
          />
        );
        break;
    }

    return formNode;
  };

  const renderExprInput = () => {
    return (
      <Input.TextArea
        value={exprValue}
        placeholder={t('common.input.placeholder')}
        onChange={handleExprValueChange}
      />
    );
  };

  const renderTagList = () => {
    if (!valueList.length) return null;

    return (
      <div style={{ margin: '9px 0 4px 0' }}>
        {valueList.map((val: string, index) => (
          <Tag
            closable
            key={val}
            onClose={() => {
              valueList.splice(index, 1);
              setCurValue({
                ...curValue,
                valueList: [...valueList],
              });
            }}
          >
            {val}
          </Tag>
        ))}
      </div>
    );
  };

  return (
    <div>
      {renderTagList()}
      {renderValueForm()}
      {valueType !== 'FRAGMENT' ? (
        <div style={{ marginTop: 8 }}>
          <Checkbox checked={expression} onChange={handleExprChange}>
            {t('dataset.variable.default.ifo')}
          </Checkbox>
        </div>
      ) : null}
    </div>
  );
};

const defaultVariable = {
  name: '',
  label: '',
  expression: false,
  defaultValue: '',
  valueType: VARIABLE_TYPES[0].value,
};
const VariableModal: React.FC<Props> = ({ onSuccess, ...rest }) => {
  const [formRes] = Form.useForm();
  const formData = useReactive({
    values: {
      ...defaultVariable,
    },
  });

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const { visible, modalType, initValues } = modalInfo;

  const { t } = useI18n(['dataset', 'common']);

  useEffect(() => {
    if (visible) {
      const defaultValue = initValues?.defaultValue;
      const defaultData: {
        valueList?: string[];
        exprValue?: string;
      } = {
        valueList: [],
      };

      if (_.isString(defaultValue)) {
        try {
          const dv = JSON.parse(defaultValue);
          if (initValues.expression || initValues.valueType === 'FRAGMENT') {
            defaultData.exprValue = dv[0];
          } else {
            defaultData.valueList = dv;
          }
        } catch (e) {}
      }

      const curValues = {
        ...formData.values,
        ...initValues,
        ...{ defaultData },
      };

      formRes.setFieldsValue(curValues);
      formData.values = {
        ...curValues,
      };
    } else {
      formData.values = {
        ...defaultVariable,
      };
    }
  }, [visible, initValues]);

  const handleFormSubmit = () => {
    formRes.validateFields().then((values) => {
      const _newValues = {
        ...formData.values,
        ...values,
      };
      let newValues = _.pick(_newValues, ['name', 'label', 'valueType', 'expression']);
      const { valueList } = _newValues.defaultData;

      if ((newValues.expression || newValues.valueType === 'FRAGMENT') && _newValues.exprValue) {
        // @ts-ignore
        newValues.defaultValue = JSON.stringify([_newValues.exprValue]);
      } else if (valueList) {
        // @ts-ignore
        newValues.defaultValue = JSON.stringify(valueList);
      }

      if (modalType === 'edit') {
        newValues = _.extend({}, initValues, newValues);
      } else {
        // @ts-ignore
        newValues.id = randomString();
      }

      modal.hide();

      onSuccess?.(modalType, newValues);
    });
  };

  const handleFormChange = useMemoizedFn((changedValues, allValues) => {
    if (changedValues.valueType) {
      allValues.defaultData.valueList = [];
      formRes.setFieldsValue({
        defaultData: allValues.defaultData,
      });
    }

    formData.values = {
      ...formData.values,
      ...allValues,
      ...changedValues.defaultData,
    };
  });

  const renderForm = () => {
    return (
      <Form
        form={formRes}
        preserve={false}
        {...formItemLayout}
        style={{ marginBottom: -24 }}
        onValuesChange={handleFormChange}
      >
        <Form.Item
          name="name"
          label={t('dataset.variable.input.name.label')}
          rules={[{ required: true, message: t('dataset.variable.input.name.error_message') }]}
        >
          <Input placeholder={t('dataset.variable.input.name.placeholder')} />
        </Form.Item>
        <Form.Item name="label" label={t('dataset.variable.input.title.label')}>
          <Input placeholder={t('dataset.variable.input.title.placeholder')} />
        </Form.Item>
        <Form.Item name="valueType" label={t('dataset.variable.select.data_type.label')}>
          <Radio.Group>
            {VARIABLE_TYPES.map((item: any) => (
              <Radio key={item.value} value={item.value}>
                {t(`common.options.${item.value.toLowerCase()}`)}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item name="defaultData" label={t('dataset.variable.default.label')}>
          <DefaultValue {...formData.values} />
        </Form.Item>
      </Form>
    );
  };

  return (
    <NiceModal
      simple
      destroyOnClose
      width={520}
      visible={visible}
      title={t(`dataset.variable.${modalType}.title`)}
      okButtonProps={{
        onClick: handleFormSubmit,
      }}
      onCancel={() => modal.hide()}
      {...rest}
    >
      {renderForm()}
    </NiceModal>
  );
};

export default VariableModal;

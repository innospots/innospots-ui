import _ from 'lodash';
import moment from 'moment';
import React, { useMemo, useState, useEffect } from 'react';
import { Row, Col, Input, DatePicker, InputNumber } from 'antd';

import useI18n from '@/common/hooks/useI18n';

import { ExtensionField, useExtensionFields } from './useExtensionFields';

const labelStyle = {
  lineHeight: '32px',
};

const getInputNumberProps = (type: 'DOUBLE' | 'INTEGER') => {
  if (type === 'DOUBLE') {
    return {
      precision: 2,
    };
  }

  return {
    precision: 0,
  };
};

const ExtensionFields: React.FC<{
  onChange?: (value: string) => void;
}> = ({ onChange }) => {
  const { t } = useI18n(['approve', 'common']);

  const [extensionFields] = useExtensionFields();

  const [formData, setFormData] = useState<any>({});

  const formattedValue = useMemo(() => {
    const expressions: string[] = []
    _.each(formData, (value, key: string) => {
      if (_.isArray(value)) {
        const expression: string[] = []
        _.each(value, (v, index) => {
          if (moment.isMoment(v)) {
            v = v.format('YYYY-MM-DD');
          }
          expression.push(`${key}${index === 0 ? '>' : '<='}${v}`)
        })
        expressions.push(expression.join(','))
      } else if (/\-/g.test(key)) {
        const keys = key.split('-')
        const k0 = keys[0]
        const k1 = keys[1]
        if (k1 === 'min') {
          expressions.push(`${k0}>${value}`)
        } else if (k1 === 'max') {
          expressions.push(`${k0}<=${value}`)
        }
      } else {
        expressions.push(`${key}=${value}`)
      }
    })
    
    return expressions.join(',')
  }, [formData]);

  useEffect(() => {
    onChange?.(formattedValue);
  }, [formattedValue]);

  const updateFormData = (code: string) => (value: any) => {
    if (value?.target) {
      value = value.target.value;
    }

    setFormData((prev: any) => ({
      ...prev,
      [code]: value,
    }));
  };

  const getItemRow = (label: string, children: React.ReactNode) => {
    return (
      <Row gutter={8}>
        <Col style={labelStyle}>{label}</Col>
        {children}
      </Row>
    );
  };

  const renderFormItem = (field: ExtensionField) => {
    let item: any = null;
    const fieldCode = field.code;
    const fieldLabel = field.name;
    const valueType = field.valueType;

    switch (valueType) {
      case 'INTEGER':
      case 'DOUBLE':
        item = getItemRow(
          fieldLabel,
          <>
            <Col style={labelStyle}>
              <InputNumber
                max={formData[`${fieldCode}-max`]}
                {...getInputNumberProps(valueType)}
                placeholder={t('common.input.placeholder')}
                onChange={updateFormData(`${fieldCode}-min`)}
              />
            </Col>
            <Col style={labelStyle}>~</Col>
            <Col>
              <InputNumber
                min={formData[`${fieldCode}-min`]}
                {...getInputNumberProps(valueType)}
                placeholder={t('common.input.placeholder')}
                onChange={updateFormData(`${fieldCode}-max`)}
              />
            </Col>
          </>,
        );
        break;
      case 'DATE':
        item = getItemRow(
          fieldLabel,
          <Col>
            <DatePicker.RangePicker onChange={updateFormData(fieldCode)} />
          </Col>,
        );
        break;
      default:
        item = getItemRow(
          fieldLabel,
          <Col>
            <Input onChange={updateFormData(fieldCode)} placeholder={t('common.input.placeholder')} />
          </Col>,
        );
        break;
    }

    return item;
  };

  const renderExtensionFields = useMemo(() => {
    return _.map(extensionFields, (field) => {
      return <Col key={field.code}>{renderFormItem(field)}</Col>;
    });
  }, [extensionFields, formData]);

  return <Row gutter={8}>{renderExtensionFields}</Row>;
};

export default ExtensionFields;

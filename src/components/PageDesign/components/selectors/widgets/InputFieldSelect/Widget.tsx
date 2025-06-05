import React, { useMemo, forwardRef } from 'react';
import _ from 'lodash';
import { useModel } from 'umi'
import cls from 'classnames';
import { TreeSelect } from 'antd';
import { useUpdateEffect, useControllableValue } from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import type { WidgetItemType } from '@/models/AppEditor';

import styles from '../../style.less';

type Props = {
  inForm?: boolean;
} & WidgetItemType;

const DEFAULT_PARENT_FIELD = {};

const InputFieldSelect: React.FC<Props> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const { t } = useI18n('common');
  const { inputData, getOptionsByFieldSource } = useModel('AppData', (model) => ({
    inputData: model.inputData,
    getOptionsByFieldSource: model.getOptionsByFieldSource
  }));
  const [curField, setCurField] = useControllableValue(props);
  const inputProps = useMemo(() => {
    const selectProps = _.pick(settings, ['disabled', 'placeholder']);
    return selectProps;
  }, [settings]);

  const readOnly = widgetType === 'view'

  const formData = {};
  const {filterProps, dependencies, fieldSource} = settings;
  const parentFieldValue = dependencies ? (formData[dependencies] || DEFAULT_PARENT_FIELD) : null;

  const inputFields = useMemo(() => getOptionsByFieldSource(fieldSource), [ inputData, fieldSource ])

  const curPlaceholder = useMemo(() => {
    return readOnly ? '-' : (inputProps.placeholder || t('common.select.placeholder'))
  }, [ t, inputProps.placeholder, readOnly ])

  const formatInputFields = useMemo(() => {
    const propKeys = _.keys(filterProps);
    const fetchMatched = (field) => _.find(propKeys, key => filterProps[key] !== field[key])

    let fields;

    if (parentFieldValue) {
      fields = [];
      _.find(inputData, item => {
        if (item.nodeKey === parentFieldValue.nodeKey) {
          _.find(item.fields, field => {
            if (field.value === parentFieldValue.code) {
              fields = _.map(field.subFields, subField => ({
                value: subField.value,
                title: subField.label,
                dataType: subField.type
              }))
              return true;
            }
          })
          return true;
        }
      })
      return fields;
    } else {
      fields = _.map(inputData, (item) => {
        const children: any[] = [];
        _.each(item.fields, (field) => {
          const matched = fetchMatched(field);
          if (!matched) {
            children.push({
              title: field.label,
              dataType: field.type,
              nodeKey: item.nodeKey,
              code: field.value,
              value: [item.nodeKey, field.value].join('$$')
            })
          }
        })

        return {
          title: item.nodeName,
          value: item.nodeKey,
          children: children
        };
      });

      return _.filter(fields, field => !!field.children.length);
    }
  }, [inputData, filterProps, parentFieldValue]);

  const curValue = useMemo(() => {
    if (!curField) return undefined;

    const _curField = _.isArray(curField) ? curField[0] : curField;

    if (_curField.nodeKey && _curField.code) {
      return [_curField.nodeKey, _curField.code].join('$$');
    }

    return _.isArray(curField) ? curField.join('$$') : curField;
  }, [curField]);

  useUpdateEffect(() => {
    if (parentFieldValue && !readOnly) {
      setCurField(undefined)
    }
  }, [parentFieldValue, readOnly]);

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          <TreeSelect
            showSearch
            allowClear
            treeDefaultExpandAll
            value={curValue}
            treeData={formatInputFields}
            style={{ width: '100%' }}
            bordered={!readOnly}
            showArrow={!readOnly}
            placeholder={curPlaceholder}
            dropdownMatchSelectWidth={false}
            disabled={inputProps.disabled || readOnly}
            onChange={(value) => {
              if (!value) {
                setCurField(undefined);
              }
            }}
            onSelect={(value, node) => {
              if (!value) {
                setCurField(undefined);
              } else {
                setCurField([
                  {
                    code: node.code,
                    value: '${' + node.code + '}',
                    nodeKey: node.nodeKey,
                    valueType: node.dataType,
                  },
                ]);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
})

export default InputFieldSelect;

import React, { useMemo, forwardRef } from 'react';
import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi'
import { Select, Checkbox } from 'antd';
import { useSafeState, useDebounceFn, useDeepCompareEffect, useControllableValue } from 'ahooks';

import { getFormatOptions } from '@/components/PageDesign/utils';
import type { WidgetItemType } from '@/models/AppEditor';
import { globalRequest } from '@/common/request'

import ReadOnlyWidget from '../ReadOnlyWidget';

import styles from '../../style.less';

type Props = {
  inForm?: boolean;
} & WidgetItemType;

const MultiSelectPicker: React.FC<Props> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const { options, viewType, dataSource, placeholder, fieldSource } = settings || {};
  const { inputData, getOptionsByFieldSource } = useModel('AppData', (model) => ({
    inputData: model.inputData,
    getOptionsByFieldSource: model.getOptionsByFieldSource
  }));

  const [dynamicOptions, setDynamicOptions] = useSafeState()
  const [curValue, setCurValue] = useControllableValue(props);
  const isStatic = useMemo(() => (dataSource === 'static'), [ dataSource ])
  const isInterface = useMemo(() => (dataSource === 'interface'), [ dataSource ])
  const isInputField = useMemo(() => (dataSource === 'input'), [ dataSource ])

  const formatOptions = useMemo(() => {
    if (isStatic) {
      return getFormatOptions(options)
    } else if (isInterface) {
      return getFormatOptions(dynamicOptions, settings.dynamicOptions?.fieldNames)
    } else if (isInputField) {
      return getOptionsByFieldSource(fieldSource)
    }
  }, [ inputData, fieldSource, options, dataSource, dynamicOptions, settings.dynamicOptions ])

  const getDynamicOptions = useDebounceFn(async () => {
    const { url, method } = settings.dynamicOptions || {}
    if (!url) return

    const result = await globalRequest(url, {
      method,
      ignoreError: true
    })

    setDynamicOptions(result?.body || result || [])
  })

  useDeepCompareEffect(() => {
    if (isInterface) {
      getDynamicOptions.run()
    }
  }, [ isInterface, settings.dynamicOptions ])

  const renderFormItem = () => {
    if (viewType === 'checkbox') {
      return <Checkbox.Group value={curValue} options={formatOptions} onChange={setCurValue} />;
    }

    // if (viewType === 'buttonGroup') {
    //   return (
    //     <Checkbox.Group options={formatOptions} />
    //   )
    // }
    return (
      <Select
        allowClear
        mode="multiple"
        value={curValue}
        options={formatOptions}
        style={{ width: '100%' }}
        placeholder={placeholder}
        onChange={setCurValue}
      />
    );
  };

  if (widgetType === 'view') {
    return <ReadOnlyWidget options={formatOptions} {...props} />;
  }

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>{renderFormItem()}</div>
      </div>
    </div>
  );
})

export default MultiSelectPicker;

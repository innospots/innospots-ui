import React, { useMemo, forwardRef } from 'react';
import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi'
import { Cascader as AntdCascader } from 'antd';
import { useControllableValue } from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import { getFormatOptions } from '@/components/PageDesign/utils';

import type { WidgetItemType } from '@/models/AppEditor';

import styles from '../../style.less';

type Props = {
  inForm?: boolean;
} & WidgetItemType;

const Cascader: React.FC<Props> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const { t } = useI18n('common');
  const { options, fieldSource, dataSource, placeholder } = settings || {};
  const { inputData, getOptionsByFieldSource } = useModel('AppData', (model) => ({
    inputData: model.inputData,
    getOptionsByFieldSource: model.getOptionsByFieldSource,
  }));

  const [curValue, setCurValue] = useControllableValue(props);

  const readOnly = widgetType === 'view';
  const curPlaceholder = useMemo(() => {
    return readOnly ? '-' : (placeholder || t('common.select.placeholder'))
  }, [ t, placeholder, readOnly ])

  const formatOptions = useMemo(() => {
    if (dataSource === 'static') {
      return getFormatOptions(options);
    }
    return getOptionsByFieldSource(fieldSource)
  }, [inputData, options, dataSource, fieldSource]);

  const renderFormItem = () => {
    return (
      <AntdCascader
        value={curValue}
        style={{ width: '100%' }}
        options={formatOptions}
        onChange={(value) => {
          setCurValue(value || []);
        }}
        disabled={readOnly}
        bordered={!readOnly}
        showArrow={!readOnly}
        placeholder={curPlaceholder}
      />
    );
  };

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>{renderFormItem()}</div>
      </div>
    </div>
  );
})

export default Cascader;

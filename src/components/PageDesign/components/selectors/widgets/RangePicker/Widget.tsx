import React, { useMemo, forwardRef } from 'react';
import _ from 'lodash'
import cls from 'classnames'
import { useControllableValue } from 'ahooks'

import type { DatePickerProps } from 'antd';

import type { WidgetItemType } from '@/models/AppEditor'

import { DEFAULT_FORMAT } from './index'
import CustDatePicker from './CustDatePicker'

import styles from '../../style.less'

type Props = {
  inForm?: boolean
} & DatePickerProps & WidgetItemType

const RangePickerInput:React.FC<Props> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {

  const [curValue, setCurValue] = useControllableValue(props)
  const inputProps = useMemo(() => {
    return _.merge({
      style: {
        width: '100%'
      },
      format: DEFAULT_FORMAT
    }, _.pick(settings, [
      'disabled',
      'placeholder'
    ]))
  }, [ settings ])

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          <CustDatePicker { ...inputProps } value={curValue} onChange={setCurValue} widgetType={widgetType} />
        </div>
      </div>
    </div>
  )
})

export default RangePickerInput


import React, { useMemo, forwardRef } from 'react';
import _ from 'lodash'
import cls from 'classnames'
import { useControllableValue } from 'ahooks'

import { InputNumber, InputNumberProps } from 'antd'

import type { WidgetItemType } from '@/models/AppEditor'

import ReadOnlyWidget from '../ReadOnlyWidget';

import styles from '../../style.less'

type Props = {
  inForm?: boolean
} & InputNumberProps & WidgetItemType

const NumberInput:React.FC<Props> = forwardRef(({ widgetType, settings = {}, ...props }, ref) => {

  const [curValue, setCurValue] = useControllableValue(props)
  const inputProps = useMemo(() => {
    const elProps: any = _.pick(settings, [
      'disabled',
      'addonAfter',
      'addonBefore',
      'placeholder'
    ])
    if (settings.width) {
      elProps.style = {
        width: settings.width + '%'
      }
    }

    return elProps
  }, [ settings ])

  const handleValueChange = (value) => {
    setCurValue(value)
  }

  if (widgetType === 'view') {
    return <ReadOnlyWidget {...props} />;
  }

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          <InputNumber { ...inputProps } value={curValue} onChange={handleValueChange} />
        </div>
      </div>
    </div>
  )
})

export default NumberInput


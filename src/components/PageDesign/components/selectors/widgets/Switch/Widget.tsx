import React, { forwardRef } from 'react';
import _ from 'lodash'
import cls from 'classnames'
import { useControllableValue } from 'ahooks'
import { Switch as AntdSwitch, Checkbox } from 'antd'

import type { WidgetItemType } from '@/models/AppEditor'

import styles from '../../style.less'

type Props = {
  inForm?: boolean
} & WidgetItemType

const Switch:React.FC<Props> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const {
    viewType,
    disabled,
    placeholder
  } = settings || {}

  const readOnly = widgetType === 'view'
  const [curValue, setCurValue] = useControllableValue(props)

  const renderFormItem = () => {
    if (viewType === 'checkbox') {
      return (
        <Checkbox checked={curValue} disabled={disabled || readOnly} onChange={setCurValue}>{ placeholder }</Checkbox>
      )
    }
    return (
      <AntdSwitch checked={curValue} disabled={disabled || readOnly} onChange={setCurValue} />
    )
  }

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          { renderFormItem() }
        </div>
      </div>
    </div>
  )
})

export default Switch


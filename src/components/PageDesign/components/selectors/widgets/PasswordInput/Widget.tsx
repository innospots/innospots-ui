import React, { useMemo, forwardRef } from 'react';
import _ from 'lodash'
import cls from 'classnames'
import { useControllableValue } from 'ahooks'

import { Input as AntdInput, InputProps } from 'antd'

import type { WidgetItemType } from '@/models/AppEditor'

import styles from '../../style.less'

type Props = {
  inForm?: boolean
} & InputProps & WidgetItemType

const PasswordInput:React.FC<Props> = forwardRef(({ settings = {}, ...props }, ref) => {

  const [curValue, setCurValue] = useControllableValue(props)
  const inputProps = useMemo(() => _.pick(settings, [
    'disabled',
    'placeholder'
  ]), [ settings ])

  const handleValueChange = (event) => {
    setCurValue(event.target.value)
  }

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          <AntdInput.Password autoComplete="new-password" { ...inputProps } value={curValue} onChange={handleValueChange} />
        </div>
      </div>
    </div>
  )
})

export default PasswordInput


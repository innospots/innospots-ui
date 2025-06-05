import React, { useMemo, forwardRef, useContext } from 'react';
import _ from 'lodash'
import cls from 'classnames'
import { useControllableValue } from 'ahooks'

import { Input as AntdInput, InputProps } from 'antd'

import type { WidgetItemType } from '@/models/AppEditor'

import ReadOnlyWidget from '../ReadOnlyWidget';
import { WidgetContext } from '../../WidgetProvider';

import styles from '../../style.less'

type Props = {
  inForm?: boolean
} & InputProps & WidgetItemType

const TextArea:React.FC<Props> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {

  const { size } = useContext(WidgetContext)
  const [curValue, setCurValue] = useControllableValue(props)
  const inputProps = useMemo(() => {
    let height = size?.height || 0
    if (size?.height) {
      height = size.height - (settings.label ? 40 : 0)
    }
    const elProps: any = _.pick(settings, [
      'disabled',
      'maxLength',
      'showCount',
      'placeholder'
    ])
    elProps.style = {
      height: elProps.showCount ? height - 18 : height,
      resize: 'none'
    }

    return elProps
  }, [ settings, size ])

  const handleValueChange = (event) => {
    setCurValue(event.target.value)
  }

  if (widgetType === 'view') {
    return (
      <ReadOnlyWidget { ...props } />
    )
  }

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          <AntdInput.TextArea { ...inputProps } value={curValue} onChange={handleValueChange} />
        </div>
      </div>
    </div>
  )
})

export default TextArea


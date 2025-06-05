import _ from 'lodash'
import cls from 'classnames'
import { useControllableValue } from 'ahooks'
import React, { useMemo, forwardRef } from 'react';

import useI18n from '@/common/hooks/useI18n';
import type { WidgetItemType } from '@/models/AppEditor'

import InputFieldCascader from '../InputFieldCascader';

import styles from '../../style.less'

type Props = {
  inForm?: boolean
} & WidgetItemType

const InputFieldSelect2:React.FC<Props> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const {t} = useI18n('common');
  const [curValue, setCurValue] = useControllableValue(props)
  const inputProps = useMemo(() => {
    const selectProps = _.pick(settings, [
      'disabled',
      'multiple',
      'fieldSource',
      'placeholder'
    ])

    return selectProps
  }, [ settings ])

  const readOnly = widgetType === 'view'

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          <InputFieldCascader
            value={curValue}
            { ...inputProps }
            size="default"
            disabled={readOnly}
            onChange={setCurValue}
          />
        </div>
      </div>
    </div>
  )
})

export default InputFieldSelect2


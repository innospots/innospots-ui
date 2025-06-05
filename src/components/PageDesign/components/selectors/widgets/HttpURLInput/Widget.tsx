import React, { useMemo, forwardRef } from 'react';
import _ from 'lodash'
import cls from 'classnames'
import { useControllableValue } from 'ahooks'

import { Input as AntdInput, Select } from 'antd'

import useI18n from '@/common/hooks/useI18n';
import type { WidgetItemType } from '@/models/AppEditor'

import styles from '../../style.less'

type Props = {
  inForm?: boolean
} & WidgetItemType

const SELECT_OPTIONS = [{
  value: 'GET',
  label: 'GET'
}, {
  value: 'POST',
  label: 'POST'
}];

const HttpURLInput:React.FC<Props> = forwardRef(({ settings = {}, ...props }, ref) => {
  const { t } = useI18n('common');

  const [curValue, setCurValue] = useControllableValue(props)
  const inputProps = useMemo(() => _.pick(settings, [
    'disabled',
    'placeholder'
  ]), [ settings ])

  const handleMethodChange = (method: string) => {
    const cloneValue = _.clone(curValue || []);
    cloneValue[0] = method;
    setCurValue(cloneValue);
  }

  const handleURLChange = (event) => {
    const cloneValue = _.clone(curValue || []);
    cloneValue[1] = event.target.value;
    setCurValue(cloneValue);
  }

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          <AntdInput.Group compact>
            <Select
              value={curValue?.[0]}
              style={{width: 100}}
              disabled={inputProps.disabled}
              options={SELECT_OPTIONS}
              placeholder={t('common.select.placeholder')}
              onChange={handleMethodChange}
            />
            <AntdInput
              value={curValue?.[1]}
              disabled={inputProps.disabled}
              style={{ width: 'calc(100% - 100px)' }}
              placeholder={inputProps.placeholder || t('common.input.placeholder')}
              onChange={handleURLChange}
            />
          </AntdInput.Group>
        </div>
      </div>
    </div>
  )
})

export default HttpURLInput


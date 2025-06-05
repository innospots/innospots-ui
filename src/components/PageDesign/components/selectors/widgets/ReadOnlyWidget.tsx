import React, { useMemo, forwardRef } from 'react';
import _ from 'lodash'
import cls from 'classnames'
import { useControllableValue } from 'ahooks'

import styles from '../style.less'

const ReadOnlyWidget:React.FC<Record<string, any>> = forwardRef(({ options, ...props }, ref) => {
  const [curValue] = useControllableValue(props)
  const renderValue = useMemo(() => {
    let showValue

    const getValue = (v: Record<string, any>, o: any[]) => {
      let sv
      if (_.isArray(o) && o.length) {
        const item = _.find(o, i => {
          if (_.isArray(v)) {
            const v0 = v[0] || {}
            return [v0, v0.code, v0.value].includes(i.value)
          } else if (_.isObject(v)) {
            return [v, v?.code, v?.value].includes(i.value)
          } else {
            return i.value === v
          }
        })
        if (item) {
          // sv = [item.value, item.label].join(' - ')
          sv = item.label
        }
      } else {
        if (_.isArray(v)) {
          sv = v[0]
        } else if (_.isObject(v)) {
          sv = v.code || v.value
        } else {
          sv = v
        }
      }
      return sv
    }

    if (_.isArray(curValue) || _.isArray(curValue?.value)) {
      showValue = []
      const _curValue = curValue.value || curValue
      _.each(_curValue, v => {
        const sv = getValue(v, options)
        if (sv) {
          showValue.push(sv)
        }
      })
      showValue = showValue.join(', ')
    } else {
      showValue = getValue(curValue, options)
    }

    return showValue || '-'
  }, [ curValue, options ])

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          { renderValue }
        </div>
      </div>
    </div>
  )
})

export default ReadOnlyWidget


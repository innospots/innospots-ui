import React from 'react'

import { ValidatorRule, RuleProps } from './index'

import styles from './style.less'

export const RuleFormItem:React.FC<RuleProps> = ({ value, onChange }) => {

  return (
    <div className={styles.ruleFormItem}>
      <ValidatorRule value={value} onChange={onChange} />
    </div>
  )
}
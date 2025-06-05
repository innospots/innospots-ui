import React from 'react'

import { RelationRule, RuleProps } from './index'

import styles from './style.less'

export const RuleFormItem:React.FC<RuleProps> = ({ value, onChange }) => {

  return (
    <div className={styles.ruleFormItem}>
      <RelationRule value={value} onChange={onChange} />
    </div>
  )
}
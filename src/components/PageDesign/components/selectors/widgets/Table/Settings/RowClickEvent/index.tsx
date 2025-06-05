import React from 'react'

import { Action } from '@/components/PageDesign/components/Action'

import styles from './style.less'

const RowClickEvent:React.FC = () => {

  return (
    <div className={styles.container}>
      <Action />
    </div>
  )
}

export default RowClickEvent
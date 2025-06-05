import React from 'react'
import { useControllableValue } from 'ahooks'

import { Action } from '@/components/PageDesign/components/Action'

import styles from './style.less'

const RowClickEvent:React.FC = (props) => {
  const [actions, setActions] = useControllableValue(props, {
    defaultValue: () => ([])
  })

  return (
    <div className={styles.container}>
      <Action value={actions} onChange={setActions} />
    </div>
  )
}

export default RowClickEvent
import React, { Suspense } from 'react'
import { Spin } from 'antd'

import styles from './style.less'

const CustomSuspense:React.FC<{
  fallback?: any
}> = ({ fallback, children }) => {

  return (
    <Suspense fallback={fallback || (
      <div className={styles.container}>
        <Spin size="small" />
      </div>
    )}>
      { children }
    </Suspense>
  )
}

export default CustomSuspense
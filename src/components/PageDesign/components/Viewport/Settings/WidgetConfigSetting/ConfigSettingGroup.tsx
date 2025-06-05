import React from 'react';

import styles from './style.less'

export const ConfigSettingGroup:React.FC<{
  title?: string
}> = ({ title, children }) => {

  return (
    <div className={styles.settingItemGroup}>
      {
        title && (
          <p className={styles.groupTitle}>{ title }</p>
        )
      }
      { children }
    </div>
  )
}
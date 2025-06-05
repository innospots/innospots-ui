import React from 'react';

import type { WidgetItemType } from '@/models/AppEditor';

import styles from '../style.less';

const ViewWidgetWrapper: React.FC<WidgetItemType> = ({ children }) => {
  return (
    <div className={styles.viewNodeWrapper}>
      {children}
    </div>
  )
};

export default ViewWidgetWrapper;

import React, { useRef, useMemo } from 'react';
import _ from 'lodash'
import { useSize } from 'ahooks';

import styles from './style.less';

type ContextType = Record<string, any>

export const WidgetContext = React.createContext<ContextType>({});

const WidgetProvider: React.FC<any> = ({ children }) => {
  const containerRef = useRef(null);
  const containerSize = useSize(containerRef);

  return (
    <WidgetContext.Provider value={{
      size: containerSize
    }}>
      <div ref={containerRef} className={styles.widgetContainer}>
        { children }
      </div>
    </WidgetContext.Provider>
  );
};

export default WidgetProvider;

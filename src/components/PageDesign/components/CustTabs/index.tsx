/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { ReactNode, useMemo, useEffect, useState } from 'react';

import cls from 'classnames';

import styles from './style.less';

type TabItemType = {
  key: string,
  label: ReactNode
}

type TabsProps = {
  type?: 'header' | 'nav'
  activeKey?: string
  items: TabItemType[]
  onChange?: (key: string) => void
};

const Tabs:React.FC<TabsProps> = ({ type= 'header', activeKey, items, onChange }) => {

  const [currentKey, setCurrentKey] = useState<string>(activeKey);

  useEffect(() => {
    if (!activeKey) {
      if (items?.length) {
        setCurrentKey(items[0].key);
      }
    } else {
      setCurrentKey(activeKey)
    }
  }, [ activeKey, items ]);

  useEffect(() => {
    if (currentKey) {
      onChange?.(currentKey)
    }
  }, [ currentKey ]);

  const handleItemClick = (key: string) => () => {
    setCurrentKey(key)
  }

  return (
    <div className={cls(styles.tabs, styles[type])}>
      {
        items.map(item => (
          <div
            key={item.key}
            className={cls(styles.tab, { [styles.active]: item.key === currentKey })}
            onClick={handleItemClick(item.key)}
          >
            <span>{ item.label }</span>
          </div>
        ))
      }
    </div>
  )
}

export default Tabs;
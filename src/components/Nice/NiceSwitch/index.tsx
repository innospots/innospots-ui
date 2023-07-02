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

import React from 'react';
import cls from 'classnames';
import { useControllableValue } from 'ahooks';

import styles from './style.less';

export type NiceSwitchProps = {
  value?: string | number;
  dataSource: {
    value: string;
    label: string;
    icon?: any;
  }[];
  onChange?: (value: string) => void;
};

const NiceSwitch: React.FC<NiceSwitchProps> = (props) => {
  const { dataSource, ...rest } = props;

  const [value, setValue] = useControllableValue<string>(rest);

  return (
    <div className={styles.niceSwitch}>
      {dataSource.map((item) => (
        <div
          key={item.value}
          className={cls(styles.item, { [styles.active]: value === item.value })}
          onClick={() => setValue(item.value)}
        >
          {item.icon}
          <span className={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default NiceSwitch;

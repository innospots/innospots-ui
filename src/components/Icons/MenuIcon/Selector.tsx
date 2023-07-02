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

import React, { useRef, useMemo, useState } from 'react';

import { Input, Popover } from 'antd';
import { TooltipPlacement } from 'antd/es/tooltip';
import { DownOutlined } from '@ant-design/icons';
import { useToggle, useMemoizedFn } from 'ahooks';
import cls from 'classnames';

import { MenuIcon, ICON_CODES } from './index';

import useI18n from '@/common/hooks/useI18n';
import { extractIconCode } from '@/common/utils';

import styles from './style.less';

type Props = {
  value?: string;
  placement?: TooltipPlacement;
  onChange?: (value: string) => void;
};

const Selector: React.FC<Props> = (props) => {
  const { value, onChange, ...rest } = props;

  const { t } = useI18n('menu');

  const container = useRef(null);
  const [iconKeywords, setIconKeywords] = useState('');
  const [visible, { setLeft, setRight }] = useToggle();

  const iconList = useMemo(() => {
    if (iconKeywords) {
      return ICON_CODES.filter((code: string) => code.indexOf(iconKeywords) > -1);
    } else {
      return ICON_CODES;
    }
  }, [iconKeywords]);

  const updateIconCode = (iconCode: string) => () => {
    onChange?.(iconCode);
    setLeft();
  };

  const handleInputChange = (event) => {
    const val = event.target.value;
    setIconKeywords(val);

    if (val === '') {
      onChange?.('');
    }
  };

  const renderIconList = useMemoizedFn(() => {
    return (
      <div className={styles.iconList}>
        {iconList.map((code: string) => (
          <div
            key={code}
            className={cls(styles.iconItem, {
              [styles.active]: value === code,
            })}
            onMouseDown={updateIconCode(code)}
          >
            <div className={styles.inner}>
              <MenuIcon type={code} className={styles.icon} />
              <span className={styles.label}>{extractIconCode(code)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  });

  return (
    <Popover
      title={null}
      content={renderIconList()}
      visible={visible}
      placement="bottomRight"
      {...rest}
      // getPopupContainer={(): HTMLElement => container.current}
    >
      <div
        ref={container}
        className={cls(styles.selector, {
          [styles.selected]: !!value,
        })}
      >
        {value ? (
          <div className={styles.selectedIcon}>
            <MenuIcon type={value} className={styles.icon} />
          </div>
        ) : null}
        <Input
          allowClear
          bordered={false}
          style={{ width: '92%' }}
          placeholder={t('menu.form.select.icon.placeholder')}
          value={iconKeywords || extractIconCode(value as string)}
          onBlur={setLeft}
          onFocus={setRight}
          onChange={handleInputChange}
        />
        <span className={styles.arrow}>
          <DownOutlined />
        </span>
      </div>
    </Popover>
  );
};

export default Selector;

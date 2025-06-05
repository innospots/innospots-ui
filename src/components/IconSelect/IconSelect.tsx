import _ from 'lodash';
import React from 'react';
import cls from 'classnames';
import { Popover, Input, PopoverProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useToggle, useMemoizedFn, useControllableValue } from 'ahooks';
import { useRef, useMemo, useState } from 'react';

import useI18n from '@/common/hooks/useI18n';

import Icons from './Icons';

import styles from './style.less';

export type IconSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
} & PopoverProps;

const IconSelect:React.FC<IconSelectProps> = ({ value: iconValue, onChange, ...rest }) => {
  const [value, setValue] = useControllableValue<string>({
    value: iconValue,
    defaultValue: '',
    onChange,
  });

  const { t } = useI18n('common');

  const container = useRef(null);
  const [visible, { setLeft, setRight }] = useToggle();

  const iconList = useMemo(() => _.keys(Icons), []);

  const updateIconCode = (iconCode: string) => () => {
    setValue(iconCode);
    setLeft();
  };

  const CurrentIcon = useMemo(() => {
    return Icons[value];
  }, [value]);

  const renderIconList = useMemoizedFn(() => {
    return (
      <div className={styles.iconList}>
        {iconList.map((code: string) => {
          const Icon = Icons[code];
          return (
            <div
              key={code}
              className={cls(styles.iconItem, {
                [styles.active]: value === code,
              })}
              onMouseDown={updateIconCode(code)}
            >
              <div className={styles.inner}>
                <Icon className={styles.icon} />
              </div>
            </div>
          )
        })}
      </div>
    );
  });

  return (
    <Popover
      title={null}
      open={visible}
      content={renderIconList()}
      placement="bottomRight"
      {...rest}
      // getPopupContainer={(): HTMLElement => container.current}
    >
      <div
        ref={container}
        className={cls(styles.selector, {
          [styles.selected]: !!value,
        })}
        onClick={setRight}
      >
        {CurrentIcon ? (
          <div className={styles.selectedIcon}>
            <CurrentIcon type={value} className={styles.icon} />
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span>{t('common.select.icon.placeholder')}</span>
          </div>
        )}

        <span className={styles.arrow}>
          <DownOutlined />
        </span>
      </div>
    </Popover>
  );
};

export default IconSelect;
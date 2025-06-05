import React from 'react';
import cls from 'classnames'
import { Form, FormItemProps } from 'antd';

import styles from '../style.less'

export const SettingItem:React.FC<FormItemProps> = ({ name, children, ...props }) => {

  return (
    <div className={cls(styles.settingItemWrapper, {
      [styles.noStyle]: props.noStyle
    })}>
      <Form.Item name={name} validateTrigger="onBlur" { ...props }>
        { children }
      </Form.Item>
    </div>
  )
}
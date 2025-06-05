import React from 'react';
import { Form, FormItemProps } from 'antd';

import styles from './style.less'

export const ConfigSettingItem:React.FC<FormItemProps> = ({ name, children, ...props }) => {

  return (
    <div className={styles.settingItem}>
      <Form.Item name={name} validateTrigger="onBlur" { ...props }>
        { children }
      </Form.Item>
    </div>
  )
}
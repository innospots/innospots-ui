import React, { forwardRef } from 'react';
import _ from 'lodash'
import cls from 'classnames'

import { Typography, InputProps } from 'antd'

import type { WidgetItemType } from '@/models/AppEditor'

import styles from '../../style.less'

type Props = {
  inForm?: boolean
} & InputProps & WidgetItemType

const { Title } = Typography;

const Header:React.FC<Props> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <Title level={4}>{settings.text}</Title>
    </div>
  )
})

export default Header


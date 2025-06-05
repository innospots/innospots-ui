import React from 'react'
import { BorderOutlined } from '@ant-design/icons'

const Widget = React.lazy(() => import('./Widget'))

export const Settings = React.lazy(() => import('./Settings'))

export const elementProps = {
  type: 'Button',
  settings: {
    text: '按钮',
    type: 'default'
  },
  layout: {
    w: 1,
    h: 1,
    maxH: 1,
    minH: 1,
    resizeHandles: ['e', 'w'],
  },
  copyable: true,
  deletable: true
}

export default {
  Widget,
  name: 'Button',
  title: '按钮',
  noStyle: true,
  elementProps,
  Icon: BorderOutlined
}
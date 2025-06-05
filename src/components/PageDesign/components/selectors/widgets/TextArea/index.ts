import React from 'react'
import _ from 'lodash'
import { DatabaseOutlined } from '@ant-design/icons'

const Widget = React.lazy(() => import('./Widget'))

export const Settings = React.lazy(() => import('./Settings'))

const allElProps = {
  app: {
    layout: {
      w: 2,
      // resizeHandles: ['e', 'w'],
    },
  },
  node: {
    layout: {
      w: 1,
      // resizeHandles: [],
    },
  }
}

export const elementProps = (appType: string) => {

  return _.merge({
    type: 'TextArea',
    valueType: 'string',
    settings: {
      label: '多行输入框',
      placeholder: '请输入'
    },
    layout: {
      h: 3,
      // maxH: 3,
      minH: 3
    },
    copyable: true,
    deletable: true
  }, allElProps[appType])
}

export default {
  Widget,
  name: 'TextArea',
  title: '多行输入框',
  elementProps,
  Icon: DatabaseOutlined
}
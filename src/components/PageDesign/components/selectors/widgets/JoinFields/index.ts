import React from 'react'
import _ from 'lodash'
import { FontColorsOutlined } from '@ant-design/icons'

const Widget = React.lazy(() => import('./Widget'))

export const Settings = React.lazy(() => import('./Settings'))

const allElProps = {
  app: {
    layout: {
      w: 2
    },
  },
  node: {
    layout: {
      w: 1,
      resizeHandles: ['s', 'n'],
    },
  }
}

export const elementProps = (appType: string) => {

  return _.merge({
    type: 'JoinFields',
    valueType: 'array',
    settings: {
      opt: '=',
      label: '连接映射'
    },
    layout: {
      h: 2,
      minH: 2
    },
    copyable: true,
    deletable: true
  }, allElProps[appType])
}

export default {
  Widget,
  name: 'JoinFields',
  title: '连接映射',
  elementProps,
  Icon: FontColorsOutlined
}
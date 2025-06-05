import React from 'react'
import _ from 'lodash'
import { FontColorsOutlined } from '@ant-design/icons'

const Widget = React.lazy(() => import('./Widget'))

export const Settings = React.lazy(() => import('./Settings'))

const allElProps = {
  app: {
    layout: {
      w: 2,
      resizeHandles: ['e', 'w', 's', 'n'],
    },
  },
  node: {
    layout: {
      w: 1,
      resizeHandles: [],
    },
  }
}

export const elementProps = (appType: string) => {

  return _.merge({
    type: 'Header',
    valueType: 'string',
    settings: {
      text: '标题',
    },
    layout: {
      w: 12,
      h: 1,
      maxH: 2,
      minH: 1
    },
    copyable: true,
    deletable: true
  }, allElProps[appType])
}

export default {
  Widget,
  name: 'Header',
  title: '标题',
  elementProps,
  Icon: FontColorsOutlined
}
import React from 'react'
import _ from 'lodash'
import { FontColorsOutlined } from '@ant-design/icons'

const Widget = React.lazy(() => import('./Widget'))

export const Settings = React.lazy(() => import('./Settings'))

const allElProps = {
  app: {
    layout: {
      w: 2,
      resizeHandles: ['e', 'w'],
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
    type: 'InputFieldSelect',
    valueType: 'array',
    settings: {
      label: '输入字段',
      placeholder: '请选择'
    },
    layout: {
      h: 2,
      maxH: 2,
      minH: 2
    },
    copyable: true,
    deletable: true
  }, allElProps[appType])
}

export default {
  Widget,
  name: 'InputFieldSelect',
  title: '输入字段',
  elementProps,
  Icon: FontColorsOutlined
}
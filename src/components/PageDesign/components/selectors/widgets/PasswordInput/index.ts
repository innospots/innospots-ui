import React from 'react'
import _ from 'lodash'
import { UnlockOutlined } from '@ant-design/icons'

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
    type: 'PasswordInput',
    valueType: 'string',
    settings: {
      label: '密码输入框',
      placeholder: '请输入'
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
  name: 'PasswordInput',
  title: '密码输入框',
  elementProps,
  Icon: UnlockOutlined
}
import React from 'react'
import _ from 'lodash'
import { FileImageOutlined } from '@ant-design/icons'

const Widget = React.lazy(() => import('./Widget'))

export const Settings = React.lazy(() => import('./Settings'))

const allElProps = {
  app: {
    layout: {
      w: 3,
      h: 8
    },
  },
  node: {
    layout: {
      w: 12,
      resizeHandles: [],
    },
  }
}

export const elementProps = (appType: string) => {

  return _.merge({
    type: 'Image',
    valueType: 'string',
    settings: {
      label: '图片'
    },
    layout: {
      h: 8,
      minH: 4
    },
    copyable: true,
    deletable: true
  }, allElProps[appType])
}

export default {
  Widget,
  name: 'Image',
  title: '图片',
  elementProps,
  Icon: FileImageOutlined
}
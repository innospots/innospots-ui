import React from 'react'
import _ from 'lodash'
import { FieldTimeOutlined } from '@ant-design/icons'

const Widget = React.lazy(() => import('./Widget'))

export const Settings = React.lazy(() => import('./Settings'))

export const DEFAULT_FORMAT = 'YYYY-MM-DD'

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
    type: 'RangePicker',
    valueType: 'array',
    settings: {
      label: '时间范围'
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
  name: 'RangePicker',
  title: '时间范围',
  elementProps,
  Icon: FieldTimeOutlined
}
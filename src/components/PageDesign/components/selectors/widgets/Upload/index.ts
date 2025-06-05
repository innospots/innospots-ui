import React from 'react'
import _ from 'lodash'
import { CloudUploadOutlined } from '@ant-design/icons'

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
      resizeHandles: [],
    },
  }
}

export const elementProps = (appType: string) => {

  return _.merge({
    type: 'Upload',
    valueType: 'array',
    settings: {
      label: '文件上传',
      placeholder: '文件上传'
    },
    layout: {
      h: 4,
      minH: 2
    },
    copyable: true,
    deletable: true
  }, allElProps[appType])
}

export default {
  Widget,
  name: 'Upload',
  title: '文件上传',
  elementProps,
  Icon: CloudUploadOutlined
}
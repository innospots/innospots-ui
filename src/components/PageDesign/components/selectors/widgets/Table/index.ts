import React from 'react'
import { TableOutlined } from '@ant-design/icons'

const Widget = React.lazy(() => import('./Widget'))

export const Settings = React.lazy(() => import('./Settings'))

const elementProps = {
  type: 'Table',
  layout: {
    w: 12,
    h: 7,
    minW: 6,
    minH: 6
  },
  settings: {
    label: '表格',
  },
  copyable: true,
  deletable: true
}

export type TableColumnType = {
  id: number | string;
  name: string;
  visible?: boolean
  dataType?: string
  fieldValue?: any
  width?: number | string
  align?: 'left' | 'center' | 'right'
  isWrap?: boolean
  isDefault?: boolean
} & Record<string, any>

export function getDefaultColumn<T> (data?: T): T {
  return {
    align: 'left',
    width: 'auto',
    isWrap: true,
    visible: true,
    dataType: 'String',
    ...data
  } as T
}

export default {
  Widget,
  name: 'Table',
  title: '表格',
  noStyle: true,
  elementProps,
  Icon: TableOutlined
}
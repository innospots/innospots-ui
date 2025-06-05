import _ from 'lodash'

import { withWidgetWrapper } from './Wrapper'

import Modules from './Modules'

export const ALL_WIDGETS = Modules.ALL_WIDGETS

export const WIDGET_SETTINGS = Modules.WIDGET_SETTINGS

export const BASE_WIDGETS: Record<string, any>[] = Modules.BASE_WIDGETS

export const ADVANCED_NODE_WIDGETS: Record<string, any>[] = Modules.ADVANCED_NODE_WIDGETS

export const APP_WIDGET_LIST: Record<string, any>[] = [/**{
  id: 'container',
  title: '容器组件',
  widgets: [
    Modules.Form.default
  ]
}, **/{
  id: 'base',
  title: '基础组件',
  widgets: [
    // Modules.Table.default,
    // Modules.Button.default,
    ...BASE_WIDGETS,
    Modules.Image.default,
    Modules.Upload.default,
    Modules.Response.default
  ]
}, {
  id: 'advanced',
  title: '高级组件',
  widgets: [
    // Modules.Table.default,
    Modules.TableForm.default
  ]
}]

export const NODE_WIDGET_LIST: Record<string, any>[] = [{
  id: 'base',
  title: '基础组件',
  widgets: [
    ...BASE_WIDGETS
  ]
}, {
  id: 'advanced',
  title: '高级组件',
  widgets: [
    ...ADVANCED_NODE_WIDGETS
  ]
}]

export const getResolver = (): Record<string, any> => {
  return ALL_WIDGETS.reduce((result, item) => {
    result[item.name] = withWidgetWrapper(item.Widget)
    return result
  }, {})
}

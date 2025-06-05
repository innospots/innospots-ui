import _ from 'lodash'
import Timeline from '@udidu/timeline'
import { useMemo, useEffect, useCallback } from 'react'
import { useUpdate, useReactive, useSafeState, useDebounceEffect } from 'ahooks'

import { randomString, parseString, getRuleExpData } from '@/common/utils'

export type LayoutType = {
  i?: string,
  w: number,
  h: number,
  x: number,
  y: number
}

export type WidgetItemType = {
  id: string
  type: string
  name?: string
  settings?: any
  layout: LayoutType
  parentId?: string
  widgets?: WidgetsType
  isDefault?: boolean
  copyAble?: boolean
  deleteAble?: boolean
  pageType?: 'edit' | 'preview' | 'page'
  widgetType?: 'edit' | 'view'
} & Record<string, any>

export type WidgetsType = WidgetItemType[]

interface CommonStateType {
  hoverWidgetId: string
  resizingWidgetId: string
  rightSidebarCollapsed: boolean
  settingCollapsed: boolean
}

interface WidgetStateType {
  widgets: WidgetsType
  selectedWidgetId: string
  // 当前选中控件的父控件
  selectedWidgetParent: string
}

export interface PageType {
  pageKey: string
  pageUrl: string
  pageName: string
  setHomePage: boolean
  showNavigation: boolean,
  components?: Record<string, any>
}

interface AppStateType {
  pages: PageType[]
  currentPageKey: string
  settings?: Record<string, any>
}

interface AppResourcesType {
  pages: PageType[]
}

export const getPageKey = () => ['PG', randomString()].join('_')
export const getWidgetId = (index: number = 0) => ['WI', index, randomString()].join('_')

const defaultAppWidgets = () => (
  [{
    id: getWidgetId(),
    copyAble: true,
    deleteAble: true,
    type: 'Table',
    name: 'Table1',
    layout: {
      w: 12, h: 5, x: 0, y: 0
    },
    settings: {
      serverPaging: true
    }
  }]
)

export default () => {
  const updateCurrent = useUpdate();

  const [appState, setAppState] = useSafeState<AppStateType>({
    pages: [],
    settings: {},
    currentPageKey: ''
  })

  const formValue = useReactive<Record<string, any>>({
    editValues: {},
    initialValues: {},
    currentValues: {}
  })

  const [widgetInited, setWidgetInited] = useSafeState(false)
  const [formValues, setFormValues] = useSafeState<Record<string, any>>({
    editValues: {},
    initialValues: {},
    currentValues: {}
  })

  const [formErrorFields, setFormErrorFields] = useSafeState<any[]>([])

  const currentFormValues = useMemo(() => {
    return {
      ...formValues.initialValues,
      ...formValues.currentValues,
      ...formValues.editValues
    }
  }, [ formValues.initialValues, formValues.currentValues, formValues.editValues ])

  const widgetStates = useReactive<Record<string, any>>({})
  const [ appType, setAppType ] = useSafeState<'app' | 'node'>()
  const [ platform, setPlatform ] = useSafeState<string>('desktop')
  const [ nodeEditPage, setNodeEditPage ] = useSafeState<string>('config')
  const [ hiddenWidgets, setHiddenWidgets ] = useSafeState<string[]>([])

  const currentPageKey = appState.currentPageKey
  const currentPage = useMemo(() => _.find(appState.pages, page => page.pageKey === currentPageKey), [ currentPageKey, appState.pages ])

  const isAppEditor = useMemo(() => appType === 'app', [ appType ])
  const isNodeEditor = useMemo(() => appType === 'node', [ appType ])

  const currentTimeline = widgetStates[currentPageKey] || {}
  const { widgets = [], selectedWidgetId, selectedWidgetParent } = useMemo(() => {
    return currentTimeline.present || {}
  }, [ currentTimeline.present ])

  const getErrorField = (name?: string | string[]) => {
    if (!name) return null

    if (_.isString(name)) {
      name = [name]
    }

    return _.find(formErrorFields, item => _.isEqual(name, item.name))
  }

  const updateAppState = (state = appState) => {
    setAppState({
      ...state
    })
  }

  const updateFormValue = (values = formValues) => {
    setFormValues(_.cloneDeep(values))
  }

  const getComponents = (widgets: WidgetsType) => {
    return _.reduce(widgets, (result, item) => {
      result[item.id] = item
      return result
    }, {})
  }

  const updateWidgetsData = (formData) => {
    let widgetNames: string[] = [
      ...hiddenWidgets
    ]
    _.each(widgets, ({ name, settings }) => {
      if (settings?.conditions) {
        const expData = getRuleExpData(settings.conditions)
        if (expData) {
          let result
          try {
            _.each(['hidden', 'visible'], type => {
              if (expData[type]) {
                result = parseString(expData[type], formData)
                if (type === 'visible') {
                  result = !result
                }
              }
            })
          } catch (e) {
            console.info(e)
          }

          if (result === true) {
            if (!widgetNames.includes(name)) {
              widgetNames.push(name)
            }
          } else {
            widgetNames = widgetNames.filter(item => item !== name)
          }
        }
      }
    })

    if (widgets.length) {
      setWidgetInited(true)
    }

    setHiddenWidgets(widgetNames)
  }

  useDebounceEffect(() => {
    if (widgets?.length) {
      updateWidgetsData({
        ...formValues.initialValues,
        ...formValues.currentValues,
        ...formValues.editValues
      })
    } else {
      setWidgetInited(true)
    }
  }, [ formValues.editValues, formValues.currentValues, formValues.initialValues, widgets ], {
    wait: 500
  })

  useEffect(() => {
    getInitialValues()
  }, [ appState.currentPageKey ])

  const commonState = useReactive<CommonStateType>({
    hoverWidgetId: '',
    resizingWidgetId: '',
    settingCollapsed: true,
    rightSidebarCollapsed: false,
  })

  const getNewTimeline = (_widgets: WidgetsType) => {
    return new Timeline({
      size: 50,
      present: {
        widgets: _widgets,
        selectedWidgetId: '',
        selectedWidgetParent: ''
      }
    })
  }

  const clearFormValue = () => {
    setFormValues({
      editValues: {},
      initialValues: {},
      currentValues: {}
    })
  }

  const clearPageState = useCallback(() => {
    try {
      _.each(widgetStates, (tl: any, key) => {
        tl.clear()
        delete widgetStates[key]
      })
    } catch (e) {}

    clearFormValue()
    setWidgetInited(false)
    setNodeEditPage('config')

    appState.pages = []
    appState.settings = {}
    appState.currentPageKey = ''

    updateAppState(appState)

    commonState.hoverWidgetId = ''
    commonState.resizingWidgetId = ''
    commonState.settingCollapsed = true
    commonState.rightSidebarCollapsed = false
  }, [ widgetStates ])

  const updateTimelinePresent = (newPresent: Partial<WidgetStateType>) => {
    if (currentTimeline) {
      currentTimeline.setPresent?.({
        ...currentTimeline.present,
        ...newPresent
      })
    }
  }

  const getPageData = (data?: PageType) => {
    const pageKey = getPageKey()
    return {
      pageKey,
      pageUrl: '',
      pageName: `Page ${appState.pages.length + 1}`,
      setHomePage: false,
      showNavigation: false,
      settings: {},
      ...data
    }
  }

  const updateCurrentPage = (data: PageType) => {
    if (!currentPageKey) return

    const page = _.find(appState.pages, item => item.pageKey === currentPageKey)
    if (page) {
      _.merge(page, data)
      appState.pages = [
        ...appState.pages
      ]

      updateAppState(appState)
    }
  }

  const getDefaultWidgets = () => isAppEditor ? [] : []

  const addNewPage = (data?: PageType) => {
    const page = getPageData(data)
    appState.pages.push(page)
    appState.pages = [
      ...appState.pages
    ]
    appState.currentPageKey = page.pageKey

    widgetStates[appState.currentPageKey] = getNewTimeline(getDefaultWidgets())

    updateAppState(appState)
  }

  const deletePage = (pageKey: string) => {
    appState.pages = _.filter(appState.pages, page => page.pageKey !== pageKey)

    delete widgetStates[pageKey]

    if (appState.currentPageKey === pageKey) {
      setTimeout(() => {
        appState.currentPageKey = appState.pages[0].pageKey
        updateAppState(appState)
      }, 100)
    }
  }

  const getWidgetById = (id: string, target = widgets) => _.find(target, item => item.id === id)

  const selectedWidget = useMemo<WidgetItemType | undefined>(() => {
    let curWidgets = widgets
    if (selectedWidgetParent) {
      const parentWidget = getWidgetById(selectedWidgetParent)
      if (parentWidget) {
        curWidgets = parentWidget.widgets || []
      }
    }

    const widget = getWidgetById(selectedWidgetId, curWidgets)

    return _.cloneDeep(widget)
  }, [widgets, selectedWidgetParent, selectedWidgetId])

  const getLayouts = (currentWidgets = widgets) => _.map(currentWidgets, widget => ({
    i: widget.id,
    ...widget.layout
  }))

  const layouts = useMemo<LayoutType[]>(() => getLayouts(widgets), [widgets])

  const formatedLayout = useMemo(() => {
    let newLayouts
    let newWidgets = _.filter(widgets, item => {
      const settings = item.settings || {}
      return !settings.hidden && !settings.forbidden
    })

    const originalWidgets = widgetStates.original?.[appState.currentPageKey] || []
    if (hiddenWidgets.length) {
      newWidgets = _.filter(newWidgets, item => !hiddenWidgets.includes(item.name))

      const layoutWidgets = _.filter(originalWidgets, item => _.find(newWidgets, ni => (item.id === ni.id)))
      newLayouts = getLayouts(layoutWidgets.length ? layoutWidgets : newWidgets)
      return {
        widgets: newWidgets,
        layouts: newLayouts
      }
    } else {
      const layoutWidgets = _.filter(originalWidgets, item => _.find(widgets, ni => (item.id === ni.id)))
      newLayouts = getLayouts(layoutWidgets.length ? layoutWidgets : newWidgets)
      return {
        widgets: newWidgets,
        layouts: newLayouts
      }
    }
  }, [ widgets, hiddenWidgets, appState.currentPageKey ])

  const getDefaultWidgetName = (type: string, parentId?: string): string => {
    let targetWidgets = widgets

    if (parentId) {
      const parentWidget = getWidgetById(parentId)
      targetWidgets = parentWidget?.widgets || []
    }

    const types = _.filter(targetWidgets, item => item.type === type)
    return [type, types.length + 1].join('')
  }

  const updateWidgets = (newWidgets: WidgetsType) => {
    updateTimelinePresent({
      widgets: newWidgets
    })
    updateCurrentPage(_.assign(currentPage, {
      components: getComponents(newWidgets)
    }))
  }

  const setSelectedWidget = (id: string, parentId?: string) => {

    if (id === selectedWidgetId) return

    updateTimelinePresent({
      selectedWidgetId: id,
      selectedWidgetParent: parentId || ''
    })
    updateCurrent()
  }

  const updateWidgetsLayout = (layout: LayoutType[], newWidgets: WidgetsType = _.cloneDeep(widgets)) => {
    if (_.isEqual(layout, layouts)) return

    layout.map(layoutItem => {
      const widget = getWidgetById(layoutItem.i || '', newWidgets)
      if (widget) {
        widget.layout = {
          ...widget.layout,
          ...layoutItem
        }
      }
    })
    setTimeout(() => {
      updateWidgets([
        ...newWidgets
      ])
    }, 10)
  }

  const addNewWidget = (data: WidgetItemType, newLayout?: LayoutType[], parentId?: string) => {
    const cloneWidgets = _.cloneDeep(widgets)

    data.id = getWidgetId(cloneWidgets.length)
    data.name = getDefaultWidgetName(data.type, parentId)

    if (parentId) {
      const parentWidget = getWidgetById(parentId, cloneWidgets)
      if (parentWidget) {
        parentWidget.widgets = parentWidget.widgets || []
        parentWidget.widgets.push(data)
      }
    } else {
      cloneWidgets.push(data)
    }

    if (newLayout) {
      updateWidgetsLayout(newLayout, cloneWidgets)
    } else {
      updateWidgets(cloneWidgets)
    }
  }

  const copyWidget = (id: string, parentId?: string) => {
    const cloneWidgets = _.cloneDeep(widgets)
    const widget = getWidgetById(parentId || id, cloneWidgets)

    if (widget) {
      let newWidget

      if (parentId) {
        newWidget = _.cloneDeep(getWidgetById(id, _.cloneDeep(widget.widgets)))
      } else {
        newWidget = _.cloneDeep(widget)
      }

      const oldLayout = newWidget.layout || {}

      newWidget.id = getWidgetId(cloneWidgets.length)
      newWidget.name = getDefaultWidgetName(newWidget.type, parentId)
      newWidget.layout = {
        ...oldLayout,
        i: newWidget.id,
        y: oldLayout.y + oldLayout.h
      }

      if (parentId) {
        widget.widgets = widget.widgets || []
        widget.widgets.push(newWidget)
      } else {
        cloneWidgets.push(newWidget)
      }

      updateWidgets(cloneWidgets)
    }
  }

  const deleteWidget = (id: string, parentId?: string) => {
    if (selectedWidgetId === id) {
      setSelectedWidget('')
    }

    if (parentId) {
      const cloneWidgets = _.cloneDeep(widgets)
      const parentWidget = getWidgetById(parentId, cloneWidgets)

      if (parentWidget) {
        parentWidget.widgets = _.filter(parentWidget.widgets, item => item.id !== id)
        updateWidgets(cloneWidgets)
      }
    } else {
      updateWidgets(_.filter(widgets, item => item.id !== id))
    }
  }

  const updateChildWidgets = (parentId: string, children: WidgetsType) => {
    const cloneWidgets = _.cloneDeep(widgets)
    const parentWidget = getWidgetById(parentId, cloneWidgets)

    if (parentWidget) {
      parentWidget.widgets = children
      updateWidgets(cloneWidgets)
    }
  }

  const updateSelectedWidgetProps = (props: Record<string, any>, isOverride?: boolean) => {
    const currentId = selectedWidgetId
    const parentId = selectedWidgetParent
    const cloneWidgets = _.cloneDeep(widgets)
    let currentWidget = getWidgetById(parentId || currentId, cloneWidgets)

    if (currentWidget) {
      if (parentId) {
        currentWidget = getWidgetById(currentId, currentWidget.widgets)
      }
    }

    if (currentWidget) {
      if (isOverride) {
        _.assign(currentWidget, props)
      } else {
        _.merge(currentWidget, props)
      }
    }

    updateWidgets(cloneWidgets)
  }

  const getSelectedWidgetSettings = () => {
    if (selectedWidget) {
      return selectedWidget.settings || {}
    }
    return {}
  }

  const undo = () => {
    currentTimeline.undo()
  }

  const redo = () => {
    currentTimeline.redo()
  }

  const getAppResources = () => {
    const resources = {
      pages: _.map(appState.pages, page => {
        const present = widgetStates[page.pageKey]?.present || {}
        if (!_.isEmpty(present.widgets)) {
          page.components = getComponents(present.widgets)
        }
        return page
      })
    }

    return resources
  }

  const getInitialValues = () => {
    const curPage = _.find(appState.pages, page => page.pageKey === appState.currentPageKey)
    if (!curPage) return

    const newWidgets = _.values(curPage.components)
    const values = _.reduce(newWidgets, (result, item) => {
      const { initialValue, forbidden } = item.settings || {}
      if (!forbidden) {
        result[item.name] = initialValue
      }
      return result
    }, {})

    setWidgetInited(false)

    formValues.initialValues = values
    formValues.currentValues = {
      ...values
    }

    updateFormValue()
  }

  const setAppWidgets = (pages: PageType[]) => {
    _.each(pages, page => {
      if (page.components) {
        const currentWidgets = _.values(page.components)
        widgetStates[page.pageKey] = getNewTimeline(currentWidgets)

        widgetStates.original = {}
        widgetStates.original[page.pageKey] = _.cloneDeep(currentWidgets)
      }
    })
    const defaultPageKey = pages[0].pageKey
    appState.currentPageKey = defaultPageKey

    if (_.isEmpty(widgetStates[defaultPageKey])) {
      widgetStates[defaultPageKey] = getNewTimeline(getDefaultWidgets())
    }

    updateAppState(appState)
  }

  const initAppResources = (resources?: AppResourcesType) => {
    const pages = appState.pages = resources?.pages || []

    if (resources) {
      _.each(['in', 'out'], k => {
        const pk = `${k}Ports`
        resources[pk] = _.map(resources[pk], p => {
          if (!p.id) {
            p.id = randomString(4)
          }
          return p
        })
      })
    }
    
    if (!pages.length) {
      addNewPage()
    } else {
      setAppWidgets(pages)
    }
  }

  const updateFormValues = (formData) => {
    updateWidgetsData(formData)
  }

  return {
    layouts,
    widgets,
    copyWidget,
    addNewWidget,
    deleteWidget,
    updateWidgets,
    formatedLayout,
    getSelectedWidgetSettings,

    getWidgetById,
    setSelectedWidget,
    updateChildWidgets,
    updateWidgetsLayout,
    updateSelectedWidgetProps,

    redo, undo,
    canUndo: currentTimeline.hasPast,
    canRedo: currentTimeline.hasFuture,

    currentPage,
    addNewPage,
    deletePage,
    updateCurrentPage,

    formValue,
    widgetInited,
    nodeEditPage,
    setWidgetInited,
    setNodeEditPage,
    getInitialValues,

    selectedWidgetId,
    selectedWidgetParent,

    appType,
    setAppType,
    isAppEditor,
    isNodeEditor,

    platform,
    setPlatform,

    formErrorFields,
    setFormErrorFields,
    getErrorField,
    
    appState,
    commonState,
    selectedWidget,

    updateAppState,

    hiddenWidgets,
    setHiddenWidgets,

    formValues,
    setFormValues,
    updateFormValue,
    currentFormValues,

    setAppWidgets,
    clearFormValue,
    clearPageState,
    getAppResources,
    initAppResources,
    updateFormValues,
  }
}

import _ from 'lodash'
import { useMemo } from 'react'
import { useSafeState, useReactive } from 'ahooks'

export default () => {
  const appState = useReactive({
    widgetData: {}
  })

  const [ inputData, setInputData ] = useSafeState<any[]>([])

  const formatedInputFields = useMemo(() => {
    const fields = _.map(inputData, (item) => {
      const children: any[] = [];
      _.each(item.fields, (field) => {
        children.push({
          title: field.label,
          dataType: field.type,
          nodeKey: item.nodeKey,
          code: field.value,
          value: [item.nodeKey, field.value].join('$$')
        })
      })

      return {
        title: item.nodeName,
        value: item.nodeKey,
        children: children
      };
    });

    return _.filter(fields, field => !!field.children.length);
  }, [ inputData ])

  const setWidgetData = (widgetId: string, data: any) => {
    appState.widgetData[widgetId] = data
  }
  
  const getWidgetData = (widgetId: string): any => {
    return appState.widgetData[widgetId] || {}
  }
  
  const getOptionsByFieldSource = (fieldSource?: string): any[] => {
    if (inputData?.length) {

      return _.map(inputData, (item) => {
        return {
          label: item.nodeName,
          value: item.nodeKey,
          children: item.fields,
        };
      })
    }
    //   let nodeData
    //   if (!fieldSource) {
    //     if (inputData.length === 1) {
    //       nodeData = inputData[0]
    //     } else {
    //       return _.map(inputData, (item) => {
    //         return {
    //           label: item.nodeName,
    //           value: item.nodeKey,
    //           children: item.fields,
    //         };
    //       })
    //     }
    //   } else {
    //     nodeData = _.find(inputData, item => item.portId === fieldSource)
    //   }

    //   if (nodeData) {
    //     return nodeData.fields
    //   }
    // }
    return []
  }

  return {
    inputData,
    setInputData,
    formatedInputFields,

    appState,
    setWidgetData,
    getWidgetData,
    getOptionsByFieldSource
  }
}
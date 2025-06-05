import _ from 'lodash'
import { request } from 'umi';
import { message } from 'antd'

import { dataRequest, globalRequest } from '@/common/request';
import { ActionType } from '@/models/Action'
import { APPS_AJAX_PREFIX } from '@/common/constants';
import { isRequestSuccess } from '@/common/utils';

let actionResults: any[] = []

export function runtimeWebhook<T> (path: string, method?: string, data?: Record<string, any>) {
  const config: any = {
    method: (method || 'POST').toUpperCase()
  }

  if (config.method === 'GET') {
    config.params = data || {}
  } else {
    config.data = data || {}
  }

  return dataRequest<T>(`runtime/webhook/${path}`, config);
};

export function submitAppData<T> (appKey: string, registryId: string, data?: Record<string, any>) {
  return request<T>(`${APPS_AJAX_PREFIX}/data/${appKey}/registry/${registryId}`, {
    data,
    method: 'post'
  });
};

const getActionResult = (action: ActionType, result: any): any => {
  return {
    action,
    result
  }
}

const getMappingParams = (schemaFields: any[], params?: any) => {
  let postData = {}
  params = {
    ...(params || {})
  }

  if (schemaFields?.length) {
    _.each(schemaFields, ({code, widget}) => {
      const value = params[widget || code]
      if (!_.isUndefined(value)) {
        postData[code] = value
        if (widget) {
          delete params[widget]
        }
      }
    })
  }

  return {
    ...params,
    ...postData
  }
}

const actionRunFns = {
  'SUBMIT_FORM_DATA': async (action: ActionType, params?: any, appInfo?: any) => {

    if (!appInfo?.appKey) {
      return Promise.reject(false)
    }

    try {
      const { table, action: method } = action.formData || {}
      const { configs, schemaFields } = table || {}
      if (!configs?.uri) {
        return Promise.resolve(true)
      }
      const postData = getMappingParams(schemaFields, params)
      const requestConfig: Record<string, any> = {
        method: method,
        data: postData
      }

      const result = await globalRequest(configs.uri, requestConfig) as any
      if (isRequestSuccess(result?.code)) {
        return Promise.resolve(result.body)
      } else {
        return Promise.resolve(false)
      }
    } catch (e) {
      return Promise.reject(e)
    }
  },

  'READ_DATA': async (action: ActionType, params?: any, appInfo?: any) => {

    if (!appInfo?.appKey) {
      return Promise.reject(false)
    }

    try {
      const { table, action: method } = action.formData || {}
      const { configs, schemaFields } = table || {}
      if (!configs?.uri) {
        return Promise.resolve(true)
      }
      const postData = getMappingParams(schemaFields, params)

      const requestConfig: Record<string, any> = {
        method: method,
      }

      if (method === 'GET') {
        requestConfig.params = postData
      } else {
        requestConfig.data = postData
      }

      const result = await globalRequest(configs.uri, requestConfig) as any
      if (isRequestSuccess(result?.code)) {
        return Promise.resolve(result.body)
      } else {
        return Promise.resolve(false)
      }
    } catch (e) {
      return Promise.reject(e)
    }
  },

  'OPERATE_WIDGETS': async (action: ActionType, params?: any, appInfo?: any) => {
    return Promise.resolve(true)
  },

  'SAVE_DATA': async (action: ActionType, params?: any, appInfo?: any) => {

    if (!appInfo?.appKey) {
      return Promise.reject(false)
    }

    try {
      const { value: registryId } = action.formData?.table || {}
      const { schemaFields } = action.formData?.fieldMapping || {}
      if (!registryId) {
        return Promise.reject(false)
      }
      const postData = {}
      params = {
        ...(params || {})
      }

      if (schemaFields?.length) {
        _.each(schemaFields, ({code, value}) => {
          if (value) {
            postData[code] = params[value]
            delete params[value]
          }
        })
      }

      _.merge(postData, params)

      const result = await submitAppData(appInfo.appKey, registryId, postData) as any
      if (isRequestSuccess(result?.code)) {
        return Promise.resolve(result.body)
      } else {
        return Promise.resolve(false)
      }
    } catch (e) {
      return Promise.reject(e)
    }
  },

  'SET_DATA': async () => {
    return Promise.resolve({
      results: _.cloneDeep(actionResults)
    })
  },

  'MESSAGE_NOTICE': async (action: ActionType) => {
    const { type, style, content, failContent, successContent } = action.formData || {}

    if (type === 'FIXED_VALUE') {
      try {
        message[style || 'success'](content)
      } catch (e) {
        return Promise.reject(e)
      }
    } else if (type === 'LAST_EVENT_VALUE') {
      const lastResult = _.last(actionResults)
      if (lastResult) {
        message.success(successContent || '处理成功')
      } else {
        message.error(failContent || '处理失败')
      }
    }

    return Promise.resolve(true)
  }
}

export const runAction = async (action: ActionType, params?: any, appInfo?: any) => {
  const fn = actionRunFns[action.type]
  if (fn) {
    try {
      const result = await fn(action, params, appInfo)
      return Promise.resolve(result)
    } catch (e) {
      return Promise.reject(false)
    }
  }
}

export const runActions = async (actions: ActionType[], callbacks?: Record<string, (action: ActionType) => void>) => {
  actionResults = []

  const processFn = callbacks?.process || _.noop
  const endFn = callbacks?.end || _.noop
  const getParams = callbacks?.getParams || _.noop
  const getAppInfo = callbacks?.getAppInfo || _.noop

  for (let index = 0; index < actions.length; index++) {
    const actionItem = actions[index]
    const params = getParams(actionItem) as any || {}
    const appInfo = getAppInfo() as any || {}
    const result = await runAction(actionItem, params, appInfo)
    const actionResult = getActionResult(actionItem, result)
    actionResults.push(actionResult)
    processFn(actionResult)
  }

  endFn(actionResults)
}
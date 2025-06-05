import _ from 'lodash'

export const formRules = {
  TableForm: ({ customColumns }) => ([{
    validator(rule, value) {
      if (value?.length) {
        const errors: string[] = []
        _.map(customColumns, (col: any) => {
          if (col.required) {
            const error = !!_.find(value, val => {
              const colVal = val[col.code]
              return _.isNil(colVal) || colVal === ''
            })
            if (error) {
              errors.push(col.code)
            }
          }
        })
        if (errors.length) {
          return Promise.reject(errors)
        }
      }
      
      return Promise.resolve();
    },
  }])
}

export const getFormRules = (widgetType: string, settings: any): any[] => {
  const getRules = formRules[widgetType]
  if (getRules) {
    return getRules(settings)
  }

  return []
}
import _ from 'lodash'

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g

export function transform(template, data) {
  let value = template

  try {
    const compiled = _.template(template)
    value = compiled(data)
  } catch (e) {}

  return value
}

export { ExpressionInput } from './Input'
export { ExpressionModal } from './Modal'
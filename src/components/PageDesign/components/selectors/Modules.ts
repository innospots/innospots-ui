import _ from 'lodash'

const context = require.context('./widgets', true, /index\.ts$/)
const Modules: Record<string, any> = {
  ALL_WIDGETS: [],
  BASE_WIDGETS: [],
  WIDGET_SETTINGS: {},
  ADVANCED_NODE_WIDGETS: []
}

const baseWidgetKeys = [
  'Input',
  'Switch',
  'Header',
  'Button',
  'Cascader',
  'TextArea',
  'TimePicker',
  'DatePicker',
  'RangePicker',
  'NumberInput',
  'PasswordInput',
  'OptionPicker',
  'MultiSelectPicker'
]

const advancedNodeWidgetKeys = [
  'TableFields',
  'JsonEditor',
  'RuleEditor',
  'SqlEditor',
  'ScriptEditor',
  'WebhookInput',
  'FieldList',
  'JoinFields',
  'HttpRequest',
  'QueryParams',
  'HttpURLInput',
  'FieldMapping',
  'BranchConfig',
  'VariableConfig',
  'KeyValueEditor',
  'DataTableSelect',
  'InputFieldTable',
  'FieldMappingTable',
  'CredentialSelect',
  'InputFieldSelect',
  'InputFieldSelect2',
  'AggregateVariables'
]

context.keys().forEach(key => {
  const moduleKey = key.replace(/^(\.\/)|(\/index\.ts$)/g, '')
  // moduleKey = _.map(moduleKey.split('/'), k => _.upperFirst(_.camelCase(k))).join('.')

  const contextData = context(key)
  
  if (contextData) {
    Modules.ALL_WIDGETS.push(contextData.default)
    Modules.WIDGET_SETTINGS[moduleKey] = contextData.Settings
  }

  if (baseWidgetKeys.includes(moduleKey)) {
    Modules.BASE_WIDGETS.push(contextData.default)
  }

  if (advancedNodeWidgetKeys.includes(moduleKey)) {
    Modules.ADVANCED_NODE_WIDGETS.push(contextData.default)
  }

  Modules[moduleKey] = contextData
})

export default Modules
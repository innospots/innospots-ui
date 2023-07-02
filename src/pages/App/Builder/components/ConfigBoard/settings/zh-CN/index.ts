
/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

export const baseWidgets = [
  {
    text: '输入框',
    name: 'input',
    schema: {
      title: '输入框',
      type: 'string',
      readOnlyWidget: 'ReadOnlyWidget'
    },
    setting: {
      props: {
        title: '表单属性',
        type: 'object',
        labelWidth: 80,
        properties: {
          placeholder: {
            title: '占位符',
            type: 'string',
          },
          allowClear: {
            title: '是否带清除按钮',
            description: '填写内容后才会出现x哦',
            type: 'boolean',
          }
        },
      },
      minLength: {
        title: '最小字符数',
        type: 'number',
      },
      maxLength: {
        title: '最大字符数',
        type: 'number',
      },
      pattern: {
        title: '校验正则表达式',
        type: 'string',
        props: {
          placeholder: '填写正则表达式',
        },
      },
    },
  },
  {
    text: '密码输入框',
    name: 'password',
    schema: {
      title: '密码输入框',
      type: 'string',
      format: 'Password',
      readOnlyWidget: 'ReadOnlyWidget'
    },
  },
  {
    text: '大输入框',
    name: 'textarea',
    schema: {
      title: '编辑框',
      type: 'string',
      format: 'textarea',
      readOnlyWidget: 'ReadOnlyWidget'
    },
    setting: {
      props: {
        title: '选项',
        type: 'object',
        labelWidth: 80,
        properties: {
          autoSize: {
            title: '高度自动',
            type: 'boolean',
          },
          rows: {
            title: '指定高度',
            type: 'number',
          },
        },
      },
      minLength: {
        title: '最短字数',
        type: 'number',
      },
      maxLength: {
        title: '最长字数',
        type: 'number',
      },
      pattern: {
        title: '校验正则表达式',
        type: 'string',
        props: {
          placeholder: '填写正则表达式',
        },
      },
    },
  },
  {
    text: '日期选择',
    name: 'date',
    schema: {
      title: '日期选择',
      type: 'string',
      format: 'date',
      readOnlyWidget: 'ReadOnlyWidget'
    },
    setting: {
      format: {
        title: '格式',
        type: 'string',
        enum: ['dateTime', 'date', 'time'],
        enumNames: ['日期时间', '日期', '时间'],
      },
      props: {
        title: '表单选项',
        type: 'object',
        labelWidth: 80,
        properties: {
          showTime: {
            title: '显示时间',
            type: 'boolean'
          },
          format: {
            title: '格式',
            type: 'string',
            enum: [
              'YYYY-MM-DD HH:mm:ss',
              'YYYY-MM-DD HH:mm',
              'YYYY-MM-DD',
            ],
            enumNames: [
              'YYYY-MM-DD HH:mm:ss',
              'YYYY-MM-DD HH:mm',
              'YYYY-MM-DD',
            ],
          },
        },
      },
    },
  },
  {
    text: '时间选择',
    name: 'time',
    schema: {
      title: '时间选择',
      type: 'string',
      format: 'time',
      readOnlyWidget: 'ReadOnlyWidget'
    },
    setting: {
      props: {
        title: '表单选项',
        type: 'object',
        labelWidth: 80,
        properties: {
          format: {
            title: '格式',
            type: 'string',
            enum: [
              'HH:mm:ss',
              'HH:mm',
              'mm:ss'
            ],
            enumNames: [
              'HH:mm:ss',
              'HH:mm',
              'mm:ss'
            ],
          },
        },
      },
    },
  },
  {
    text: '数字输入框',
    name: 'number',
    schema: {
      title: '数字输入框',
      type: 'number',
      readOnlyWidget: 'ReadOnlyWidget'
    },
    setting: {
      default: {
        title: '默认值',
        type: 'number',
      },
      props: {
        title: '表单选项',
        type: 'object',
        labelWidth: 80,
        properties: {
          addonBefore: {
            title: '前字符',
            type: 'string',
          },
          addonAfter: {
            title: '后字符',
            type: 'string',
          },
          step: {
            title: '每增长步数',
            type: 'number',
          },
          min: {
            title: '最小值',
            type: 'number',
          },
          max: {
            title: '最大值',
            type: 'number',
          },
        },
      },
    },
  },
  {
    text: '是否选择',
    name: 'checkbox',
    schema: {
      title: '是否选择',
      type: 'boolean',
      widget: 'checkbox',
      readOnlyWidget: 'ReadOnlyWidget'
    },
    setting: {
      default: {
        title: '是否默认勾选',
        type: 'boolean',
      },
    },
  },
  {
    text: '是否switch',
    name: 'switch',
    schema: {
      title: '是否选择',
      type: 'boolean',
      widget: 'switch',
      default: false,
      readOnlyWidget: 'ReadOnlyWidget'
    },
    setting: {
      default: {
        title: '是否默认勾选',
        type: 'boolean',
      },
    },
  },
  {
    text: '下拉单选',
    name: 'select',
    schema: {
      title: '单选',
      type: 'string',
      options: [{
        value: 'a',
        label: '早'
      }],
      widget: 'Select',
      readOnlyWidget: 'Select'
    },
    setting: {
      mode: {
        title: '多选或标签',
        type: 'string',
      },
      optionsType: {
        title: '选项类型',
        type: 'string',
        widget: 'radio',
        default: 'customOptions',
        enum: ['customOptions', 'dateOptions'],
        enumNames: ['自定义', '日期'],
      },
      options: {
        title: '选项',
        type: 'array',
        widget: 'simpleList',
        hidden: '{{rootValue.optionsType !== "customOptions"}}',
        className: 'frg-options-list',
        items: {
          type: 'object',
          properties: {
            value: {
              title: '',
              type: 'string',
              className: 'frg-options-input',
              props: {},
              placeholder: '字段',
            },
            label: {
              title: '',
              type: 'string',
              className: 'frg-options-input',
              props: {},
              placeholder: '名称',
            },
          },
        },
        props: {
          hideMove: true,
          hideCopy: true,
        },
      },
    },
  },
  {
    text: '点击单选',
    name: 'radio',
    schema: {
      title: '单选',
      type: 'string',
      enum: ['a', 'b', 'c'],
      enumNames: ['早', '中', '晚'],
      widget: 'radio',
      readOnlyWidget: 'ReadOnlyWidget'
    },
    setting: {
      enumList: {
        title: '选项',
        type: 'array',
        widget: 'simpleList',
        className: 'frg-options-list',
        items: {
          type: 'object',
          properties: {
            value: {
              title: '',
              type: 'string',
              className: 'frg-options-input',
              props: {},
              placeholder: '字段',
            },
            label: {
              title: '',
              type: 'string',
              className: 'frg-options-input',
              props: {},
              placeholder: '名称',
            },
          },
        },
        props: {
          hideMove: true,
          hideCopy: true,
        },
      },
      props: {
        type: 'object',
        properties: {
          optionType: {
            title: '展示类型',
            type: 'string',
            widget: 'radio',
            default: 'default',
            enum: ['default', 'button'],
            enumNames: ['默认', '按钮'],
          },
        },
      },
    },
  },
  {
    text: '下拉多选',
    name: 'multiSelect',
    schema: {
      title: '多选',
      description: '下拉多选',
      type: 'array',
      items: {
        type: 'string',
      },
      enum: ['A', 'B', 'C', 'D'],
      enumNames: ['杭州', '武汉', '湖州', '贵阳'],
      widget: 'multiSelect',
      readOnlyWidget: 'ReadOnlyWidget'
    },
    setting: {
      default: {
        title: '默认值',
        type: 'array',
        widget: 'jsonInput',
      },
      enumList: {
        title: '选项',
        type: 'array',
        widget: 'simpleList',
        className: 'frg-options-list',
        items: {
          type: 'object',
          properties: {
            value: {
              title: '',
              type: 'string',
              className: 'frg-options-input',
              props: {},
              placeholder: '字段',
            },
            label: {
              title: '',
              type: 'string',
              className: 'frg-options-input',
              props: {},
              placeholder: '名称',
            },
          },
        },
        props: {
          hideMove: true,
          hideCopy: true,
        },
      },
    },
  },
  {
    text: '点击多选',
    name: 'checkboxes',
    schema: {
      title: '多选',
      type: 'array',
      widget: 'checkboxes',
      readOnlyWidget: 'ReadOnlyWidget',
      items: {
        type: 'string',
      },
      enum: ['A', 'B', 'C', 'D'],
      enumNames: ['杭州', '武汉', '湖州', '贵阳'],
    },
    setting: {
      default: {
        title: '默认值',
        type: 'array',
        widget: 'jsonInput',
      },
      enumList: {
        title: '选项',
        type: 'array',
        widget: 'simpleList',
        className: 'frg-options-list',
        items: {
          type: 'object',
          properties: {
            value: {
              title: '',
              type: 'string',
              className: 'frg-options-input',
              props: {},
              placeholder: '字段',
            },
            label: {
              title: '',
              type: 'string',
              className: 'frg-options-input',
              props: {},
              placeholder: '名称',
            },
          },
        },
        props: {
          hideMove: true,
          hideCopy: true,
        },
      },
    },
  },
  {
    text: 'HTML',
    name: 'html',
    schema: {
      title: 'HTML',
      type: 'string',
      widget: 'html',
      readOnlyWidget: 'ReadOnlyWidget'
    },
    setting: {
      props: {
        type: 'object',
        properties: {
          value: {
            title: '展示内容',
            type: 'string',
          },
        },
      },
    },
  },
  {
    text: 'JSON编辑器',
    name: 'JsonEditor',
    schema: {
      title: 'JSON编辑器',
      type: 'string',
      widget: 'JsonEditor',
      readOnlyWidget: 'ReadOnlyWidget'
    },
    setting: {
      props: {
        type: 'object',
        properties: {
          value: {
            title: '展示内容',
            type: 'string',
          },
        },
      },
    },
  },
  {
    text: '日期范围',
    name: 'dateRange',
    schema: {
      title: '日期范围',
      type: 'range',
      format: 'dateTime',
      readOnlyWidget: 'ReadOnlyWidget',
      props: {
        placeholder: ['开始时间', '结束时间'],
      },
    },
    setting: {
      format: {
        title: '类型',
        type: 'string',
        enum: ['dateTime', 'date'],
        enumNames: ['日期时间', '日期'],
      },
    },
  },
  // {
  //   text: '分割线',
  //   name: 'Divider',
  //   schema: {
  //     type: 'block',
  //     widget: 'Divider',
  //   },
  // },
];

export const businessWidgets = [
  {
    text: '请求地址',
    name: 'HttpURLInput',
    schema: {
      title: '请求地址',
      type: 'array',
      widget: 'HttpURLInput',
      readOnlyWidget: 'HttpURLInput'
    },
    setting: {
      props: {
        title: '表单属性',
        type: 'object',
        labelWidth: 80,
        properties: {
          placeholder: {
            title: '占位符',
            type: 'string',
          },
          allowClear: {
            title: '是否带清除按钮',
            description: '填写内容后才会出现x哦',
            type: 'boolean',
          }
        },
      }
    },
  }, {
  text: '级联选择',
  name: 'Cascader',
  schema: {
    title: '级联选择',
    type: 'array',
    items: {
      type: 'string',
    },
    widget: 'Cascader',
    readOnlyWidget: 'Cascader'
  },
  setting: {
    default: {
      title: '默认值',
      type: 'array',
      widget: 'jsonInput',
    },
    optionsType: {
      title: '选项类型',
      type: 'string',
      widget: 'radio',
      default: 'customOptions',
      enum: ['customOptions', 'inputFields'],
      enumNames: ['自定义', '输入字段'],
    },
    options: {
      title: '选项',
      type: 'array',
      hidden: '{{rootValue.optionsType !== "customOptions"}}',
      widget: 'simpleList',
      className: 'frg-options-list',
      items: {
        type: 'object',
        properties: {
          value: {
            title: '',
            type: 'string',
            className: 'frg-options-input',
            props: {},
            placeholder: '字段',
          },
          label: {
            title: '',
            type: 'string',
            className: 'frg-options-input',
            props: {},
            placeholder: '名称',
          },
        },
      },
      props: {
        hideMove: true,
        hideCopy: true,
      }
    },
  }
}, {
  text: 'Webhook',
  name: 'Webhook',
  schema: {
    title: 'Webhook',
    type: 'object',
    widget: 'Webhook',
    readOnlyWidget: 'Webhook'
  }
}, {
  text: '脚本编辑器',
  name: 'CodeEditor',
  schema: {
    title: '脚本编辑器',
    type: 'string',
    widget: 'CodeEditor',
    readOnlyWidget: 'CodeEditor'
  },
  setting: {
    isFixedType: {
      title: '固定脚本类型',
      type: 'boolean',
      widget: 'switch',
      default: true
    },
    codeType: {
      title: '脚本类型',
      type: 'string',
      widget: 'select',
      default: 'JAVA',
      hidden: '{{rootValue.isFixedType === false}}',
      enum: ['SQL', 'JAVA', 'SHELL', 'PYTHON', 'GROOVY', 'JAVASCRIPT'],
      enumNames: ['SQL', 'JAVA', 'SHELL', 'PYTHON', 'GROOVY', 'JAVASCRIPT'],
    },
  }
}, {
  text: '规则编辑器',
  name: 'RuleEditor',
  schema: {
    title: '规则编辑器',
    type: 'object',
    widget: 'RuleEditor',
    readOnlyWidget: 'RuleEditor'
  },
}, {
  text: '连接字段',
  name: 'JoinFields',
  schema: {
    title: '连接字段',
    type: 'array',
    widget: 'JoinFields',
    readOnlyWidget: 'JoinFields'
  },
}, {
  text: '表格字段',
  name: 'TableFields',
  schema: {
    title: '表格字段',
    type: 'array',
    widget: 'TableFields',
    readOnlyWidget: 'TableFields'
  },
  setting: {
    codeTitle: {
      title: '标识标题',
      type: 'string',
      placeholder: '请输入'
    },
    valueTitle: {
      title: '值标题',
      type: 'string',
      placeholder: '请输入'
    },
  }
}, {
  text: '聚合变量',
  name: 'AggregateVariables',
  schema: {
    title: '聚合变量',
    type: 'array',
    widget: 'AggregateVariables',
    readOnlyWidget: 'AggregateVariables'
  },
  setting: {
    dependencies: {
      title: '变量类型',
      type: 'string',
      placeholder: '请输入变量类型字段的ID'
    },
    parentField: {
      title: '父字段',
      type: 'string',
      placeholder: '请输入父字段的ID'
    },
  }
}, {
  text: '参数映射',
  name: 'QueryParams',
  schema: {
    title: '参数映射',
    type: 'array',
    widget: 'QueryParams',
    readOnlyWidget: 'QueryParams'
  }
},
//   {
//   text: '个性单选框',
//   name: 'CustomRadio',
//   schema: {
//     title: '个性单选框',
//     type: 'string',
//     widget: 'CustomRadio',
//     readOnlyWidget: 'CustomRadio'
//   },
//   setting: {
//     options: {
//       title: '选项',
//       type: 'array',
//       widget: 'simpleList',
//       className: 'frg-options-list',
//       items: {
//         type: 'object',
//         properties: {
//           value: {
//             title: '',
//             type: 'string',
//             className: 'frg-options-input',
//             props: {},
//             placeholder: '字段',
//           },
//           label: {
//             title: '',
//             type: 'string',
//             className: 'frg-options-input',
//             props: {},
//             placeholder: '名称',
//           },
//           description: {
//             title: '',
//             type: 'string',
//             className: 'frg-options-input',
//             props: {},
//             placeholder: '描述',
//           },
//         },
//       },
//       props: {
//         hideMove: true,
//         hideCopy: true,
//       }
//     },
//   }
// },
  {
  text: '条件设置',
  name: 'BranchConfig',
  schema: {
    title: '条件设置',
    type: 'array',
    widget: 'BranchConfig',
    readOnlyWidget: 'BranchConfig'
  },
}, {
  text: '映射字段',
  name: 'FieldMapping',
  schema: {
    title: '映射字段',
    type: 'array',
    widget: 'FieldMapping',
    readOnlyWidget: 'FieldMapping'
  },
  setting: {
    tableName: {
      title: '表名称',
      type: 'string',
      placeholder: '请输入表名称字段的ID'
    },
    dependencies: {
      title: '数据源',
      type: 'string',
      placeholder: '请输入数据源字段的ID'
    },
  }
},
//   {
//   text: 'Webhook输入框',
//   name: 'WebhookInput',
//   schema: {
//     title: 'Webhook输入框',
//     type: 'string',
//     widget: 'WebhookInput',
//     readOnlyWidget: 'WebhookInput'
//   },
//   setting: {
//     minLength: {
//       title: '最小字符数',
//       type: 'number',
//       default: 4
//     }
//   }
// },
  {
  text: '选择HttpApi',
  name: 'HttpApiSelect',
  schema: {
    title: '选择HttpApi',
    type: 'number',
    widget: 'HttpApiSelect',
    readOnlyWidget: 'HttpApiSelect'
  },
  setting: {
    showAddButton: {
      title: '是否显示添加按钮',
      type: 'boolean',
      widget: 'switch',
      default: true
    },
    showEditButton: {
      title: '是否显示编辑按钮',
      type: 'boolean',
      widget: 'switch',
      default: true
    },
  }
}, {
  text: '变量配置',
  name: 'VariableConfig',
  schema: {
    title: '变量配置',
    type: 'array',
    widget: 'VariableConfig',
    readOnlyWidget: 'VariableConfig'
  },
  setting: {
    parentField: {
      title: '父字段',
      type: 'string',
      placeholder: '请输入父字段的ID'
    },
    dependencies: {
      title: '数据源',
      type: 'string',
      placeholder: '请输入数据源字段的ID'
    },
  }
},
//   {
//   text: '数据集',
//   name: 'DataTableSelect',
//   schema: {
//     title: '数据集',
//     type: 'string',
//     widget: 'DataTableSelect',
//     readOnlyWidget: 'DataTableSelect'
//   },
//   setting: {
//     dependencies: {
//       title: '数据源',
//       type: 'string',
//       placeholder: '请输入数据源字段的ID'
//     },
//     dbType: {
//       title: '数据类型',
//       type: 'string',
//       placeholder: '请输入数据类型'
//     },
//     showAddButton: {
//       title: '是否显示添加按钮',
//       type: 'boolean',
//       widget: 'switch',
//       default: true
//     },
//     showEditButton: {
//       title: '是否显示编辑按钮',
//       type: 'boolean',
//       widget: 'switch',
//       default: true
//     },
//   }
// },
  {
  text: '输入字段表格',
  name: 'InputFieldTable',
  schema: {
    title: '输入字段表格',
    type: 'array',
    widget: 'InputFieldTable',
    readOnlyWidget: 'InputFieldTable'
  },
}, {
  text: '输入字段',
  name: 'InputFieldSelect',
  schema: {
    title: '输入字段',
    type: 'array',
    widget: 'InputFieldSelect',
    readOnlyWidget: 'InputFieldSelect'
  },
  setting: {
    dependencies: {
      title: '父字段',
      type: 'string',
      placeholder: '请输入父字段的ID'
    },
    filterProps: {
      title: '过滤属性',
      type: 'object',
      widget: 'jsonInput',
      placeholder: '请输入过滤属性'
    },
  }
}, {
  text: '聚合字段',
  name: 'InputFieldSelect2',
  schema: {
    title: '输入字段',
    type: 'array',
    widget: 'InputFieldSelect2',
    readOnlyWidget: 'InputFieldSelect2'
  },
  setting: {
    dependencies: {
      title: '父字段',
      type: 'string',
      placeholder: '请输入父字段的ID'
    },
    dataType: {
      enum: ['payload', 'list'],
      enumNames: ['Payload', '列表'],
      title: '字段类型',
      type: 'string',
      widget: 'radio',
      default: 'payload'
    },
  }
}, {
  text: '凭据',
  name: 'CredentialSelect',
  schema: {
    title: '凭据',
    type: 'number',
    widget: 'CredentialSelect',
    readOnlyWidget: 'CredentialSelect'
  },
  setting: {
    parentField: {
      title: '父字段',
      type: 'string',
      placeholder: '请输入父字段的ID'
    },
    dbType: {
      title: '数据类型',
      type: 'string',
      placeholder: '请输入数据类型'
    },
    params: {
      title: '请求参数',
      type: 'object',
      widget: 'jsonInput',
      placeholder: '请输入请求参数'
    },
    showAddButton: {
      title: '是否显示添加按钮',
      type: 'boolean',
      widget: 'switch',
      default: true
    },
    showEditButton: {
      title: '是否显示编辑按钮',
      type: 'boolean',
      widget: 'switch',
      default: true
    },
  }
}, {
  text: '字段映射',
  name: 'FieldMappingTable',
  schema: {
    title: '字段映射',
    type: 'array',
    widget: 'FieldMappingTable',
    readOnlyWidget: 'FieldMappingTable'
  },
  setting: {
    tableName: {
      title: '表名称',
      type: 'string',
      placeholder: '请输入表名称的ID'
    },
    dependencies: {
      title: '数据源',
      type: 'string',
      placeholder: '请输入数据源字段的ID'
    },
    queryName: {
      title: '查询字段',
      type: 'string',
      placeholder: '请输入查询字段'
    },
    columns: {
      title: '选项',
      type: 'array',
      widget: 'simpleList',
      className: 'frg-options-list',
      items: {
        type: 'object',
        properties: {
          width: {
            title: '',
            type: 'string',
            className: 'frg-options-input',
            props: {},
            placeholder: '宽度',
          },
          title: {
            title: '',
            type: 'string',
            className: 'frg-options-input',
            props: {},
            placeholder: '标题',
          },
          dataIndex: {
            title: '',
            type: 'string',
            className: 'frg-options-input',
            props: {},
            placeholder: '字段索引',
          },
          isView: {
            title: '仅展示',
            type: 'boolean',
            className: 'frg-options-input',
            style: {marginLeft: 6},
            props: {},
          },
        },
      },
      default: [
        {
          width: '50%',
          title: '表字段',
          dataIndex: 'name',
        },
        {
          width: '50%',
          title: '映射字段',
          dataIndex: 'code',
        },
      ],
      props: {
        hideMove: true,
        hideCopy: true,
      }
    },
  }
},
//   {
//   text: 'HttpApi映射',
//   name: 'HttpApiFieldMappingTable',
//   schema: {
//     title: 'HttpApi映射',
//     type: 'array',
//     widget: 'HttpApiFieldMappingTable',
//     readOnlyWidget: 'HttpApiFieldMappingTable'
//   },
// },
  {
    text: '鉴权方式',
    name: 'AuthSelect',
    schema: {
      title: '鉴权方式',
      type: 'string',
      widget: 'AuthSelect',
      readOnlyWidget: 'AuthSelect'
    },
}, {
    text: 'HTTP请求',
    name: 'HttpRequest',
    schema: {
      title: 'HTTP请求',
      type: 'array',
      widget: 'HttpRequest',
      readOnlyWidget: 'HttpRequest'
    },
    setting: {
      isSelect: {
        title: '是否选择字段',
        type: 'boolean',
        widget: 'switch',
        default: true
      },
      dependencies: {
        title: 'URL组件',
        type: 'string',
        placeholder: '请输入URL组件字段的ID'
      }
    }
}];

export const commonSettings = {
  $id: {
    title: 'ID',
    description: '字段名称/英文',
    type: 'string',
    widget: 'idInput',
    require: true,
    rules: [
      {
        pattern: '^#/.+$',
        message: 'ID 必填',
      },
    ],
  },
  title: {
    title: '标题',
    type: 'string',
    widget: 'htmlInput',
  },
  description: {
    title: '说明',
    type: 'string',
  },
  default: {
    title: '默认值',
    type: 'string',
  },
  required: {
    title: '必填',
    type: 'boolean',
    default: true,
  },
  dependencies: {
    title: '关联字段',
    type: 'string',
  },
  // min: {
  //   title: '最小值',
  //   type: 'number',
  // },
  // max: {
  //   title: '最大值',
  //   type: 'number',
  // },
  disabled: {
    title: '禁用',
    type: 'boolean',
  },
  readOnly: {
    title: '只读',
    type: 'boolean',
  },
  // hidden: {
  //   title: '隐藏',
  //   type: 'boolean',
  // },
  // readOnlyWidget: {
  //   title: '只读组件',
  //   type: 'string',
  // },
  width: {
    title: '元素宽度',
    type: 'string',
    widget: 'percentSlider',
  },
  labelWidth: {
    title: '标签宽度',
    description: '默认值120',
    type: 'number',
    widget: 'slider',
    max: 400,
    props: {
      hideNumber: true,
    },
  },

  widgetRules: {
    title: '表单联动规则',
    type: 'array',
    widget: 'WidgetRules'
  }
};

export const globalSettings = {
  type: 'object',
  properties: {
    formWidth: {
      title: '表单宽度',
      type: 'number',
      max: 700,
      min: 360,
      default: 420,
      props: {
        placeholder: '请输入',
      },
    },
    isFixedWidth: {
      title: '固定宽度',
      type: 'boolean',
      widget: 'switch',
      default: false
    },
    formMinWidth: {
      title: '表单最小宽度',
      type: 'number',
      default: 360
    },
    formMaxWidth: {
      title: '表单最大宽度',
      type: 'number',
      default: 700
    },
  },
};

export default [
  {
    title: '基础组件',
    widgets: baseWidgets,
  },
  {
    title: '业务组件',
    widgets: businessWidgets,
  },
]
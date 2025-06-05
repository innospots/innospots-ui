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

export default [
  {
    path: '/login',
    layout: false,
    name: 'login',
    component: './Login'
  },
  {
    path: '/403',
    layout: false,
    name: '403',
    component: './403'
  },
  {
    path: '/oauth/callback',
    layout: false,
    name: 'oauth-callback',
    component: './AuthResult/Callback'
  },
  {
    path: '/add/locale',
    layout: false,
    name: 'add-locale',
    component: './AddLocale'
  },
  {
    path: '/oauth-result',
    name: 'oauth-result',
    component: '@/layouts/FullScreenLayout',
    routes: [
      {
        path: '/oauth-result',
        name: 'oauth-result',
        component: './AuthResult'
      }
    ]
  },
  {
    path: '/metadata/credential/schema',
    name: 'schema',
    icon: 'smile',
    component: '@/layouts/FullScreenLayout',
    routes: [
      {
        path: '/metadata/credential/schema',
        name: 'schema',
        icon: 'smile',
        component: './Metadata/Credential/Schema'
      }
    ]
  },
  {
    path: '/app/editor',
    name: 'appEditor',
    icon: 'smile',
    component: '@/layouts/FullScreenLayout',
    routes: [
      {
        path: '/app/editor/:appKey/key',
        name: 'appEditor1',
        icon: 'smile',
        component: './App/Editor'
      }
    ]
  },
  {
    path: '/app/page',
    name: 'appPage',
    icon: 'smile',
    component: '@/layouts/FullScreenLayout',
    routes: [
      {
        path: '/app/page/:pageType/*',
        name: 'appPageInfo',
        icon: 'smile',
        component: './App/Page'
      },
    ]
  },
  {
    path: '/workflow/node-editor',
    name: 'nodeEditor',
    icon: 'smile',
    component: '@/layouts/FullScreenLayout',
    routes: [
      {
        path: '/workflow/node-editor/:nodeId',
        name: 'nodeEditor',
        icon: 'smile',
        component: './Workflow/NodeEditor'
      }
    ]
  },
  {
    path: '/approve/page',
    name: 'approvePage',
    icon: 'smile',
    component: '@/layouts/FullScreenLayout',
    routes: [
      {
        path: '/approve/page/:pageType/:appKey',
        name: 'approveFormPage',
        icon: 'smile',
        component: './Approve/Page'
      }
    ]
  },
  {
    path: '/approve-audit/page',
    name: 'approveAuditPage',
    icon: 'smile',
    component: '@/layouts/FullScreenLayout',
    routes: [
      {
        path: '/approve-audit/page/:pageType/:appKey',
        name: 'approveAuditFormPage',
        icon: 'smile',
        component: './ApproveAudit/Page'
      }
    ]
  },
  {
    path: '/workflow/:workflowType/builder',
    name: 'workflowBuilder',
    component: '@/layouts/FullScreenLayout',
    routes: [
      {
        path: '/workflow/:workflowType/builder',
        icon: 'smile',
        component: './Workflow/Builder',
      },
    ]
  },
  {
    path: '/',
    component: '@/layouts/SeniorLayout',
    routes: [
      {
        path: '/apps-embed/show/:appType/:appKey',
        name: 'appEmbedPageInfo',
        icon: 'smile',
        component: './AppEmbed/Show'
      },
      {
        path: '/system',
        routes: [
          {
            path: '/system/login-logs',
            name: 'login-logs',
            icon: 'crown',
            parentKeys: ['libra-system', 'libra-logger'],
            component: './System/LoginLogs'
          }, {
            path: '/system/operation-logs',
            name: 'operation-logs',
            icon: 'crown',
            parentKeys: ['libra-system', 'libra-logger'],
            component: './System/OperationLogs'
          },
          {
            path: '/system/notification',
            name: 'notification',
            icon: 'crown',
            routes: [
              {
                path: '/system/notification/channel-assignment',
                name: 'channel-assignment',
                icon: 'crown',
                component: './System/ChannelAssignment'
              },
              {
                path: '/system/notification/channel',
                name: 'channel',
                icon: 'crown',
                component: './System/Channel'
              }
            ]
          },
          {
            path: '/system/users',
            name: 'users',
            icon: 'crown',
            // access: 'canAdmin',
            component: './System/Users'
          },
          {
            path: '/system/roles',
            name: 'roles',
            component: './System/Roles'
          },
          {
            path: '/system/user-group',
            name: 'user-group',
            component: './System/UserGroup'
          },
          {
            path: '/system/dictionary',
            name: 'system-dictionary',
            component: './System/SysDictionary'
          }
        ]
      },
      {
        path: '/metadata',
        routes: [
          {
            path: '/metadata/data-source',
            name: 'data-source',
            icon: 'smile',
            component: './Metadata/DataSource'
          },
          {
            path: '/metadata/credential',
            name: 'credential',
            icon: 'smile',
            component: './Metadata/Credential'
          },
          {
            path: '/metadata/credential-type',
            name: 'credential-type',
            icon: 'smile',
            component: './Metadata/CredentialType'
          },
          {
            path: '/metadata/http-api',
            name: 'http-api',
            icon: 'smile',
            component: './Metadata/HttpApi'
          },
          {
            path: '/metadata/dataset',
            name: 'dataset',
            icon: 'smile',
            component: './Metadata/Dataset'
          }
        ]
      },
      {
        path: '/extension',
        routes: [
          {
            path: '/extension/installed',
            name: 'list',
            icon: 'smile',
            component: './Extension/Installed'
          }
        ]
      },
      {
        path: '/extension-store',
        // path: '/appstore',
        name: 'extension-store',
        icon: 'smile',
        component: './Extension/Store'
      },
      {
        path: '/app',
        name: 'app',
        icon: 'smile',
        component: './App'
      },
      {
        path: '/approve',
        name: 'approve',
        icon: 'smile',
        component: './Approve'
      },
      {
        path: '/approve-list',
        name: 'approve-list',
        icon: 'smile',
        component: './Approve/List/index'
      },
      {
        path: '/approve-audit',
        name: 'approve-audit',
        icon: 'smile',
        component: './ApproveAudit'
      },
      {
        path: '/audit-records',
        name: 'audit-records',
        icon: 'smile',
        component: './AuditRecords'
      },
      {
        path: '/config',
        routes: [
          {
            path: '/config/rbac',
            name: 'rbac',
            icon: 'smile',
            component: './Config/RBAC'
          },
          {
            path: '/config/menus',
            name: 'menus',
            icon: 'smile',
            component: './Config/Menus'
          },
          {
            path: '/config/languages',
            name: 'languages',
            icon: 'smile',
            component: './Config/Languages'
          },
          {
            path: '/config/currencies',
            name: 'currencies',
            icon: 'smile',
            component: './Config/Currencies'
          },
          {
            path: '/config/system',
            name: 'system',
            icon: 'smile',
            component: './Config/System'
          },
          {
            path: '/config/translations',
            name: 'translation',
            icon: 'smile',
            component: './Config/Translations'
          }
        ]
      },
      {
        path: '/pages',
        name: 'pages',
        icon: 'smile',
        component: './Pages'
      },
      {
        path: '/tasks',
        name: 'tasks',
        icon: 'smile',
        component: './Tasks'
      },
      {
        path: '/instances',
        routes: [
          {
            path: '/instances',
            name: 'instances',
            icon: 'smile',
            component: './Instances'
          },
          {
            path: '/instances/index/detail',
            icon: 'smile',
            component: './Instances/Preview',
          },
        ]
      },
      {
        path: '/node-definition',
        name: 'workflow-nodes',
        icon: 'smile',
        component: './Workflow/Nodes'
      },
      {
        path: '/workflow',
        routes: [
          {
            path: '/workflow/:workflowType',
            name: 'workflow',
            icon: 'smile',
            component: './Workflow/Index'
          },
          {
            path: '/workflow/:workflowType/detail',
            icon: 'smile',
            component: './Workflow/Preview',
          },
          {
            path: '/workflow/:workflowType/record',
            icon: 'smile',
            component: './Workflow/Preview/Record',
          },
        ]
      },
      {
        path: '/schedule',
        routes: [
          {
            path: '/schedule/schedule-config',
            name: 'schedule-config',
            icon: 'schedule',
            component: './Schedule/ScheduleJob'
          },
          {
            path: '/schedule/schedule-queue',
            name: 'schedule-queue',
            icon: 'schedule',
            component: './Schedule/JobQueue'
          },
          {
            path: '/schedule/execution',
            name: 'execution',
            icon: 'schedule',
            component: './Schedule/JobExecution'
          },
          {
            path: '/schedule/execution/detail/:executionId',
            name: 'execution-detail',
            icon: 'schedule',
            component: './Schedule/JobExecution/Detail'
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: '@/layouts/SeniorLayout',
    routes: [
      {
        path: '/*',
        component: './404'
      }
    ]
  }
];

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
    path: '/app/builder',
    name: 'appBuilder',
    icon: 'smile',
    component: '@/layouts/FullScreenLayout',
    routes: [
      {
        path: '/app/builder/:nodeId',
        name: 'appBuilder',
        icon: 'smile',
        component: './App/Builder'
      }
    ]
  },
  {
    path: '/',
    component: '@/layouts/BasicLayout',
    routes: [
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
        path: '/appstore',
        name: 'appstore',
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
        path: '/workflow',
        routes: [
          {
            path: '/workflow/index',
            name: 'workflow',
            icon: 'smile',
            component: './Workflow/Index'
          },
          {
            path: '/workflow/index/detail',
            icon: 'smile',
            component: './Workflow/Preview',
          },
          {
            path: '/workflow/index/record',
            icon: 'smile',
            component: './Workflow/Preview/Record',
          },
          {
            path: '/workflow/builder',
            icon: 'smile',
            component: './Workflow/Builder',
          },
        ]
      },
      {
        component: './404'
      }
    ]
  },
  {
    component: './404'
  }
];

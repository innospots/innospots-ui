
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

const NODE_NAME_SCHEMA = {
  displayName: {
    type: 'string',
    title: '节点名称',
    required: true,
    isDefault: true,
    readOnlyWidget: 'ReadOnlyWidget',
    props: {
      placeholder: '请输入节点名称'
    }
  }
};

const HTTP_ADDRESS_SCHEMA = {
  address: {
    type: 'string',
    title: '请求地址',
    required: true,
    isDefault: true,
    readOnlyWidget: 'ReadOnlyWidget',
    props: {
      placeholder: '请输入请求地址'
    }
  }
};

const HTTP_URL_SCHEMA = {
  address: {
    type: 'array',
    title: '请求地址',
    required: true,
    isDefault: true,
    widget: 'HttpURLInput',
    readOnlyWidget: 'HttpURLInput',
    props: {
      placeholder: '请输入请求地址'
    }
  }
};

const REQUEST_METHOD_SCHEMA = {
  method: {
    type: 'string',
    title: '请求方式',
    required: true,
    isDefault: true,
    showAddButton: true,
    showEditButton: true,
    widget: 'Select',
    readOnlyWidget: 'Select',
    optionsType: 'customOptions',
    options: [{
      value: 'GET',
      label: 'GET'
    }, {
      value: 'POST',
      label: 'POST'
    }]
  }
};

const AUTH_METHOD_SCHEMA = {
  auth_type: {
    type: 'string',
    title: '鉴权方式',
    required: true,
    // isDefault: true,
    widget: 'AuthSelect',
    readOnlyWidget: 'AuthSelect',
    props: {
      placeholder: '请选择鉴权方式'
    }
  }
};

const CREDENTIAL_SCHEMA = {
  credential: {
    type: 'number',
    title: '凭据',
    required: true,
    // isDefault: true,
    showAddButton: true,
    showEditButton: true,
    widget: 'CredentialSelect',
    readOnlyWidget: 'CredentialSelect'
  }
};

const DEFAULT_APP_SCHEMA = {
  ...NODE_NAME_SCHEMA
};

export const DEFAULT_SCHEMA = {
  MYSQL: {
    ...NODE_NAME_SCHEMA,
    ...CREDENTIAL_SCHEMA
  },
  Http: {
    ...NODE_NAME_SCHEMA,
    ...AUTH_METHOD_SCHEMA,
    ...CREDENTIAL_SCHEMA,
    ...HTTP_URL_SCHEMA,
  },
  KAFKA: {
    ...NODE_NAME_SCHEMA,
    ...CREDENTIAL_SCHEMA
  }
}

export const DEFAULT_TRIGGER_SCHEMA = {
  Http: {
    ...NODE_NAME_SCHEMA,
    ...REQUEST_METHOD_SCHEMA,
    ...HTTP_ADDRESS_SCHEMA,
  }
}

export default (appType: string, isTrigger: boolean) => {
  const schemas = isTrigger ? DEFAULT_TRIGGER_SCHEMA : DEFAULT_SCHEMA;
  const schema = schemas[appType] || DEFAULT_SCHEMA[appType] || DEFAULT_APP_SCHEMA;
  return {
    type: 'object',
    properties: {
      ...schema
    },
    formWidth: 420,
    formMinWidth: 360,
    formMaxWidth: 700,
    isFixedWidth: false
  }
}
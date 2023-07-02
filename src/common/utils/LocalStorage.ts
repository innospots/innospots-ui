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

import { LOCAL_DATA_KEY } from '@/common/constants';

const get = (key?: string): any => {
  let ls = {};

  if (window.localStorage) {
    try {
      ls = JSON.parse(<string>window.localStorage.getItem(LOCAL_DATA_KEY)) || {};
    } catch (e) {}
  }

  return key ? ls[key] : ls;
};

const set = (key: string, value: any) => {
  if (window.localStorage) {
    const data = get();
    data[key] = value;

    if (value === null) {
      delete data[key];
    }

    window.localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data));
  }
};

const remove = (key: string) => {
  set(key, null);
};

export default {
  get,
  set,
  remove,
};

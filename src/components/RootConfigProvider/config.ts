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

import moment from 'moment';
import 'moment/locale/zh-cn';

import { getFormattedLocale } from '@/common/utils';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';

const [, , c] = getFormattedLocale();
const locale = {
  zh: zhCN,
  en: enUS,
};

moment.locale(c);

export default {
  prefixCls: 'polaris',
  locale: locale[c],
  theme: {
    primaryColor: '#1245fa',
    primaryColorHover: '#0432D7',
  },
  dropdownMatchSelectWidth: true,
};

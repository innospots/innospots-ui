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

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import _ from 'lodash';

import { WEEKDAY } from '@/common/constants';

import { fetchLocaleModule } from '@/services/I18n';

import { getFormattedLocale } from './';

const [formatLocale, , lng] = getFormattedLocale();

const fallbackLng = 'en';

const i18nIns = i18next.createInstance();

i18nIns
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng,
    fallbackLng,
    keySeparator: '|',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

i18nIns.services.formatter?.add('formatWeek', (value, lng, options) => {
  const list = WEEKDAY[lng || fallbackLng];
  const ls = _.map((value || '').split(','), (i) => list[i]);
  return ls.join('，');
});

const moduleCache = {};
const resolves = {};

export const getI18nByModule = (module: string | string[] = 'common') => {
  return new Promise(async (resolve) => {
    const loadModule = (m: string) =>
      new Promise(async (innerResolve) => {
        let localeData;
        const key = [formatLocale, m].join('_');

        resolves[key] = resolves[key] || [];
        resolves[key].push(innerResolve);

        if (moduleCache[key] !== 'loading') {
          if (moduleCache[key]) {
            localeData = moduleCache[key];
          } else {
            moduleCache[key] = 'loading';

            localeData = await fetchLocaleModule(formatLocale, m);

            moduleCache[key] = localeData;

            // const ns = m === 'common' ? 'translation' : m;
            const ns = 'translation';

            i18nIns.addResources(lng, ns, localeData);
          }

          for (let i = 0; i < resolves[key]?.length; ++i) {
            resolves[key][i](localeData);
          }
        }
      });

    const loadModules = [];

    if (!_.isArray(module)) {
      module = [module];
    }
    for (let i = 0; i < module.length; ++i) {
      // @ts-ignore
      loadModules.push(loadModule(module[i]));
    }

    Promise.all(loadModules)
      .then(() => {
        resolve(i18nIns);
      })
      .catch(() => {
        resolve(i18nIns);
      });
  });
};

export default i18nIns;

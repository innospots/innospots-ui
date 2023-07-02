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

import React, { useEffect, useState, useMemo } from 'react';
import _ from 'lodash';
import Cookies from 'js-cookie';
import { Dropdown, Menu, Space, Row, Col } from 'antd';
import { useRequest } from 'ahooks';
import { setLocale } from 'umi';

import * as Service from '@/services/I18n';
import { getFormattedLocale } from '@/common/utils';

import { Languages } from '@/common/types/Types';
import FlagIcon from '@/components/Icons/FlagIcon';
import InnoIcon from '@/components/Icons/InnoIcon';

import styles from './style.less';

const LanguageSelector: React.FC = () => {
  const [languages, setLanguages] = useState<Languages>([]);

  const languagesRequest = useRequest(Service.fetchLanguageList, {
    manual: true,
  });

  const localeSwitchRequest = useRequest(Service.localeSwitch, {
    manual: true,
    onSuccess: (result, [locale]) => {
      if (result) {
        setLocale(locale);
      }
    },
  });

  const [currentLocale, , , currentFlagCode] = getFormattedLocale();

  useEffect(() => {
    fetchLanguages();
    currentLocale && Cookies.set('lang', currentLocale);
  }, []);

  const onLanguageClick = ({ key }) => {
    localeSwitchRequest.run(key);
  };

  const languageMenu = useMemo(() => {
    return {
      items: _.map(languages, (item) => {
        const [, , , flagCode] = getFormattedLocale(item.locale);
        return {
          key: item.locale,
          icon: <FlagIcon code={flagCode} />,
          label: <span style={{paddingLeft: 8}}>{item.name}</span>
        };
      }),
      selectedKeys: [currentLocale],
      onClick: onLanguageClick
    }
  }, [languages, currentLocale]);

  const selectedLanguage = useMemo(() => {
    const langItem = _.find(languages, (item) => currentLocale === item.locale);
    return (
      <div className="header-action">
        <Row justify="space-between" gutter={8}>
          <Col>
            <Space>
              <FlagIcon code={currentFlagCode} />
              <span>{langItem?.name}</span>
            </Space>
          </Col>
          <Col>
            <span style={{ color: '#C9CDD4' }}>
              <InnoIcon size={14} type="chevron-down" />
            </span>
          </Col>
        </Row>
      </div>
    );
  }, [languages, currentLocale]);

  const fetchLanguages = async () => {
    const list = await languagesRequest.runAsync({
      dataStatus: 'ONLINE',
    });

    // @ts-ignore
    setLanguages(list || []);
  };

  return (
    <div className={styles.languageSelector}>
      <Dropdown overlay={(
        <Menu { ...languageMenu } />
      )} menu={languageMenu}>{selectedLanguage}</Dropdown>
    </div>
  );
};

export default LanguageSelector;

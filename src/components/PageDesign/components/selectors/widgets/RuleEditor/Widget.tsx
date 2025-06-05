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

import React, { useRef, useEffect, useMemo, useState, useContext, useCallback, forwardRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi'
import { useControllableValue } from 'ahooks';

import { RuleForm } from '@/components/Rule';

import useI18n from '@/common/hooks/useI18n';
import type { WidgetItemType } from '@/models/AppEditor'
import { getOperatorData, getStatementString } from '@/components/Rule/util';

import RuleExtendConfig from './extend';

import { WidgetContext } from '../../WidgetProvider';

import styles from './index.less';
import widgetStyles from '../../style.less';

const RuleEditor:React.FC<WidgetItemType> = forwardRef(({ settings = {}, widgetType, ...rest }, ref) => {
  const ruleFormRef = useRef(null);
  const { getOptionsByFieldSource } = useModel('AppData', (model) => ({
    getOptionsByFieldSource: model.getOptionsByFieldSource,
  }));

  const { fieldSource } = settings
  const [mounted, setMounted] = useState(false);
  const [curRuleListData, setCurRuleListData] = useState();
  const [extendVisible, setExtendVisible] = useState(false);

  const [curValue, setCurValue] = useControllableValue(rest);

  const isConfig = true;
  const readOnly = widgetType === 'view';

  const { t } = useI18n(['workflow', 'common']);

  useEffect(() => {
    setTimeout(() => setMounted(true), 500);
  }, []);

  const { size } = useContext(WidgetContext);

  const formatedInputFields = useMemo(() => getOptionsByFieldSource(fieldSource), [ fieldSource, getOptionsByFieldSource ])

  const containerStyle = useMemo(() => {
    const height = size?.height;
    return {
      height: height ? height - 40 : 40,
    };
  }, [size]);

  const initRuleListData = useMemo(() => {
    if (!curValue) return undefined;

    const ruleData = {
      relation: curValue.relation,
      children: [],
    };

    ruleData.children = _.map(curValue.embeds, (embed) => ({
      relation: embed.relation,
      children: _.map(embed.factors, (factor) => ({
        field: {
          title: factor.name,
          value: factor.code,
          nodeKey: factor.nodeKey,
          dataType: factor.valueType,
        },
        term: {
          ...getOperatorData(factor.opt),
        },
        value: factor.value,
      })),
    }));

    return ruleData;
  }, [curValue]);

  const getFactorText = (factor) => {
    const optData = getOperatorData(factor.opt) || {};

    return (
      <div title={[factor.name, optData.label, factor.value].join(' ')}>
        <span>{factor.name}</span>
        <span className={styles.opt}>{optData.label}</span>
        <span>{factor.value}</span>
      </div>
    );
  };

  const getRuleView = useMemo(() => {
    const { embeds, relation } = curValue || {};

    if (!embeds) return <span>--</span>;

    return (
      <div className={cls(styles.ruleView, { [styles.multi]: embeds.length > 1 })}>
        <div className={cls(styles.identifier, styles[relation])}>
          <span>{t(`common.options.${relation}`)}</span>
        </div>
        <div className={styles.inner}>
          {_.map(embeds, (embed, index) => {
            const factors = embed.factors || [];
            const innerRelation = embed.relation;
            return (
              <div
                key={['embed', index].join('-')}
                className={cls(styles.ruleGroup, {
                  [styles.multi]: factors.length > 1,
                })}
              >
                <div className={cls(styles.identifier, styles[innerRelation])}>
                  <span>{t(`common.options.${innerRelation}`)}</span>
                </div>
                <ul className={styles.groupInner}>
                  {_.map(factors, (factor, index) => (
                    <li key={['factor', index].join('-')} className={styles.ruleItem}>
                      {getFactorText(factor)}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [curValue]);

  const formatConditions = (ruleListData) => {
    const totalStatements = [];
    const conditions = {
      embeds: [],
      relation: ruleListData.relation,
    };

    conditions.embeds = _.map(ruleListData.children, (item) => {
      const embedData = {
        relation: item.relation,
      };
      const statements = [];
      embedData.factors = _.map(item.children, (embed) => {
        const field = embed.field || {};
        const term = embed.term || {};
        const value = _.isUndefined(embed.value) || _.isNull(embed.value) ? '' : embed.value;

        statements.push(getStatementString(field.title, term, value));

        return {
          value,
          opt: term.value,
          name: field.title,
          code: field.value,
          nodeKey: field.nodeKey,
          valueType: field.dataType,
        };
      });

      embedData.statement = statements.join(
        embedData.relation.toLowerCase() === 'or' ? ' || ' : ' && ',
      );

      totalStatements.push(`(${embedData.statement})`);

      return embedData;
    });

    conditions.relation &&
      (conditions.statement = totalStatements.join(
        conditions.relation.toLowerCase() === 'or' ? ' || ' : ' && ',
      ));

    return conditions;
  };

  const handleRuleFormChange = useCallback((ruleListData) => {
    setCurRuleListData(ruleListData);
    setCurValue(formatConditions(ruleListData));
  }, []);

  const handleExtendShow = () => {
    setExtendVisible(true);
  };

  const handleExtendClose = () => {
    setExtendVisible(false);
  };

  const handleExtendSubmit = (ruleData) => {
    setCurRuleListData(ruleData);
    setExtendVisible(false);
    ruleFormRef.current.updateListData(ruleData);
  };

  const getRuleExtendConfig = () => {
    return (
      <RuleExtendConfig
        visible={extendVisible}
        initRules={curRuleListData}
        treeData={formatedInputFields}
        onCancel={handleExtendClose}
        onSubmit={handleExtendSubmit}
      />
    );
  };

  return (
    <div className={cls(widgetStyles.node, widgetStyles.input, 'editor-node-widget')}>
      <div className={widgetStyles.inner}>
        <div className={widgetStyles.formItem}>
          {
            !readOnly && (
              <div className={widgetStyles.expandBtn}>
                <span className="cur-btn" onClick={handleExtendShow}>
                  {t('workflow.conditions.button.expand')}
                </span>
              </div>
            )
          }
          <div className="custom-scrollbar" style={containerStyle}>
            {readOnly ? (
              <div className={styles.overview}>
                <div className={styles.content}>{getRuleView}</div>
              </div>
            ) : (
              <>
                <div className={styles.ruleForm}>
                  <div className={cls(styles.ruleWrap, 'custom-scrollbar')}>
                    {mounted && (
                      <RuleForm
                        hideGroupBtn
                        ref={ruleFormRef}
                        initRules={initRuleListData}
                        treeData={formatedInputFields}
                        onChange={handleRuleFormChange}
                      />
                    )}
                  </div>
                  <div className="cur-btn" onClick={() => ruleFormRef.current.addGroup()}>
                    <PlusOutlined />
                    <span>{t('workflow.conditions.button.add_group')}</span>
                  </div>
                </div>
                {isConfig && getRuleExtendConfig()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
})

export default RuleEditor;

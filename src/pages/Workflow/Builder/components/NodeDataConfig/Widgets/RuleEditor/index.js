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

import React, {useRef, useEffect, useMemo, useState, useContext, useCallback} from 'react';
import {FullscreenOutlined, PlusOutlined, SelectOutlined} from '@ant-design/icons';
import _ from 'lodash';
import {Row, Col} from 'antd';
import cls from 'classnames';
import {useControllableValue} from 'ahooks';

import {RuleForm} from '@/components/Rule';

import useI18n from '@/common/hooks/useI18n';
import FormContext from '../FormContext';
import CurContext from '../../../../common/context';
import {getOperatorData, getStatementString} from '@/components/Rule/util';

import RuleExtendConfig from './extend';

import styles from './index.less';

const RuleEditor = ({readOnly, ...rest}) => {
  const ruleFormRef = useRef(null);

  const {viewType} = useContext(FormContext);
  const [mounted, setMounted] = useState(false);
  const [curRuleListData, setCurRuleListData] = useState();
  const [extendVisible, setExtendVisible] = useState(false);

  const {inputFields} = useContext(CurContext);
  const [curValue, setCurValue] = useControllableValue(rest);

  const isConfig = viewType === 'config';

  const {t} = useI18n(['workflow', 'common']);

  useEffect(() => {
    setTimeout(() => setMounted(true), 500)
  }, []);

  const initRuleListData = useMemo(() => {
    if (!curValue) return undefined;

    const ruleData = {
      relation: curValue.relation, children: [],
    };

    ruleData.children = _.map(curValue.embeds, (embed) => ({
      relation: embed.relation, children: _.map(embed.factors, (factor) => ({
        field: {
          title: factor.name,
          value: factor.code,
          nodeKey: factor.nodeKey,
          dataType: factor.valueType,
        }, term: {
          ...getOperatorData(factor.opt),
        }, value: factor.value,
      })),
    }));

    return ruleData;
  }, [curValue]);

  const formatInputFields = useMemo(() => {
    return _.map(inputFields, (item) => {
      return {
        title: item.nodeName,
        value: item.nodeKey,
        children: _.map(item.fields, (field) => ({
          title: field.label,
          dataType: field.type,
          value: [item.nodeKey, field.value].join('$$'),
        })),
      };
    });
  }, [inputFields]);

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
    const {embeds, relation} = curValue || {};

    if (!embeds) return <span>--</span>;

    return (
      <div className={cls(styles.ruleView, {[styles.multi]: embeds.length > 1})}>
        <div className={cls(styles.identifier, styles[relation])}>
          <span>{t(`common.options.${relation}`)}</span>
        </div>
        <div className={styles.inner}>
          {_.map(embeds, (embed, index) => {
            const factors = embed.factors || [];
            const innerRelation = embed.relation;
            return (<div
                key={['embed', index].join('-')}
                className={cls(styles.ruleGroup, {
                  [styles.multi]: factors.length > 1,
                })}
              >
                <div className={cls(styles.identifier, styles[innerRelation])}>
                  <span>{t(`common.options.${innerRelation}`)}</span>
                </div>
                <ul className={styles.groupInner}>
                  {_.map(factors, (factor, index) => (<li
                      key={['factor', index].join('-')}
                      className={styles.ruleItem}
                    >
                      {getFactorText(factor)}
                    </li>))}
                </ul>
              </div>);
          })}
        </div>
      </div>
    );
  }, [curValue]);

  const handleRuleFormChange = useCallback((ruleListData) => {
    setCurRuleListData(ruleListData);
    setCurValue(formatConditions(ruleListData));
  }, []);

  const formatConditions = (ruleListData) => {
    const totalStatements = [];
    const conditions = {
      embeds: [], relation: ruleListData.relation,
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

      embedData.statement = statements.join(embedData.relation.toLowerCase() === 'or' ? ' || ' : ' && ',);

      totalStatements.push(`(${embedData.statement})`);

      return embedData;
    });

    conditions.relation && (conditions.statement = totalStatements.join(conditions.relation.toLowerCase() === 'or' ? ' || ' : ' && ',));

    return conditions;
  };

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
        treeData={formatInputFields}
        onCancel={handleExtendClose}
        onSubmit={handleExtendSubmit}
      />
    );
  };

  return (<div className={isConfig ? 'form-item-wrapper' : ''} style={{width: '100%'}}>
      <Row justify="end">
        <Col>
          {isConfig && (<div className="cur-btn" onClick={handleExtendShow}>
              <SelectOutlined/>
              <span style={{paddingLeft: 8}}>
                      {t('workflow.conditions.button.expand')}
                  </span>
            </div>)}
        </Col>
      </Row>
      {readOnly ? (
        <div className={styles.overview}>
          <div className={styles.content}>{getRuleView}</div>
        </div>
      ) : (
        <>
          <div className={styles.ruleForm}>
            <div className={styles.ruleWrap}>
              {mounted && (
                <RuleForm
                  hideGroupBtn
                  ref={ruleFormRef}
                  initRules={initRuleListData}
                  treeData={formatInputFields}
                  onChange={handleRuleFormChange}
                />
              )}
            </div>
            <div className="cur-btn" onClick={() => ruleFormRef.current.addGroup()}>
              <PlusOutlined/>
              <span>{t('workflow.conditions.button.add_group')}</span>
            </div>
          </div>
          {isConfig && getRuleExtendConfig()}
        </>
      )}
    </div>);
};

export default RuleEditor;

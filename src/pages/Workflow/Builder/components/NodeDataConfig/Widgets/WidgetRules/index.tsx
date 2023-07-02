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

import React, {useState, useMemo, useRef} from 'react';
import { Row, Col, Button, Drawer } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import _ from 'lodash';
import { useModel } from 'umi';

import type { FormItemProps } from '../types';

import RuleForm from './RuleForm';

const WidgetRules:React.FC<FormItemProps> = ({ value, onChange, addons }) => {

  const ruleRef = useRef<{
    updateListData: (rules) => void
  }>(null);
  const { formSchema, setFormSchema } = useModel('App', model => ({
    formSchema: model.formSchema,
    setFormSchema: model.setFormSchema,
  }));
  const [drawerVisible, setDrawerVisible] = useState(false);
  const currentWidgetId = useMemo(() => (addons.formData?.$id || '').replace(/\#\//g, ''), [addons.formData?.$id]);

  const getExpression = (source, term, value) => {
    const sourceField = formSchema.properties?.[source] || {};

    source = sourceField?.bind || source;
    source = `formData.${source}`;
    const formatValue = v => _.isString(v) ? `'${v}'` : v;
    const getEqualsExpr = (s = source, v = value) => [s, '==', formatValue(v)];

    let es: any[] = [];
    if (term === 'includes') {
      if (_.isArray(value)) {
        return [
          '(', _.map(value, v => getEqualsExpr(source, v).join(' ')).join(' || '), ')'
        ].join('')
      } else {
        es = getEqualsExpr()
      }
    } else if (term === 'notnull') {
      es = [source, '!= undefined', '&&', source, '!= \'\'']
    } else if (term === 'empty') {
      es = [source, '== undefined', '||', source, '== \'\'']
    } else if (term === 'notequals') {
      es = [source, '!=', formatValue(value)]
    } else if (term === 'true') {
      es = [source, '== true']
    } else if (term === 'false') {
      es = [source, '== false', '||', source, '== undefined']
    } else {
      es = getEqualsExpr()
    }

    return es.join(' ')
  }

  const setExpression = (rules: any[]) => {
    if (!rules) return null;

    // const cloneSchema = _.cloneDeep(formSchema);
    // const currentWidget = cloneSchema.properties[currentWidgetId] || {};

    addons.setValue('hidden', '')

    _.each(rules, group => {
      let ruleString;
      const exps: string[] = [];
      const relation = group.relation;
      _.each(group.children, item => {
        const source = item.source || {};
        const term = item.term || {};

        if (source.value && term.value) {
          exps.push(getExpression(source.value, term.value, item.value))
        }
      })

      ruleString = exps.join(` ${relation === 'OR' ? '||' : '&&'} `);

      try {
        let newRuleString;
        let current = addons.getValue('hidden');
        const neg = group.result !== 'hidden' ? '!' : '';
        if (current) {
          current = current.replace(/\{|\{|\}|\}/g, '');
          newRuleString = `${current} || ${neg}(${ruleString})`;
        } else {
          newRuleString = `${neg}(${ruleString})`
        }

        // currentWidget.hidden = `{{${newRuleString}}}`;
        addons.setValue('hidden', `{{${newRuleString}}}`)
        // setFormSchema(cloneSchema);
      } catch (e) {}
    })
  }

  const toggleVisible = () => {
    setDrawerVisible(!drawerVisible)
  }

  const handleRuleChange = (rules) => {
    onChange?.(rules);
    setExpression(rules);
  }

  const renderRuleDrawer = () => {
    return (
      <Drawer
        title={(
          <Row align="middle" justify="space-between">
            <Col>组件联动规则</Col>
            <Col>
              <Button
                type="text"
                size="small"
                onClick={toggleVisible}
              >
                <CloseOutlined />
              </Button>
            </Col>
          </Row>
        )}
        destroyOnClose
        open={drawerVisible}
        placement="bottom"
        footer={null}
        closeIcon={null}
        onClose={toggleVisible}
      >
        <RuleForm
          ref={ruleRef}
          schema={formSchema}
          initRules={value}
          targetId={currentWidgetId}
          onChange={handleRuleChange}
        />
      </Drawer>
    )
  }

  return (
    <div>
      <p style={{fontSize: 12}}>已设置{ (value || []).length }条联动规则</p>
      <Button size="small" onClick={toggleVisible}>设置</Button>
      { renderRuleDrawer() }
    </div>
  )
}

export default WidgetRules;
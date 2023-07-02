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

import React from 'react';
import { Row, Col } from 'antd';
import { useIntl } from 'umi';
import _ from 'lodash';

import { isDate, isNumber, isMultiValue, isEmptyValue, isSelectField } from '../util';

import styles from './index.less';

/**
 * <Row gutter={[8, 8]}>
 <Col>
 <div className={styles.viewItem}>
 <span>年龄</span>
 <span className={styles.tag}>> 25</span>
 </div>
 </Col>
 <Col>
 <div className={styles.text}>
 <FormattedMessage id="component.rule.form.relation.AND" />
 </div>
 </Col>
 <Col>
 <div className={styles.viewItem}>
 <span>星座</span>
 <span className={styles.tag}>巨蟹</span>
 <span className={styles.tag}>狮子</span>
 </div>
 </Col>
 <Col>
 <div className={styles.text}>
 <FormattedMessage id="component.rule.form.relation.AND" />
 </div>
 </Col>
 <Col>
 <div className={styles.viewItem}>
 <span>收入</span>
 <span className={styles.tag}>3000～8000</span>
 <span className={styles.tag}>8000～12000</span>
 </div>
 </Col>
 <Col>
 <div className={styles.text}>
 <FormattedMessage id="component.rule.form.relation.AND" />
 </div>
 </Col>
 <Col>
 <div className={styles.viewItem}>
 <span>年龄</span>
 <span className={styles.tag}>> 25</span>
 </div>
 </Col>
 <Col>
 <div className={styles.text}>
 <FormattedMessage id="component.rule.form.relation.OR" />
 </div>
 </Col>
 <Col>
 <div className={styles.viewItem}>
 <span>星座</span>
 <span className={styles.tag}>巨蟹</span>
 <span className={styles.tag}>狮子</span>
 </div>
 </Col>
 <Col>
 <div className={styles.text}>
 <FormattedMessage id="component.rule.form.relation.OR" />
 </div>
 </Col>
 <Col>
 <div className={styles.viewItem}>
 <span>收入</span>
 <span className={styles.tag}>3000～8000</span>
 <span className={styles.tag}>8000～12000</span>
 </div>
 </Col>
 </Row>
 * @param dataSource
 * @returns {XML}
 * @constructor
 */

const RuleView = ({ dataSource }) => {
    if (!dataSource) return null;

    const { FormattedMessage } = useIntl();

    const { relation, children } = dataSource;
    const isMulti = children && children.length > 1;

    const getViewItem = (view) => {
        const { term, field, value } = view;

        let node;
        const displayVal = [term.display];

        if (!_.isUndefined(value)) {
            if (_.isString(value) || _.isNumber(value)) {
                displayVal.push(value);

                node = <span className={styles.tag}>{displayVal.join(' ')}</span>;
            } else if (_.isArray(value)) {
                if (isDate(field.dataType)) {
                    node = (
                        <span className={styles.tag}>{value.join(' ' + term.display + ' ')}</span>
                    );
                } else {
                    node = _.map(value, (val, index) => (
                        <span key={['v', index].join('-')} className={styles.tag}>
                            {val}
                        </span>
                    ));
                }
            }
        } else {
            node = <span className={styles.tag}>{displayVal.join(' ')}</span>;
        }

        return (
            <div className={styles.viewItem}>
                <span>{field.tagName}</span>
                {node}
            </div>
        );
    };

    const getRelationNode = (rel) => {
        return (
            <Col>
                <div className={styles.text}>
                    <FormattedMessage id={`component.rule.form.relation.${rel}`} />
                </div>
            </Col>
        );
    };

    return (
        <div className={styles.ruleView}>
            <Row gutter={[8, 8]}>
                {_.map(children, (item, index) => {
                    const childRel = item.relation;

                    return (
                        <React.Fragment key={item.id}>
                            {isMulti ? (
                                <Col>
                                    <div className={styles.text}>(</div>
                                </Col>
                            ) : null}
                            {_.map(item.children, (child, cIndex) => {
                                return (
                                    <React.Fragment key={child.id}>
                                        <Col>{getViewItem(child)}</Col>
                                        {cIndex < (item.children || []).length - 1
                                            ? getRelationNode(childRel)
                                            : null}
                                    </React.Fragment>
                                );
                            })}
                            {isMulti ? (
                                <Col>
                                    <div className={styles.text}>)</div>
                                </Col>
                            ) : null}
                            {index < (children || []).length - 1 ? getRelationNode(relation) : null}
                        </React.Fragment>
                    );
                })}
            </Row>
        </div>
    );
};

export default RuleView;

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

import React, { useMemo, useEffect, useContext } from 'react';
import { Row, Col, Input, Select, TimePicker, DatePicker, InputNumber, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import cls from 'classnames';
import moment from 'moment';
import { useControllableValue } from 'ahooks';
import CurContext from '../../../../common/context';
import FormContext from '../FormContext';
import { isEmptyValue, getOperatorListByType } from '@/components/Rule/util';
import useI18n from '@/common/hooks/useI18n';
import { randomString } from '@/common/utils';

import styles from './index.less';

const { Option } = Select;
const { Link } = Typography;
const { RangePicker } = DatePicker;

const TIME_FORMAT = 'HH:mm';
const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';

let currentFieldType;

const BranchConfig = ({ schema, addons = {}, readOnly, ...rest }) => {
    const { viewType } = useContext(FormContext);
    const { node, nodeData, inputFields } = useContext(CurContext);

    const outPorts = _.get(nodeData, 'configData.outPorts');

    const { t } = useI18n(['workflow', 'common']);
    const isConfig = viewType === 'config';

    const conditionField = addons.formData?.[schema.dependencies];
    const [conditionList, setConditionList] = useControllableValue(rest);

    /**
     * 当前选择的条件字段
     */
    const currentField = useMemo(() => {
        let curField;

        if (!conditionField) return {};

        _.find(inputFields, (item) => {
            if (item.nodeKey === conditionField[0]) {
                return (curField = _.find(
                    item.fields,
                    (field) => field.value === conditionField[1],
                ));
            }
        });

        return curField || {};
    }, [inputFields, conditionField]);

    /**
     * 根据条件字段获取操作符列表
     */
    const operatorList = useMemo(() => {
        let list;

        if (readOnly) {
            list = getOperatorListByType(false);
        } else {
            list = getOperatorListByType(currentField.type || 'STRING') || [];
            if (!list.length) {
                list = getOperatorListByType('STRING');
            }
        }

        return list;
    }, [currentField.type]);

    useEffect(() => {
        if (
            (!conditionList || !conditionList.length) &&
            currentField &&
            currentField.value &&
            outPorts &&
            outPorts.length &&
            operatorList.length
        ) {
            const list = [];
            _.map(outPorts, port => {
              if (port.name !== 'other') {
                list.push(getConditionItem(port.name))
              }
            })
            setConditionList(list);
        }
    }, [conditionList, outPorts, currentField, operatorList]);

    useEffect(() => {
        if (conditionList && conditionList.length && currentField && currentField.value) {
            setConditionList(
                _.map(conditionList, (item) => {
                    item.branch.factors[0].name = currentField.label;
                    item.branch.factors[0].code = currentField.value;
                    item.branch.factors[0].valueType = currentField.type || 'STRING';

                    if (currentFieldType && currentFieldType !== currentField.type) {
                      item.branch.factors[0].value = null;
                      delete item.branch.factors[0].value;

                      currentFieldType = currentField.type;
                    }

                    return item;
                }),
            );
        }
    }, [currentField]);

    const getConditionItem = (sourceAnchor) => {
        return {
            sourceAnchor,
            branch: {
                factors: [
                    {
                        name: currentField.label,
                        code: currentField.value,
                        opt: operatorList[0].value,
                        valueType: currentField.type || 'STRING',
                    },
                ],
                relation: 'and',
                statement: '',
                mode: 'SCRIPT',
            },
        };
    };

    const addBranchItem = () => {
        const ports = node.getPorts();
        const outPorts = node.getPortsByGroup('out');
        const index = ports.findIndex((item) => item.id === 'other');
        const portName = randomString();
        const portData = {
            id: portName,
            group: 'out',
            data: {
                name: portName,
                label: `#${outPorts.length}`,
                count: 1,
                group: 'out',
            },
        };

        node.addPort(portData);

        const item = getConditionItem(portData.id);
        if (conditionList) {
          conditionList.push(item);
          setConditionList([...conditionList]);
        } else {
          setConditionList([ item ]);
        }
    };

    /**
     * 删除字段
     * @param index
     */
    const deleteFieldItem = (index) => () => {
        conditionList.splice(index, 1);
        setConditionList([...conditionList]);

        let inPorts = node.getPortsByGroup('in');
        let outPorts = node.getPortsByGroup('out');

        node.removePortAt(index + inPorts.length);

        outPorts = node.getPortsByGroup('out');

        const graph = node.model.graph;
        const outgoings = graph.getOutgoingEdges(node);
        _.each(outPorts, (port, index) => {
          if (port.id !== 'other') {
            const newLabel = `#${index + 1}`;
            const data = {
              ...port.data,
              label: newLabel
            };
            node.setPortProp(port.id, 'data', data);
            _.find(outgoings, edge => {
              if (edge.getSourcePortId() === port.id) {
                edge.setLabels(newLabel);
                return true;
              }
            })
          }
        })
    };

    /**
     * 更新字段值
     * @param index
     */
    const fieldValueChange = (index) => (value) => {
        if (_.isObject(value)) {
            value = value.target.value;
        }

        conditionList[index].branch.factors[0].value = value;
        setConditionList([...conditionList]);
    };

    const renderDateItem = (factor, index, showTime) => {
      let node;
      const format = showTime ? DATE_TIME_FORMAT : DATE_FORMAT;
      if (factor.opt === 'BETWEEN') {
        const curValue = !_.isUndefined(factor.value) ? (factor.value || '').split(',') : '';
        const from = _.isUndefined(curValue[0]) ? curValue[0] : moment(curValue[0]);
        const to = _.isUndefined(curValue[1]) ? curValue[1] : moment(curValue[1]);
        node = (
          <RangePicker
            size="small"
            value={[from, to]}
            style={{width: '100%'}}
            format={format}
            showTime={showTime}
            onChange={dateValue => {
              fieldValueChange(index)([dateValue[0].format(format), dateValue[1].format(format)].join(','))
            }}
          />
        )
      } else if (['NOT_IN', 'IN'].includes(factor.opt)) {
        node = (
          <Input
            size="small"
            value={factor.value}
            placeholder={t('common.input.split.placeholder')}
            onChange={fieldValueChange(index)}
          />
        );
      } else {
        node = (
          <DatePicker
            size="small"
            style={{width: '100%'}}
            format={format}
            showTime={showTime}
            value={factor.value ? moment(factor.value) : undefined}
            onChange={dateValue => {
              fieldValueChange(index)(dateValue.format(format))
            }}
          />
        )
      }

      return node
    }

  const renderTimeItem = (factor, index) => {
    let node;
    if (factor.opt === 'BETWEEN') {
      const curValue = !_.isUndefined(factor.value) ? (factor.value || '').split(',') : '';
      const from = _.isUndefined(curValue[0]) ? curValue[0] : moment(curValue[0], TIME_FORMAT);
      const to = _.isUndefined(curValue[1]) ? curValue[1] : moment(curValue[1], TIME_FORMAT);
      node = (
        <Row gutter={4} align="middle">
          <Col span={10}>
            <TimePicker
              size="small"
              value={from}
              style={{width: '100%'}}
              format={TIME_FORMAT}
              onChange={(time, timeString) => {
                const value = [timeString];

                if (!_.isUndefined(curValue[1])) {
                  value.push(curValue[1])
                }

                fieldValueChange(index)(value.join(','))
              }}
            />
          </Col>
          <Col flex="auto">
            <div style={{textAlign: 'center'}}>到</div>
          </Col>
          <Col span={10}>
            <TimePicker
              size="small"
              value={to}
              style={{width: '100%'}}
              format={TIME_FORMAT}
              onChange={(time, timeString) => {
                const value = [];

                if (!_.isUndefined(curValue[0])) {
                  value.push(curValue[0])
                }

                value.push(timeString);

                fieldValueChange(index)(value.join(','))
              }}
            />
          </Col>
        </Row>
      )
    } else if (['NOT_IN', 'IN'].includes(factor.opt)) {
      node = (
        <Input
          size="small"
          value={factor.value}
          placeholder={t('common.input.split.placeholder')}
          onChange={fieldValueChange(index)}
        />
      );
    } else {
      node = (
        <TimePicker
          size="small"
          style={{width: '100%'}}
          format={TIME_FORMAT}
          value={factor.value ? moment(factor.value, TIME_FORMAT) : undefined}
          onChange={(time, timeString) => {
            fieldValueChange(index)(timeString)
          }}
        />
      )
    }

    return node
  }

    const renderNumberItem = (factor, index) => {
      let node;
      if (factor.opt === 'BETWEEN') {
        const curValue = !_.isUndefined(factor.value) ? (factor.value || '').split(',') : '';
        const from = _.isUndefined(curValue[0]) ? curValue[0] : (curValue[0] * 1);
        const to = _.isUndefined(curValue[1]) ? curValue[1] : (curValue[1] * 1);
        node = (
          <Row gutter={4} align="middle">
            <Col span={8}>
              <InputNumber
                max={to}
                size="small"
                value={from}
                controls={false}
                style={{width: '100%'}}
                placeholder={t('common.input.placeholder')}
                onChange={input => {
                  const value = [input];

                  if (!_.isUndefined(curValue[1])) {
                    value.push(curValue[1])
                  }

                  fieldValueChange(index)(value.join(','))
                }}
              />
            </Col>
            <Col flex="auto">
              <div style={{textAlign: 'center'}}>与</div>
            </Col>
            <Col span={8}>
              <InputNumber
                min={from}
                size="small"
                value={to}
                controls={false}
                style={{width: '100%'}}
                placeholder={t('common.input.placeholder')}
                onChange={input => {
                  const value = [];

                  if (!_.isUndefined(curValue[0])) {
                    value.push(curValue[0])
                  }

                  value.push(input);

                  fieldValueChange(index)(value.join(','))
                }}
              />
            </Col>
            <Col flex="auto">
              <div style={{textAlign: 'center'}}>之间</div>
            </Col>
          </Row>
        )
      } else if (['NOT_IN', 'IN'].includes(factor.opt)) {
        node = (
          <Input
            size="small"
            value={factor.value}
            placeholder={t('common.input.split.placeholder')}
            onChange={fieldValueChange(index)}
          />
        );
      } else {
        node = (
          <InputNumber
            size="small"
            value={factor.value}
            controls={false}
            style={{width: '100%'}}
            placeholder={t('common.input.placeholder')}
            onChange={fieldValueChange(index)}
          />
        );
      }

      return node;
    }

    /**
     * 根据条件字段的数据类型获取输入项表单
     */
    const getFieldInputItem = (field, index) => {
        const factor = field.branch.factors[0];

        if (isEmptyValue(factor.opt)) return '--';

        if (readOnly) {
            return <span className="form-item-value">{factor.value}</span>;
        }

        let node = (
          <Input
            size="small"
            value={factor.value}
            placeholder={t('common.input.placeholder')}
            onChange={fieldValueChange(index)}
          />
        );

        switch (currentField.type) {
            case 'NUMBER':
            case 'INTEGER':
                node = renderNumberItem(factor, index);
                break;

            case 'DATE':
                node = renderDateItem(factor, index);
                break;

            case 'DATE_TIME':
                node = renderDateItem(factor, index, true);
                break;

            case 'TIME':
                node = renderTimeItem(factor, index);
                break;
        }

        return node;
    };

    /**
     * 字段的操作符选择框
     */
    const getOperatorSelect = (field, index) => {
        const factor = field.branch.factors[0];

        if (readOnly) {
            const optItem = _.find(operatorList, (item) => item.value === factor.opt) || {};
            return <span className="form-item-value">{optItem.label}</span>;
        }

        return (
            <Select
                size="small"
                value={factor.opt}
                style={{ width: 88 }}
                onChange={(value) => {
                    conditionList[index].branch.factors[0].opt = value;

                    if (isEmptyValue(value)) {
                        conditionList[index].branch.factors[0].value = '';
                    }

                    setConditionList([...conditionList]);
                }}
            >
                {_.map(operatorList, (item, index) => (
                    <Option value={item.value} key={['opt', index].join('-')}>
                        {item.label}
                    </Option>
                ))}
            </Select>
        );
    };

    return (
      <div className={cls({
        'form-item-wrapper': isConfig
      })} style={{width: '100%'}}>
        {
          isConfig && (
            <Row justify="end">
              <Col>
                <Link onClick={addBranchItem}>
                  <PlusOutlined style={{ fontSize: 12 }} />
                  <span>{t('common.button.add')}</span>
                </Link>
              </Col>
            </Row>
          )
        }
        <div className={styles.condition}>
            <div className={styles.container}>
                {_.map(conditionList, (item, index) => (
                    <Row
                        align="middle"
                        key={['con-row', index].join('-')}
                        className={styles.row}
                        gutter={[10, 0]}
                    >
                        <Col flex="28px">
                            <span className={styles.number}>#{index + 1}</span>
                        </Col>
                        <Col>{getOperatorSelect(item, index)}</Col>
                        <Col flex="1 1 0">{getFieldInputItem(item, index)}</Col>
                        {!readOnly && (
                            <Col flex="24px">
                                <span className="jr-btn" onClick={deleteFieldItem(index)}>
                                    <DeleteOutlined />
                                </span>
                            </Col>
                        )}
                    </Row>
                ))}
                <Row className={styles.row} gutter={[10, 0]}>
                    <Col>
                        <span className={styles.number}>
                            #{t('workflow.switch.branch.others')}
                        </span>
                    </Col>
                </Row>
            </div>
        </div>
      </div>
    );
};

export default BranchConfig;

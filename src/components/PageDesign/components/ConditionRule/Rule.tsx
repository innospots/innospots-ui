import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { useReactive } from 'ahooks';
import { SettingOutlined } from '@ant-design/icons';

import { RuleSettings } from './Settings';

import styles from './style.less';

type RuleValue = any;

export interface RelationRuleProps {
  value?: RuleValue;
  onChange?: (value: RuleValue) => void;
}

export const RelationRule: React.FC<RelationRuleProps> = ({ value, onChange }) => {
  const settingState = useReactive({
    visible: false,
  });

  const toggleSettings = () => {
    settingState.visible = !settingState.visible;
  };

  const handleSettingSubmit = (ruleData = {}) => {
    onChange?.({
      ...ruleData,
    });
    settingState.visible = false;
  };

  const renderRuleResult = () => {
    const { visible = [], hidden = [] } = value || {};

    return (
      <ul className={styles.addedList}>
        <li className={styles.addedListItem}>
          <span className={styles.label}>
            {visible.length} 条显示规则
          </span>
        </li>
        <li className={styles.addedListItem}>
          <span className={styles.label}>
            {hidden.length} 条隐藏规则
          </span>
        </li>
      </ul>
    );
  };

  return (
    <div className={styles.container}>
      <Row justify="end">
        <Col>
          <span className="b-button" onClick={toggleSettings}>
            <SettingOutlined /> 设置
          </span>
        </Col>
      </Row>
      {!value || (!value.hidden && !value.visible) ? (
        <div className={styles.content}>
          <p className={styles.empty}>请点击“设置”添加联动规则</p>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>{renderRuleResult()}</div>
      )}
      {settingState.visible && (
        <RuleSettings value={value} onSubmit={handleSettingSubmit} onCancel={toggleSettings} />
      )}
    </div>
  );
};

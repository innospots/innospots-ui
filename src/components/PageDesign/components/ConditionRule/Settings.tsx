import React, { useState, useMemo } from 'react';
import ReactDom from 'react-dom';

import _ from 'lodash';
import { useModel } from 'umi';
import cls from 'classnames';
import { Space, Button } from 'antd';
import { useReactive, useDeepCompareEffect } from 'ahooks';

import RuleForm from './RuleForm';

import styles from './style.less';

interface ActionSettingsProps {
  value?: any;
  onCancel?: () => void;
  onSubmit?: (values: any) => void;
}

const ALL_RULES = [
  {
    type: 'hidden',
    label: '隐藏组件规则',
  },
  {
    type: 'visible',
    label: '展示组件规则',
  },
];

export const RuleSettings: React.FC<ActionSettingsProps> = ({ value, onCancel, onSubmit }) => {
  const { widgets, selectedWidget } = useModel('AppEditor', (model) => ({
    widgets: model.widgets,
    selectedWidget: model.selectedWidget
  }));

  const [ruleType, setRuleType] = useState<string>();
  const state = useReactive<{
    hidden: any;
    visible: any;
  }>({
    hidden: null,
    visible: null,
  });

  const ruleData = useMemo(() => state[ruleType || ''], [state, ruleType]);
  const ruleTreeData = useMemo(() => {
    const items: any[] = []
    if (selectedWidget) {
      _.each(_.filter(widgets, widget => (widget.id !== selectedWidget.id)), item => {
        if (item.type !== 'Form') {
          items.push({
            value: item.name,
            label: [item.name, item.settings?.label].join(' - '),
            widgetId: item.id
          })
        }
      });
    }

    return items
  }, [widgets, selectedWidget]);

  useDeepCompareEffect(() => {
    const ruleValue = _.cloneDeep(value || {});
    state.hidden = ruleValue.hidden;
    state.visible = ruleValue.visible;

    if (state.hidden?.length) {
      setRuleType('hidden')
    } else if (state.visible?.length) {
      setRuleType('visible')
    }
  }, [value]);

  const handleSubmit = () => {
    onSubmit?.(state);
  };

  const handleRuleChange = (data) => {
    if (ruleType) {
      state[ruleType] = data;
    }
  };

  const renderHeader = () => {
    return (
      <div className={styles.header}>
        <span className={styles.title}>联动规则设置</span>
        <Space>
          <Button size="small" onClick={onCancel}>
            取消
          </Button>
          <Button size="small" type="primary" onClick={handleSubmit}>
            保存
          </Button>
        </Space>
      </div>
    );
  };

  const renderRuleList = () => {
    return (
      <div className={styles.listBox}>
        <div className={styles.panelTop}>
          <h4>添加规则</h4>
        </div>
        <div className={styles.ruleList}>
          {ALL_RULES.map((item) => (
            <div
              key={item.type}
              className={cls(styles.ruleListItem, {
                [styles.active]: ruleType === item.type,
              })}
              onClick={() => setRuleType(item.type)}
            >
              <span className={styles.label}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAddedList = () => {
    if (!ruleType) {
      return (
        <div className={styles.addedList}>
          <p className={styles.empty}>请点击左侧规则添加</p>
        </div>
      );
    }

    return (
      <div className={styles.addedList}>
        <RuleForm
          key={ruleType}
          treeData={ruleTreeData}
          defaultValue={ruleData}
          onChange={handleRuleChange}
        />
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className={styles.settingPanel}>
        <div className={cls(styles.panels, styles.actionPanel)}>
          {renderRuleList()}
          {renderAddedList()}
        </div>
      </div>
    );
  };

  const render = () => {
    return (
      <>
        <div className={styles.settings}>
          {renderHeader()}
          <div className={styles.content}>{renderSettings()}</div>
        </div>
        <div className={styles.background} />
      </>
    );
  };

  return ReactDom.createPortal(render(), document.getElementById('MainContent') as Element);
};

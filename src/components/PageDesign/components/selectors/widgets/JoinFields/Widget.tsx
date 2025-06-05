import _ from 'lodash';
import cls from 'classnames';
import { useControllableValue } from 'ahooks';
import React, { useMemo, useEffect, useContext, forwardRef } from 'react';

import { Row, Col } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons'

import useI18n from '@/common/hooks/useI18n';
import type { WidgetItemType } from '@/models/AppEditor';

import { WidgetContext } from '../../WidgetProvider';
import InputFieldCascader from '../InputFieldCascader';

import styles from '../../style.less';

const getFieldData = () => ({
  left: {},
  right: {},
});

type Props = {
  inForm?: boolean;
} & WidgetItemType;

const JoinFields: React.FC<Props> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const { t } = useI18n(['workflow', 'common']);

  const readOnly = widgetType === 'view'

  const { size } = useContext(WidgetContext)
  const [joinFields, setJoinFields] = useControllableValue<any[]>(props, {
    defaultValue: [getFieldData()],
  });

  useEffect(() => {
    if (!joinFields || !joinFields.length) {
      setJoinFields([getFieldData()]);
    }
  }, [joinFields]);

  const containerStyle = useMemo(() => {
    const height = size?.height
    return {
      height: height ? height - 40 : 40
    }
  }, [ size ])

  const addJoinField = () => {
    joinFields.push(getFieldData());
    setJoinFields([...joinFields]);
  };

  const deleteFieldByIndex = (index) => () => {
    joinFields.splice(index, 1);
    setJoinFields([...joinFields]);
  };

  const changeJoinField = (type, index) => (value) => {
    if (!value) {
      delete joinFields[index][type]
    } else {
      joinFields[index][type] = value
    }

    setJoinFields([...joinFields]);
  };

  const getJoinFields = () => {
    let span = 11;
    let DeleteIcon;

    if (!joinFields || !joinFields.length) return null;

    const count = joinFields.length;

    if (count > 1) {
      span = 10;
      DeleteIcon = MinusCircleOutlined;
    }

    return (
      <div className="custom-scrollbar" style={containerStyle}>
        {_.map(joinFields, (item, index) => {
          const left: any = item.left || {};
          const right: any = item.right || {};
          let leftValue = left.value;
          let rightValue = right.value;
          const leftFieldNodes = left.fieldNodes || []
          const rightFieldNodes = right.fieldNodes || []

          if (leftFieldNodes.length) {
            leftValue = _.map(leftFieldNodes, item => item.label)
            leftValue = leftValue.join(' - ')
          }

          if (rightFieldNodes) {
            rightValue = _.map(rightFieldNodes, item => item.label)
            rightValue = rightValue.join(' - ')
          }

          return (
            <Row
              justify="space-between"
              key={['left', 'right', index].join('-')}
              style={{
                marginBottom: index !== count - 1 ? 8 : 0,
              }}
            >
              <Col span={span}>
                {
                  readOnly ? leftValue : (
                    <InputFieldCascader
                      value={left}
                      disabled={readOnly}
                      className={styles.field}
                      fieldSource={settings.fieldSource}
                      placeholder={settings.leftPlaceholder || t('workflow.join.input1_key.placeholder')}
                      onChange={changeJoinField('left', index)}
                    />
                  )
                }
              </Col>
              <Col style={{ color: '#666' }}>{ settings.opt || '=' }</Col>
              <Col span={span}>
                {
                  readOnly ? rightValue : (
                    <InputFieldCascader
                      value={right}
                      disabled={readOnly}
                      className={styles.field}
                      fieldSource={settings.fieldSource}
                      placeholder={settings.rightPlaceholder || t('workflow.join.input2_key.placeholder')}
                      onChange={changeJoinField('right', index)}
                    />
                  )
                }
              </Col>
              {DeleteIcon && !readOnly ? (
                <Col>
                  <DeleteIcon
                    style={{
                      color: '#666',
                      marginTop: 8,
                      cursor: 'pointer',
                    }}
                    onClick={deleteFieldByIndex(index)}
                  />
                </Col>
              ) : null}
            </Row>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          {
            !readOnly && (
              <div className={styles.expandBtn}>
                <span className="cur-btn" onClick={addJoinField}>
                  + 添加
                </span>
              </div>
            )
          }
          { getJoinFields() }
        </div>
      </div>
    </div>
  );
})

export default JoinFields;

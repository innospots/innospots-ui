import React, { useMemo } from 'react';
import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi';
import { Typography } from 'antd'

import { getElementProps } from '@/components/PageDesign/utils';
import { APP_WIDGET_LIST, NODE_WIDGET_LIST } from '../../selectors';

import WidgetListItem from './WidgetListItem';

import styles from './style.less';

const { Text } = Typography

const WidgetList: React.FC = () => {
  const { appType, addNewWidget } = useModel('AppEditor', (model) => ({
    appType: model.appType,
    addNewWidget: model.addNewWidget,
  }));

  const widgets = useMemo(
    () => (appType === 'app' ? APP_WIDGET_LIST : NODE_WIDGET_LIST) || [],
    [appType],
  );

  return (
    <div className={cls(styles.widgets, 'custom-scrollbar')}>
      {widgets.map((item) => (
        <React.Fragment key={item.id}>
          <p className={styles.title}>{item.title}</p>
          <div className={styles.widgetList}>
            {_.map(item.widgets, (WidgetItem, index) => {
              const elementProps = getElementProps(WidgetItem.elementProps, appType);
              return (
                <WidgetListItem
                  key={[item.id, index].join('')}
                  widget={WidgetItem.Widget}
                  elementProps={elementProps}
                >
                  <div
                    title={WidgetItem.title}
                    className={styles.itemContent}
                    onClick={() =>
                      addNewWidget(_.merge({}, elementProps, {
                        layout: {
                          x: 0,
                          y: Infinity,
                        },
                      }))
                    }
                  >
                    <WidgetItem.Icon />
                    <Text ellipsis className={styles.text}>{WidgetItem.title}</Text>
                  </div>
                </WidgetListItem>
              );
            })}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default WidgetList;

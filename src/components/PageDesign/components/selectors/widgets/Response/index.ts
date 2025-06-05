import React from 'react';
import _ from 'lodash';
import { InsertRowBelowOutlined } from '@ant-design/icons';

const Widget = React.lazy(() => import('./Widget'));

export const Settings = React.lazy(() => import('./Settings'));

const allElProps = {
  app: {
    layout: {
      w: 6,
      minW:6,
      minH: 6
    },
  },
  node: {
    layout: {
      w: 1,
      resizeHandles: ['s', 'n'],
    },
  },
};

export const elementProps = (appType: string) => {
  return _.merge(
    {
      type: 'Response',
      valueType: 'object',
      settings: {
        label: '表单处理结果',
        placeholder: ''
      },
      layout: {
        h: 6,
        minH: 6,
      },
      copyable: true,
      deletable: true,
    },
    allElProps[appType],
  );
};

export default {
  Widget,
  name: 'Response',
  title: '表单处理结果',
  elementProps,
  Icon: InsertRowBelowOutlined,
};

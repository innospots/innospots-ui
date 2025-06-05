import React from 'react';
import _ from 'lodash';
import { OneToOneOutlined } from '@ant-design/icons';

const Widget = React.lazy(() => import('./Widget'));

export const Settings = React.lazy(() => import('./Settings'));

const allElProps = {
  app: {
    layout: {
      w: 2
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
      type: 'TableFields',
      valueType: 'array',
      settings: {
        label: '表格字段',
        placeholder: ''
      },
      layout: {
        h: 6,
        minH: 3,
      },
      copyable: true,
      deletable: true,
    },
    allElProps[appType],
  );
};

export default {
  Widget,
  name: 'TableFields',
  title: '表格字段',
  elementProps,
  Icon: OneToOneOutlined,
};

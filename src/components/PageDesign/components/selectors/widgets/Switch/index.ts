import React from 'react';
import _ from 'lodash';
import { SwitcherOutlined } from '@ant-design/icons';

const Widget = React.lazy(() => import('./Widget'));

export const Settings = React.lazy(() => import('./Settings'));

const allElProps = {
  app: {
    layout: {
      w: 2,
      resizeHandles: ['e', 'w'],
    },
  },
  node: {
    layout: {
      w: 1,
      resizeHandles: [],
    },
  },
};

export const elementProps = (appType: string) => {
  return _.merge(
    {
      type: 'Switch',
      valueType: 'boolean',
      settings: {
        label: '开关',
        viewType: 'switch', // checkbox
        placeholder: '复选框标题'
      },
      layout: {
        h: 2,
        maxH: 2,
        minH: 2,
      },
      copyable: true,
      deletable: true,
    },
    allElProps[appType],
  );
};

export default {
  Widget,
  name: 'Switch',
  title: '开关',
  elementProps,
  Icon: SwitcherOutlined,
};

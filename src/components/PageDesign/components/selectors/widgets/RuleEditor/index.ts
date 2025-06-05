import React from 'react';
import _ from 'lodash';
import { ConsoleSqlOutlined } from '@ant-design/icons';

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
      type: 'RuleEditor',
      valueType: 'object',
      settings: {
        label: '规则编辑器'
      },
      layout: {
        h: 5,
        minH: 5,
      },
      copyable: true,
      deletable: true,
    },
    allElProps[appType],
  );
};

export default {
  Widget,
  name: 'RuleEditor',
  title: '规则编辑器',
  elementProps,
  Icon: ConsoleSqlOutlined,
};

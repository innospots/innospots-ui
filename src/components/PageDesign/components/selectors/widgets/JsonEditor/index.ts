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
      type: 'JsonEditor',
      valueType: 'string',
      settings: {
        label: 'JSON编辑器',
        placeholder: '请输入'
      },
      layout: {
        h: 4,
        minH: 4,
      },
      copyable: true,
      deletable: true,
    },
    allElProps[appType],
  );
};

export default {
  Widget,
  name: 'JsonEditor',
  title: 'JSON编辑器',
  elementProps,
  Icon: ConsoleSqlOutlined,
};

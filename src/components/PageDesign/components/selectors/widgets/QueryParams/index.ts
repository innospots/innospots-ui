import React from 'react';
import _ from 'lodash';
import { CodeOutlined } from '@ant-design/icons';

const Widget = React.lazy(() => import('./Widget'));

export const Settings = React.lazy(() => import('./Settings'));

export const matchQueryFields = (str: string) => {
  const matches = (str || '').match(/\$\{\w+\}/g);
  return _.uniq(matches);
};

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
      type: 'QueryParams',
      valueType: 'array',
      settings: {
        label: '参数映射'
      },
      layout: {
        h: 3,
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
  name: 'QueryParams',
  title: '参数映射',
  elementProps,
  Icon: CodeOutlined,
};

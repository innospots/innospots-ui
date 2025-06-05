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
      type: 'HttpRequest',
      valueType: 'array',
      settings: {
        label: 'HTTP请求',
        placeholder: ''
      },
      layout: {
        h: 7,
        minH: 7,
      },
      copyable: true,
      deletable: true,
    },
    allElProps[appType],
  );
};

export default {
  Widget,
  name: 'HttpRequest',
  title: 'HTTP请求',
  elementProps,
  Icon: OneToOneOutlined,
};

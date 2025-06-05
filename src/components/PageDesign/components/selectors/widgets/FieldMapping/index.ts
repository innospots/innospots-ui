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
      type: 'FieldMapping',
      valueType: 'array',
      settings: {
        label: '映射字段',
        placeholder: ''
      },
      layout: {
        h: 2,
        minH: 2
      },
      copyable: true,
      deletable: true,
    },
    allElProps[appType],
  );
};

export default {
  Widget,
  name: 'FieldMapping',
  title: '映射字段',
  elementProps,
  Icon: OneToOneOutlined,
};

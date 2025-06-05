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
      type: 'BranchConfig',
      valueType: 'array',
      settings: {
        label: '条件设置',
        conditionOption: '0',
        conditionOptionsMethod: 'static',
        dynamicOptions: {
          method: 'GET'
        },
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
  name: 'BranchConfig',
  title: '条件设置',
  elementProps,
  Icon: ConsoleSqlOutlined,
};

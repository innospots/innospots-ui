import React from 'react';
import _ from 'lodash';
import { CheckSquareOutlined } from '@ant-design/icons';

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
      type: 'MultiSelectPicker',
      valueType: 'string',
      settings: {
        label: '多选框',
        options: [],
        viewType: 'picker',
        dataSource: 'static',
        placeholder: '请选择',
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
  name: 'MultiSelectPicker',
  title: '多选框',
  elementProps,
  Icon: CheckSquareOutlined,
};

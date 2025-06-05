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
      type: 'Cascader',
      valueType: 'array',
      settings: {
        label: '级联选择',
        options: [],
        optionsType: 'inputFields',
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
  name: 'Cascader',
  title: '级联选择',
  elementProps,
  Icon: CheckSquareOutlined,
};

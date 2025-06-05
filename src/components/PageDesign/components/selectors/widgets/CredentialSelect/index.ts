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
      resizeHandles: []
    },
  },
};

export const elementProps = (appType: string) => {
  return _.merge(
    {
      type: 'CredentialSelect',
      valueType: 'string',
      settings: {
        label: '凭据',
        placeholder: '请输入'
      },
      layout: {
        h: 2,
        maxH: 2,
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
  name: 'CredentialSelect',
  title: '凭据',
  elementProps,
  Icon: ConsoleSqlOutlined,
};

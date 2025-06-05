import React from 'react';
import _ from 'lodash';
import { CodeOutlined } from '@ant-design/icons';

const Widget = React.lazy(() => import('./Widget'));

export const Settings = React.lazy(() => import('./Settings'));

export const CODE_MODES = {
  'SQL': 'sql',
  'JAVA': 'java',
  'SHELL': 'powershell',
  'PYTHON': 'python',
  'GROOVY': 'groovy',
  'MARKDOWN': 'markdown',
  'JAVASCRIPT': 'javascript',
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
      type: 'ScriptEditor',
      valueType: 'string',
      settings: {
        label: '脚本编辑器',
        scriptType: 'JAVA',
        placeholder: '请输入',
        enableCompleter: false,
        completerPrefix: '$',
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
  name: 'ScriptEditor',
  title: '脚本编辑器',
  elementProps,
  Icon: CodeOutlined,
};

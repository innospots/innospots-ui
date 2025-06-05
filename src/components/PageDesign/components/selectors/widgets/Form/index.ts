import React from 'react';
import _ from 'lodash';
import { GroupOutlined } from '@ant-design/icons';

import { getWidgetId } from '@/models/AppEditor';
import { getElementProps } from '@/components/PageDesign/utils';
import { elementProps as buttonProps } from '../Button';

const Widget = React.lazy(() => import('./Widget'));

export const Settings = React.lazy(() => import('./Settings'));

const allElProps = {
  app: {
    layout: {
      w: 6,
      minW: 6,
    },
  },
  node: {
    layout: {
      w: 1,
      minW: 1,
      maxW: 1,
      resizeHandles: ['s', 'n'],
    },
  },
};

const defaultBtnProps = {
  app: {
    reset: {
      layout: {
        x: 2,
        y: 4,
      },
    },
    submit: {
      layout: {
        x: 3,
        y: 4,
      },
    }
  },
  node: {
    reset: {
      layout: {
        x: 0,
        y: 3,
      },
    },
    submit: {
      layout: {
        x: 0,
        y: 3,
      },
    }
  }
}

const defaultWidgets = (appType: string) => {
  const resetBtnProps = _.merge({
    id: getWidgetId(),
    name: 'Reset',
    type: 'Button',
    settings: {
      text: '重置',
    },
    layout: {},
    isDefault: true,
    copyable: false,
    deletable: false,
  }, defaultBtnProps[appType]['reset'])

  const submitBtnProps = _.merge({
    id: getWidgetId(),
    name: 'Submit',
    type: 'Button',
    settings: {
      text: '提交',
      type: 'primary',
    },
    isDefault: true,
    copyable: false,
    deletable: false,
  }, defaultBtnProps[appType]['submit'])

  return [
    _.merge({}, getElementProps(buttonProps, appType), resetBtnProps),
    _.merge({}, getElementProps(buttonProps, appType), submitBtnProps)
  ];
};

const elementProps = (appType: string) => {
  return _.merge(
    {
      type: 'Form',
      settings: {},
      layout: {
        h: 5,
        minH: 5,
      },
      copyable: true,
      deletable: true,
      widgets: defaultWidgets(appType),
    },
    allElProps[appType],
  );
};

export default {
  Widget,
  name: 'Form',
  title: '表单',
  noStyle: true,
  elementProps,
  Icon: GroupOutlined,
};

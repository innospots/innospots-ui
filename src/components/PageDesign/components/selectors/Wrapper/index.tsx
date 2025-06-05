import React, { useMemo, forwardRef } from 'react';
import _ from 'lodash';
import { useModel } from 'umi';

import type { WidgetItemType } from '@/models/AppEditor';

import EditWidgetWrapper from './EditWidgetWrapper';
import ViewWidgetWrapper from './ViewWidgetWrapper';
import { WidgetFormItem } from '../WidgetsWrapper/WidgetFormItem';

import {getFormRules} from '../formRules'

const Wrapper: React.FC<
  WidgetItemType & {
    inForm?: boolean;
  }
> = ({ children, pageType, ...props }) => {
  const { getWidgetById } = useModel('AppEditor', (model) => ({
    getWidgetById: model.getWidgetById,
  }));

  const getCurrentRules = () => {
    let rules: any[] = []
    const widgetType = props?.type
    const widgetSettings = props?.settings || {}
    const { validation } = widgetSettings

    const defaultRules = getFormRules(widgetType, widgetSettings)

    if (validation) {
      rules = _.map(validation, ({ type, value, message }) => {
        const rule: any = {
          message
        }
        if (type === 'required') {
          rule.required = true
        } else if (type === 'pattern') {
          try {
            rule.pattern = new Function('return ' + value)()
          } finally {}
        } else if (type === 'len') {
          rule.len = value * 1
        }

        return rule
      })
    }

    rules = rules.concat(defaultRules || [])

    return rules
  }

  const formItemProps = useMemo(() => {
    const settings = props?.settings || {}
    const itemProps:Record<string, any> = {
      ..._.pick(props, ['name', 'noStyle']),
      ..._.pick(settings, ['label', 'required']),
    };

    if (props.inForm && props.parentId) {
      const parentWidget = getWidgetById(props.parentId)
      if (parentWidget) {
        itemProps.name = [parentWidget.name, itemProps.name]
      }
    }

    const rules = getCurrentRules()
    if (rules) {
      itemProps.rules = rules
    }

    return itemProps

  }, [props]);

  const renderContent = () => {
    return (
      <WidgetFormItem itemProps={formItemProps}>{children}</WidgetFormItem>
    );
  };

  return pageType === 'edit' ? (
    <EditWidgetWrapper {...props}>{renderContent()}</EditWidgetWrapper>
  ) : (
    <ViewWidgetWrapper pageType={pageType} {...props}>
      {renderContent()}
    </ViewWidgetWrapper>
  );
};

export const withWidgetWrapper = (Component: any) => {
  return (props) => {
    return (
      <Wrapper { ...props }>
        <Component { ...props } />
      </Wrapper>
    )
  }
}

export default Wrapper;

import React, { useMemo, Suspense, forwardRef } from 'react';
import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi';

import { getResolver } from '../../index';
import GridLayout from '../../../GridLayout';

import { LayoutType, WidgetItemType } from '@/models/AppEditor';

import styles from '../../style.less';

const resolvers = getResolver();

type Props = {} & WidgetItemType;

const layoutProps = {
  rowHeight: 34,
  isDroppable: true,
  compactType: null,
  containerPadding: [0, 0],
  draggableHandle: '.form-move-btn',
};

const ACCEPT_TYPES = [
  'Input',
  'Button',
  'Switch',
  'TextArea',
  'Cascader',
  'DatePicker',
  'RangePicker',
  'NumberInput',
  'OptionPicker',
  'PasswordInput',
  'DateTimePicker',
  'MultiSelectPicker',
];

const Widget: React.FC<Props> = forwardRef((props, ref) => {
  const { id, widgets, pageType } = props;

  const { appType, commonState, addNewWidget, selectedWidgetId, updateChildWidgets } = useModel(
    'AppEditor',
    (model) => ({
      appType: model.appType,
      commonState: model.commonState,
      addNewWidget: model.addNewWidget,
      selectedWidgetId: model.selectedWidgetId,
      selectedWidgetParent: model.selectedWidgetParent,
      updateChildWidgets: model.updateChildWidgets,
    }),
  );

  const formWidgets = widgets || [];

  const layouts = useMemo<LayoutType[]>(
    () =>
      formWidgets.map((widget) => ({
        i: widget.id,
        ...widget.layout,
      })),
    [formWidgets],
  );

  const updateWidgetsLayout = (layout) => {
    const newWidgets = _.cloneDeep(formWidgets);
    layout.map((layoutItem) => {
      const widget = _.find(newWidgets, (w) => w.id === layoutItem.i);
      if (widget) {
        widget.layout = {
          ...widget.layout,
          ...layoutItem,
        };
      }
    });

    updateChildWidgets(id, newWidgets);
  };

  const handleLayoutChange = (layout) => {
    updateWidgetsLayout(layout);
  };

  const handleResizeStop = (layout) => {
    updateWidgetsLayout(layout);

    setTimeout(() => {
      commonState.resizingWidgetId = '';
    }, 100);
  };

  const handleResizeStart = (layout, oldItem) => {
    commonState.resizingWidgetId = oldItem.i;
  };

  const handleWidgetDrop = (layout, layoutItem, event) => {
    try {
      const newLayout = { x: layoutItem.x, y: layoutItem.y };
      const elementProps = JSON.parse(event.dataTransfer.getData('elementProps'));

      if (!ACCEPT_TYPES.includes(elementProps.type)) {
        return false;
      }

      elementProps.layout = {
        ...elementProps.layout,
        ...newLayout,
      };
      addNewWidget(elementProps, layout, id);
    } catch (e: any) {
      throw new Error(e.message);
    } finally {
      setTimeout(() => {
        commonState.resizingWidgetId = '';
      }, 100);
    }
  };

  const handleHoverWidget = (id: string) => (event) => {
    event.stopPropagation();

    if (commonState.resizingWidgetId) return;

    commonState.hoverWidgetId = id;
  };

  const handleMouseOut = () => {
    if (commonState.resizingWidgetId) return;

    commonState.hoverWidgetId = '';
  };

  const renderFormWidgets = () => {
    return formWidgets.map((widget) => {
      const Widget = resolvers[widget.type];
      if (Widget) {
        return (
          <div
            key={widget.id}
            className={cls(styles.formWidget, {
              [styles.isHover]: commonState.hoverWidgetId === widget.id,
              [styles.resizing]: commonState.resizingWidgetId === widget.id,
              [styles.isActive]: selectedWidgetId === widget.id,
            })}
            onMouseOut={handleMouseOut}
            onMouseOver={handleHoverWidget(widget.id)}
          >
            {/* <AntdFormItem noStyle name={widget.name}> */}
            <Suspense fallback={<span />}>
              <Widget {...widget} inForm parentId={id} pageType={pageType} />
            </Suspense>
            {/* </AntdFormItem> */}
          </div>
        );
      }
    });
  };

  return (
    <div className={cls(styles.node, styles.form, 'editor-node-widget')}>
      <div className={cls(styles.inner)}>
        <GridLayout
          {...layoutProps}
          appType={appType}
          layouts={layouts}
          onDrop={handleWidgetDrop}
          onDragStop={handleLayoutChange}
          onResizeStop={handleResizeStop}
          onResizeStart={handleResizeStart}
          onLayoutChange={_.noop}
        >
          {renderFormWidgets()}
        </GridLayout>
      </div>
    </div>
  );
})

export default Widget;

import _ from 'lodash'
import React from 'react';
import { useModel } from 'umi'
import RGL, { Responsive, WidthProvider } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export const LAYOUT_PROPS = {
  rowHeight: 36,
  // compactType: null,
  compactType: 'vertical',

  margin: [6, 6],
  containerPadding: [20, 20],
};

export const APP_LAYOUT_PROPS = {
  ...LAYOUT_PROPS,
  resizeHandles: ['s', 'w', 'e', 'n'],
  cols: { lg: 12, md: 12, sm: 8, xs: 4, xxs: 2 },
  // breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
};

export const NODE_LAYOUT_PROPS = {
  ...LAYOUT_PROPS,
  cols: 1,
  resizeHandles: ['s', 'n'],
};

const ReactGridLayout = WidthProvider(RGL);
const ResponsiveReactGridLayout = WidthProvider(Responsive);

const GridLayout: React.FC<any> = ({ layouts, appType, readonly, children, ...props }) => {
  const { updateWidgetsLayout } = useModel('AppEditor', model => ({
    updateWidgetsLayout: model.updateWidgetsLayout
  }))
  const {
    nodeInfo
  } = useModel('FlowNode', model => ({
    nodeInfo: model.nodeInfo
  }))

  const handleLayoutChange = (newLayouts) => {
    if (!readonly && !_.isEqual(newLayouts, layouts)) {
      updateWidgetsLayout(newLayouts)
    }
  }

  const getLayoutProps = () => {
    const changeAble = !readonly
    return {
      ...(appType === 'app' ? APP_LAYOUT_PROPS : NODE_LAYOUT_PROPS),
      isDroppable: changeAble,
      isResizable: changeAble,
      isDraggable: changeAble,
      draggableHandle: '.widget-move-btn',
      onDrop: handleLayoutChange,
      onDragStop: handleLayoutChange,
      onResizeStop: handleLayoutChange
    };
  };

  const renderAppGridLayout = () => {
    return (
      <ResponsiveReactGridLayout
        {...getLayoutProps()}
        style={{ minHeight: 400 }}
        layouts={{
          lg: layouts,
        }}
        { ...props }
      >
        { children }
      </ResponsiveReactGridLayout>
    );
  };

  const renderNodeGridLayout = () => {
    if (!nodeInfo) return null

    const { settings = {} } = nodeInfo
    const formWidth = settings.formWidth * 1
    return (
      <ReactGridLayout
        {...getLayoutProps()}
        width={formWidth || 480}
        layout={layouts}
        { ...props }
      >
        { children }
      </ReactGridLayout>
    );
  };

  return appType === 'app' ? renderAppGridLayout() : renderNodeGridLayout()
};

export default GridLayout;

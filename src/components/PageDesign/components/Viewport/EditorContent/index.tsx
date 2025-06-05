import React, { useMemo, useRef, useState, useEffect } from 'react';
import _ from 'lodash'
import cls from 'classnames';
import { useModel } from 'umi';

import { useSize, useDeepCompareEffect } from 'ahooks';

import GridLayout from '../../GridLayout';
import CustomSuspense from '../../CustomSuspense';
import WidgetProvider from '../../selectors/WidgetProvider';

import EditorTopBar from '../EditorTopBar';
import WidgetsWrapper from '../../selectors/WidgetsWrapper';
import { getResolver } from '../../selectors';

import styles from './style.less';

const resolvers = getResolver();

const EditorContent: React.FC = () => {
  const {
    layouts,
    widgets,
    appType,
    platform,
    formValue,
    isAppEditor,
    commonState,
    selectedWidgetId,
    addNewWidget,
    setSelectedWidget,
    updateWidgetsLayout,
  } = useModel('AppEditor', model => ({
    layouts: model.layouts,
    widgets: model.widgets,
    appType: model.appType,
    platform: model.platform,
    formValue: model.formValue,
    isAppEditor: model.isAppEditor,
    commonState: model.commonState,
    selectedWidgetId: model.selectedWidgetId,
    addNewWidget: model.addNewWidget,
    setSelectedWidget: model.setSelectedWidget,
    updateWidgetsLayout: model.updateWidgetsLayout,
  }));
  const {
    nodeInfo
  } = useModel('FlowNode', model => ({
    nodeInfo: model.nodeInfo
  }))
  const [formWidth, setFormWidth] = useState(480)
  const containerRef = useRef(null);
  const containerSize = useSize(containerRef);

  useEffect(() => {
    console.log('selectedWidgetId', selectedWidgetId)
  }, [selectedWidgetId])

  useEffect(() => {
    return () => {
      formValue.editValues = {}
      formValue.currentValues = {}
    }
  }, [])

  const innerCls = useMemo(
    () =>
      cls(styles.inner, {
        [platform]: isAppEditor,
        [styles.empty]: !widgets?.length,
      }),
    [widgets?.length, isAppEditor, platform],
  );
  useDeepCompareEffect(() => {
    let width = 420
    if (nodeInfo?.settings) {
      width = nodeInfo.settings.formWidth * 1
    }
    setFormWidth(width)
  }, [ nodeInfo?.settings ])

  const handleHoverWidget = (id: string) => (event) => {
    event.stopPropagation();

    if (commonState.resizingWidgetId) return;

    commonState.hoverWidgetId = id;
  };

  const handleMouseOut = () => {
    if (commonState.resizingWidgetId) return;

    commonState.hoverWidgetId = '';
  };

  const renderWidgets = () => {
    return _.map(widgets, (widget) => {
      const Widget = resolvers[widget.type];
      if (Widget) {
        return (
          <div
            key={widget.id}
            className={cls(styles.widgetWrapper, {
              [styles.isHover]: commonState.hoverWidgetId === widget.id,
              [styles.resizing]: commonState.resizingWidgetId === widget.id,
              [styles.isActive]: selectedWidgetId === widget.id,
            })}
            onMouseOut={handleMouseOut}
            onMouseOver={handleHoverWidget(widget.id)}
          >
            <CustomSuspense>
              <WidgetProvider>
                <Widget {...widget} pageType="edit" />
              </WidgetProvider>
            </CustomSuspense>
          </div>
        );
      }
    });
  };

  const handleWidgetDrop = (layout, layoutItem, event) => {
    try {
      const newLayout = { x: layoutItem.x, y: layoutItem.y };
      const elementProps = JSON.parse(event.dataTransfer.getData('elementProps'));
      elementProps.layout = {
        ...elementProps.layout,
        ...newLayout,
      };
      addNewWidget(elementProps, layout);
    } catch (e: any) {
      throw new Error(e.message);
    } finally {
      setTimeout(() => {
        commonState.resizingWidgetId = '';
      }, 100);
    }
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

  const renderGridLayout = (layoutProps = {}) => {
    return (
      <WidgetsWrapper>
        <GridLayout
          appType={appType}
          layouts={layouts}
          onDrop={handleWidgetDrop}
          onDragStop={handleResizeStop}
          onDragStart={handleResizeStart}
          onResizeStop={handleResizeStop}
          onResizeStart={handleResizeStart}
          { ...layoutProps }
        >
          {renderWidgets()}
        </GridLayout>
      </WidgetsWrapper>
    );
  };

  const renderAppEditorContent = () => {
    return (
      <div
        id="AppEditContentInner"
        className={innerCls}
        // style={{ width: containerSize?.width }}
      >
        {renderGridLayout()}
      </div>
    );
  };

  const renderNodeEditorContent = () => {
    if (!nodeInfo) return null
    return (
      <div
        id="NodeEditContentInner"
        className={innerCls}
        style={{width: formWidth + 'px'}}
      >
        {renderGridLayout()}
      </div>
    );
  };

  return (
    <div className={cls(styles.wrapper, `${appType}-editor-content`)}>
      <EditorTopBar />
      <div id="EditContent" ref={containerRef} className={cls(styles.content, 'custom-scrollbar')} onClick={() => setSelectedWidget('')}>
        { isAppEditor ? renderAppEditorContent() : renderNodeEditorContent() }
        {!widgets.length && (
          <section className={styles.placeholder}>
            <span>从左侧的UI控件面板中拖拽控件至此</span>
          </section>
        )}
      </div>
    </div>
  );
};

export default EditorContent;

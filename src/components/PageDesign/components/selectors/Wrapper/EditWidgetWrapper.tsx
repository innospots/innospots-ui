import React, { useMemo } from 'react'

import cls from 'classnames';
import { Space } from 'antd'
import {CopyOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons';

import { useModel } from 'umi'

import type { WidgetItemType } from '@/models/AppEditor'

import styles from '../style.less';

const EditWidgetWrapper:React.FC<WidgetItemType & {
  inForm?: boolean
}> = ({ children, ...props }) => {

  const {
    id,
    name,
    inForm,
    parentId,
    copyable,
    settings,
    deletable,
    type: widgetType
  } = props;

  const {
    commonState,
    hiddenWidgets,
    copyWidget,
    deleteWidget,
    selectedWidgetId,
    setSelectedWidget
  } = useModel('AppEditor', model => ({
    commonState: model.commonState,
    hiddenWidgets: model.hiddenWidgets,
    copyWidget: model.copyWidget,
    deleteWidget: model.deleteWidget,
    selectedWidgetId: model.selectedWidgetId,
    setSelectedWidget: model.setSelectedWidget,
  }))

  const isHover = useMemo(() => commonState.hoverWidgetId === id, [ commonState.hoverWidgetId, id ])
  const isActive = useMemo(() => selectedWidgetId === id, [ selectedWidgetId, id ])
  const isHidden = useMemo(() => settings?.hidden || hiddenWidgets.includes(name || ''), [ hiddenWidgets, name, settings?.hidden ])
  const isForbidden = useMemo(() => settings?.forbidden, [ settings?.forbidden ])

  const updateSelectedWidget = (event) => {
    event.stopPropagation()
    if (!commonState.resizingWidgetId) {
      setSelectedWidget(id, parentId)
    }
  }

  const handleDeleteNode = e => {
    e.stopPropagation();
    deleteWidget(id, parentId)
  }

  const handleCopyNode = e => {
    e.stopPropagation();
    copyWidget(id, parentId)
  }

  const renderNodeMenu = () => {
    return (
      <>
        <div className={styles.nodeName}>
          <Space>
            <span>{ name }</span>
            {
              isHidden && (
                <span className={styles.hidden}>[隐藏]</span>
              )
            }
            {
              isForbidden && (
                <span className={styles.disabled}>[失效]</span>
              )
            }
          </Space>
        </div>
        <div className={cls(styles.nodeMenu, styles.tl)}>
          <span className={cls(styles.btn, styles.moveBtn, {
            'form-move-btn': inForm,
            'widget-move-btn': !inForm
          })}>
            <PlusOutlined />
          </span>
          {
            deletable && (
              <span className={styles.btn} onMouseDown={handleDeleteNode}>
                <DeleteOutlined />
              </span>
            )
          }
          {
            copyable && (
              <span className={styles.btn} onClick={handleCopyNode}>
                <CopyOutlined />
              </span>
            )
          }
        </div>
      </>
    )
  }

  return (
    <div
      className={cls(styles.nodeWrapper, styles.editNodeWrapper, styles[widgetType], {
        [styles.inForm]: inForm,
        [styles.isHover]: isHover,
        [styles.isActive]: isActive,
        [styles.opacity]: isHidden || isForbidden
        // 'custom-scrollbar': ['Form'].includes(widgetType)
        // [styles.isRootNode]: isRootNode,
      })}
      onClick={updateSelectedWidget}
    >
      { children }
      { renderNodeMenu() }
    </div>
  )
}

export default EditWidgetWrapper
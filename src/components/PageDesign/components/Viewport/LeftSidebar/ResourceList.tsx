import React, { useMemo } from 'react'
import _ from 'lodash'
import cls from 'classnames';
import {useModel} from 'umi';

import { ALL_WIDGETS } from '../../selectors'

import styles from './style.less'

const ResourceList: React.FC = () => {

  const {
    widgets,
    nodeEditPage,
    setNodeEditPage,
    selectedWidgetId,
    setSelectedWidget
  } = useModel('AppEditor', model => ({
    widgets: model.widgets,
    nodeEditPage: model.nodeEditPage,
    setNodeEditPage: model.setNodeEditPage,
    selectedWidgetId: model.selectedWidgetId,
    setSelectedWidget: model.setSelectedWidget
  }))

  const sortWidgets = (widgets) => {
    widgets.sort((n, o) => {
      const nl = n.layout || {}
      const ol = o.layout || {}

      if (nl.y === ol.y) {
        return nl.x - ol.x
      } else {
        return nl.y - ol.y
      }
    })
    return widgets
  }

  const sortedWidgets = useMemo(() => {
    return sortWidgets(_.map(_.cloneDeep(widgets), item => {
      if (item.widgets) {
        item.widgets = sortWidgets(item.widgets)
      }
      return item
    }))
  }, [ widgets ])

  const getWidgetIcon = (type: string) => {
    const widget = ALL_WIDGETS.find(item => item.elementProps?.type === type)
    if (widget) {
      return widget.Icon
    }

    return null
  }

  const renderResourceList = (resourceList, parentId?: string) => {
    return (
      <div className={styles.list}>
        {
          resourceList.map(item => {
            const Icon = getWidgetIcon(item.type)
            return (
              <div
                key={item.id}
                className={cls(styles.listItem, { [styles.active]: item.id === selectedWidgetId })}
              >
                <div className={styles.title} onClick={() => {
                  if (nodeEditPage !== 'config') {
                    setNodeEditPage('config')
                  }
                  setSelectedWidget(item.id, parentId)
                }}>
                  {
                    Icon && <Icon className={styles.icon} />
                  }
                  <span className={styles.label}>{ item.name }</span>
                </div>
                {
                  item.widgets?.length ? renderResourceList(item.widgets, item.id) : null
                }
              </div>
            )
          })
        }
      </div>
    )
  }

  return (
    widgets.length ? renderResourceList(sortedWidgets) : (
      <p className={styles.empty}>
        您还未添加任何UI控件， <br />请点击“+”按钮
      </p>
    )
  )
}

export default ResourceList

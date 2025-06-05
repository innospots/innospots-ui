import React from 'react'

import styles from './style.less'

type Props = {
  widget: any
  elementProps: Record<string, any>
}

const WidgetListItem:React.FC<Props> = ({ widget, elementProps, children }) => {

  const handleDragStart = (event) => {
    event.dataTransfer.setData('text/plain', '')
    event.dataTransfer.setData('elementProps', JSON.stringify(elementProps))
  }

  return (
    <div
      draggable={true}
      unselectable="on"
      className={styles.widgetListItem}
      onDragStart={handleDragStart}
    >
      { children }
    </div>
  )
}

export default WidgetListItem
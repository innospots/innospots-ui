import React from 'react'

import cls from 'classnames'
import {Input, Tree} from 'antd';

import styles from '../../style.less'

const VariableList:React.FC<{
  onSelectVariable?: (item: any) => void
}> = ({ onSelectVariable }) => {

  const treeData= [
    {
      title: 'parent 1',
      key: '0-0',
      children: [
        {
          title: 'parent 1-0',
          key: '0-0-0',
          children: [
            { title: 'leaf', key: '0-0-0-0' },
            {
              title: 'multiple line title multiple line title multiple line title',
              key: '0-0-0-1',
            },
            { title: 'leaf', key: '0-0-0-2' },
          ],
        },
        {
          title: 'parent 1-1',
          key: '0-0-1',
          children: [{ title: 'leaf', key: '0-0-1-0' }],
        },
        {
          title: 'parent 1-2',
          key: '0-0-2',
          children: [
            { title: 'leaf', key: '0-0-2-0' },
            {
              title: 'leaf',
              key: '0-0-2-1',
              // switcherIcon: <FormOutlined />
            },
          ],
        },
      ],
    },
    {
      title: 'parent 2',
      key: '0-1',
      children: [
        {
          title: 'parent 2-0',
          key: '0-1-0',
          children: [
            { title: 'leaf', key: '0-1-0-0' },
            { title: 'leaf', key: '0-1-0-1' },
          ],
        },
      ],
    },
  ]

  const onSelect = () => {

  }

  const treeTitleRender = (nodeData) => {
    const { title, children } = nodeData
    if (children) {
      return title
    } else {
      return (
        <span className={styles.nodeTitle} onDoubleClick={() => onSelectVariable?.(title)}>{ title }</span>
      )
    }
  }

  return (
    <div className={cls(styles.variableList)}>
      <div className={styles.panelTop}>
        <Input.Search size="small" placeholder="请输入" />
      </div>
      <div className={cls(styles.variableTree, 'custom-scrollbar')}>
        <Tree
          showLine
          showIcon
          selectable={false}
          defaultExpandedKeys={['0-0-0']}
          treeData={treeData}
          onSelect={onSelect}
          titleRender={treeTitleRender}
        />
      </div>
    </div>
  )
}

export default VariableList
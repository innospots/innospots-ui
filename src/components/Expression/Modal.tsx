import React, { useRef, useState } from 'react'
import cls from 'classnames'
import { Row, Col, Tree, Input, Modal, ModalProps } from 'antd'
import BraftEditor from 'braft-editor'
import { ContentUtils } from 'braft-utils'

import { useDebounceEffect } from 'ahooks'

import { transform } from './index'

import 'braft-editor/dist/index.css'
import styles from './style.less'

export type ExpressionModalProps = {
  value?: any
  onSubmit?: (value?: string) => void
} & ModalProps

export const ExpressionModal:React.FC<ExpressionModalProps> = ({ value, onSubmit, ...rest }) => {

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

  const editorRef = useRef()
  const [editorState, setEditorState] = useState(BraftEditor.createEditorState(null))
  const [parsedExpress, setParsedExpress] = useState('')

  const parseExpressText = () => {
    let inputText = editorState.toText() || ''
    try {
      if (inputText) {
        inputText = transform(inputText, {$User: { id: 1, name: '郑总' }})
      }
    } catch (e) { }

    setParsedExpress(inputText)
  }

  useDebounceEffect(() => {
    parseExpressText()
  }, [ editorState ], {
    wait: 500
  })

  const selectExpression = () => {
    setEditorState(ContentUtils.insertText(editorState, '{{$User.name}}'))
    // console.info(editorState.toText())
  }

  const treeTitleRender = (nodeData) => {
    const { title, children } = nodeData
    if (children) {
      return title
    } else {
      return (
        <span className={styles.nodeTitle} onDoubleClick={selectExpression}>{ title }</span>
      )
    }
  }
  
  const onSelect = () => {

  }

  const handleSubmit = () => {
    onSubmit?.(editorState.toText() || '')
  }

  const handleEditorChange = (state) => {
    setEditorState(state)
  }
  
  const renderExpressionEditor = () => {
    return (
      <>
        <p className={styles.title}>表达式</p>
        <div className={styles.expEditor}>
          {/*@ts-ignore*/}
          <BraftEditor
            ref={editorRef}
            controls={[]}
            stripPastedStyles
            value={editorState}
            placeholder="请输入表达式"
            contentStyle={{height: 130, lineHeight: 1.2, fontSize: 14}}
            onChange={handleEditorChange}
          />
        </div>
      </>
    )
  }

  const renderExpressionViewer = () => {
    return (
      <>
        <p className={styles.title}>执行预览</p>
        <div className={cls(styles.expViewer, 'custom-scrollbar')}>
          { parsedExpress }
        </div>
      </>
    )
  }

  const renderVariables = () => {
    return (
      <div className={styles.variables}>
        <p className={styles.title}>选择变量</p>
        <Input.Search size="small" placeholder="请输入" />
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

  const renderExpressions = () => {
    return (
      <div className={styles.expressions}>
        { renderExpressionEditor() }
        { renderExpressionViewer() }
      </div>
    )
  }

  return (
    <Modal title="编辑表达式" width={840} bodyStyle={{padding: 0}} zIndex={3000} { ...rest } onOk={handleSubmit}>
      <div className={styles.modal}>
        <Row>
          <Col span={8}>
            { renderVariables() }
          </Col>
          <Col span={16}>
            { renderExpressions() }
          </Col>
        </Row>
      </div>
    </Modal>
  )
}
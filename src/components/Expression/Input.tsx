import React, { useState, useEffect } from 'react'
import cls from 'classnames'
import { Input, InputProps } from 'antd'
import { useReactive, useControllableValue } from 'ahooks'
import { FunctionOutlined } from '@ant-design/icons'

import { ExpressionModal } from './Modal'

import styles from './style.less'

type PropsType = {} & InputProps

export const ExpressionInput:React.FC<PropsType> = ({ value, onChange, ...rest }) => {

  const modalState = useReactive({
    open: false
  })
  const [expValue, setExpValue] = useState<string | undefined>()

  useEffect(() => {
    setExpValue(value)
  }, [ value ])

  useEffect(() => {
    onChange?.(expValue)
  }, [ expValue ])

  const toggleModal = () => {
    modalState.open = !modalState.open
  }

  const renderExpressionModal = () => {
    return (
      <ExpressionModal
        open={modalState.open}
        onCancel={toggleModal}
        onSubmit={(value) => {
          setExpValue(value)
          modalState.open = false
        }}
      />
    )
  }

  const renderInputNode = () => {
    return (
      <div className={styles.input}>
        <Input
          placeholder="请输入"
          // addonAfter={
          //   <span
          //     className={cls('g-button', styles.fxButton)}
          //     onClick={toggleModal}
          //   >
          //     <FunctionOutlined />
          //   </span>
          // }
          { ...rest }
          value={expValue}
          onChange={event => setExpValue(event.target.value)}
        />
      </div>
    )
  }

  return (
    <>
      { renderInputNode() }
      { renderExpressionModal() }
    </>
  )
}
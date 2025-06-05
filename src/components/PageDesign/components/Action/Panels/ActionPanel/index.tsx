import React, { useMemo } from 'react'
import _ from 'lodash'
import cls from 'classnames'
import { useModel } from 'umi'
import { ReactSortable } from "react-sortablejs"
import { PlusOutlined, HolderOutlined, CloseOutlined } from '@ant-design/icons'

import * as FormModules from './Forms'
import SettingForm from './SettingForm'

import styles from '../../style.less'

// const ACTION_DATA = [{
//   type: 'data',
//   list: [{
//     value: 'GET_ONE_DATA',
//     label: '获取单条数据'
//   }, {
//     value: 'SAVE_DATA',
//     label: '保存数据'
//   }, {
//     value: 'DELETE_DATA',
//     label: '删除数据'
//   }, {
//     value: 'QUERY_DATA',
//     label: '执行查询'
//   }, {
//     value: 'SET_DATA',
//     label: '设置组件值'
//   }, {
//     value: 'UPDATE_VARIABLE_VALUE',
//     label: '更新变量值'
//   }, {
//     value: 'VALIDATE_FORM',
//     label: '验证表单'
//   }, {
//     value: 'RESET_FORM',
//     label: '重置表单'
//   }]
// }, {
//   type: 'view',
//   list: [{
//     value: 'SHOW_MODAL',
//     label: '显示弹窗'
//   }, {
//     value: 'CLOSE_MODAL',
//     label: '关闭弹窗'
//   }, {
//     value: 'CONFIRM_DIALOG',
//     label: '确认对话框'
//   }, {
//     value: 'MESSAGE_NOTICE',
//     label: '显示消息提醒'
//   }, {
//     value: 'GO_TO_PAGE',
//     label: '跳转页面'
//   }, {
//     value: 'LOGOUT',
//     label: '登出'
//   }]
// }]

const ACTION_NEW_DATA = [{
  type: 'data',
  list: [{
    value: 'SUBMIT_FORM_DATA',
    label: '提交数据'
  }, {
    value: 'READ_DATA',
    label: '读取数据'
  }, {
    value: 'OPERATE_WIDGETS',
    label: '组件操作'
  }]
}]

const ActionPanel:React.FC = () => {
  const {
    addAction,
    removeAction,
    actionState,
    currentAction,
    updateActionState
  } = useModel('Action', (model) => ({
    addAction: model.addAction,
    removeAction: model.removeAction,
    actionState: model.actionState,
    currentAction: model.currentAction,
    updateActionState: model.updateActionState
  }))
  
  const formActionType = (type: string) => {
    return _.upperFirst(_.camelCase(type))
  }

  const FormModule = useMemo(() => {
    if (currentAction) {
      const moduleName = formActionType(currentAction.type)
      return FormModules[moduleName]
    }

    return null
  }, [ currentAction ])

  const removeActionById = (id) => (event) => {
    event.stopPropagation()
    removeAction(id)
  }

  const updateActionList = (list) => {
    actionState.list = list
    updateActionState()
  }

  const renderListBox = () => {
    return (
      <div className={styles.listBox}>
        <div className={styles.panelTop}>
          <span className={styles.configButton} onClick={() => {
            actionState.currentId = ''
            updateActionState()
          }}>
            <PlusOutlined />
            新建
          </span>
        </div>
        {
          actionState.list.length ? (
            <ReactSortable
              list={actionState.list}
              handle=".drag-btn"
              className={cls(styles.addedList, 'custom-scrollbar')}
              setList={updateActionList}
            >
              {
                actionState.list.map((item, index) => (
                  <div
                    key={item.id}
                    className={cls(styles.addedListItem, { [styles.active]: item.id === actionState.currentId })}
                    onClick={() => {
                      actionState.currentId = item.id
                      updateActionState()
                    }}
                  >
                    <HolderOutlined className="drag-btn" />
                    <span className={styles.label}>{ index + 1 }. { item.label }</span>
                    <span className={cls('g-button', styles.removeBtn)} onClick={removeActionById(item.id)}>
                      <CloseOutlined />
                    </span>
                  </div>
                ))
              }
            </ReactSortable>
          ) : (
            <p className={styles.empty}>
              您还未添加任何动作，请点击“新建”按钮
            </p>
          )
        }
      </div>
    )
  }

  const renderActionBox = () => {
    return (
      <div className={styles.actionBox}>
        {
          ACTION_NEW_DATA.map(action => (
            <div key={action.type} className={styles.actionList}>
              {
                action.list.map(item => (
                  <div
                    key={item.value}
                    className={styles.actionListItem}
                    onClick={() => addAction({
                      type: item.value,
                      label: item.label,
                      formData: FormModules[`${formActionType(item.value)}DefaultData`]
                    })}
                  >
                    <span>{ item.label }</span>
                  </div>
                ))
              }
            </div>
          ))
        }
      </div>
    )
  }

  const renderActionForm = () => {
    return (
      <div className={styles.actionBox}>
        <div className="custom-scrollbar" style={{height: '100%'}}>
          <SettingForm key={currentAction?.id}>
            { FormModule || null }
          </SettingForm>
        </div>
      </div>
    )
  }

  return (
    <div className={cls(styles.panels, styles.actionPanel)}>
      { renderListBox() }
      {
        actionState.currentId ? renderActionForm() : renderActionBox()
      }
    </div>
  )
}

export default ActionPanel
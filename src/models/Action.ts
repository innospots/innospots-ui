import { useState, useMemo, useRef, useEffect } from 'react';
import _ from 'lodash';
import { FormInstance } from 'antd';
import { useReactive, useDebounceEffect } from 'ahooks';

import { randomString } from '@/common/utils';
import { KeyValues } from '@/common/types/Types';

export type ActionType = {
  id: string;
  type: string;
  label: string;
  formData?: KeyValues;
};

interface ActionState {
  currentId: string;
  list: ActionType[];
}

const getActionId = () => {
  return randomString(4);
};

const getActionItem = (data?: Partial<ActionType>): ActionType => {
  return {
    id: getActionId(),
    ...data,
  } as ActionType;
};

export default () => {
  const [actionState, setActionState] = useState<ActionState>({
    list: [],
    currentId: '',
  });

  const currentAction = useMemo(() => {
    return _.find(actionState.list, (item) => item.id === actionState.currentId);
  }, [actionState.list, actionState.currentId]);

  const currentActionFormData = useMemo(() => {
    return currentAction?.formData || {};
  }, [currentAction]);

  const editorIns = useRef<any>();
  const actionFormIns = useRef<FormInstance>();

  useDebounceEffect(
    () => {
      if (actionFormIns.current && actionState.currentId) {
        updateActionForm();
      }
    },
    [actionState.currentId, actionFormIns.current],
    {
      wait: 500,
    },
  );

  const setEditorIns = (editor) => {
    editorIns.current = editor;
  };

  const setActionFormIns = (form) => {
    actionFormIns.current = form;
  };

  const updateActionForm = () => {
    if (currentAction) {
      const { formData } = currentAction;
      actionFormIns.current?.resetFields();
      actionFormIns.current?.setFieldsValue(formData);
    }
  };

  const updateActionState = (newState: Partial<ActionState> = actionState) => {
    setActionState({
      ...actionState,
      ...newState,
    });
  };

  const addAction = (data?: Partial<ActionType>) => {
    const actionItem = getActionItem(data);
    actionState.list.push(actionItem);
    actionState.currentId = actionItem.id;

    updateActionState(actionState);
  };

  const removeAction = (id: string) => {
    actionState.list = _.filter(actionState.list, (item) => item.id !== id);

    if (id === actionState.currentId) {
      actionState.currentId = '';
    }

    updateActionState(actionState);
  };

  const updateAction = (data: ActionType, force?: boolean) => {
    const index = _.findIndex(actionState.list, (item) => item.id === data.id);
    if (index > -1) {
      actionState.list[index] = data;
    }
    if (force) {
      actionState.list = [...actionState.list];
    }

    updateActionState(actionState);
  };

  const updateActionFormData = (formData: KeyValues) => {
    if (currentAction) {
      updateAction(
        _.assign(
          {
            ...currentAction,
          },
          {
            formData,
          },
        ),
        true,
      );
    }
  };

  const clearAction = () => {
    actionState.list = [];
    actionState.currentId = '';

    updateActionState(actionState);
  };

  const setAction = (list) => {
    actionState.list = list;
    updateActionState(actionState);
  };

  return {
    editorIns,
    setEditorIns,

    actionState,
    currentAction,
    currentActionFormData,

    setAction,
    addAction,
    clearAction,
    updateAction,
    removeAction,

    actionFormIns,
    setActionFormIns,

    updateActionState,
    updateActionFormData,
  };
};

/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {useState} from 'react';
import {useRequest} from 'ahooks';

import * as Service from '@/services/Tasks';

import {ITableData} from '@/common/types/Types';
import {addPageListData, deletePageListData, updatePageListData} from "@/common/utils";

export default () => {
  const [taskData, setTaskData] = useState<ITableData>({});
  const [taskDetailData, setTaskDetailData] = useState<any>({});
  const [taskCommentData, setTaskCommentData] = useState<any>({});

  /**
   * 工作项列表数据
   */
  const taskRequest = useRequest<any, any[]>(Service.fetchTasks, {
    manual: true,
    cacheKey: 'TaskData',
    onSuccess: (result: ITableData) => {
      setTaskData(result);
    },
  });

  /**
   * 添加/编辑任务
   */
  const saveTaskRequest = useRequest(Service.saveTask, {
    manual: true,
    onSuccess: (result, [type, data]) => {
      let newTaskData;

      if (result) {
        if (type === 'edit') {
          newTaskData = updatePageListData(taskData, data, 'taskId');
        } else {
          newTaskData = addPageListData(taskData, result);
        }

        if (newTaskData) {
          setTaskData(newTaskData);
        }
      }
    },
  });

  /**
   * 删除任务
   */
  const deleteTaskRequest = useRequest(Service.deleteTask, {
    manual: true,
    onSuccess: (result, [taskId]) => {
      let newTaskData;

      if (result) {
        newTaskData = deletePageListData(taskData, 'taskId', taskId);

        if (newTaskData) {
          setTaskData(newTaskData);
        }
      }
    },
  });

  /**
   * 添加评论
   */
  const saveTaskCommentRequest = useRequest(Service.saveTaskComment, {
    manual: true
  });

  /**
   * 删除评论
   */
  const deleteTaskCommentRequest = useRequest(Service.deleteTaskComment, {
    manual: true
  });

  /**
   * 修改任务状态
   */
  const updateTaskStatusRequest = useRequest(Service.updateTaskStatus, {
    manual: true
  });

  // 工作项详情
  const taskDetailRequest = useRequest(Service.fetchTaskDetail, {
    manual: true,
    onSuccess: (result) => {
      setTaskDetailData(result)
    },
  });

  // 获取工作项评论内容
  const taskCommentRequest = useRequest(Service.fetchTaskComment, {
    manual: true,
    onSuccess: (result) => {
      setTaskCommentData(result)
    },
  });

  return {
    taskData,
    taskDetailData,
    taskCommentData,

    taskRequest,
    saveTaskRequest,
    deleteTaskRequest,
    taskDetailRequest,
    taskCommentRequest,
    saveTaskCommentRequest,
    updateTaskStatusRequest,
    deleteTaskCommentRequest,
  };
};

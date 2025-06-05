import {fetch} from '@/common/request';
import {ITableData, KeyValues} from '@/common/types/Types';

// 分页查询任务执行记录
export const fetchJobExecutionPageData = (params?: KeyValues): Promise<ITableData> => {
  return fetch(`schedule/job-execution/page`, {
    params
  });
};

// 获取任务执行记录详情
export const fetchJobExecutionDetail = (jobExecutionId: string, includeSub: boolean = true) => {
  return fetch(`schedule/job-execution/${jobExecutionId}`, {
    params: {
      includeSub
    }
  });
};

// 更新任务执行状态
export const updateJobExecutionStatus = (jobExecutionId: string, status: string, message?: string) => {
  return fetch(`schedule/job-execution/${jobExecutionId}/status/${status}`, {
    method: 'PUT',
    params: {
      message
    }
  });
};

// 重试执行失败的任务
export const retryJobExecution = (jobExecutionId: string) => {
  return fetch(`schedule/job-execution/retry/${jobExecutionId}`, {
    method: 'POST'
  });
};

// 继续执行已停止的任务
export const continueJobExecution = (jobExecutionId: string) => {
  return fetch(`schedule/job-execution/continue/${jobExecutionId}`, {
    method: 'POST'
  });
};

// 停止正在执行的任务
export const stopJobExecution = (jobExecutionId: string, message?: string) => {
  return fetch(`schedule/job-execution/stop/${jobExecutionId}`, {
    method: 'POST',
    params: {
      message
    }
  });
};

// 手动标记任务为失败
export const failJobExecution = (jobExecutionId: string) => {
  return fetch(`schedule/job-execution/fail/${jobExecutionId}`, {
    method: 'POST'
  });
};

// 手动标记任务为完成
export const completeJobExecution = (jobExecutionId: string) => {
  return fetch(`schedule/job-execution/complete/${jobExecutionId}`, {
    method: 'POST'
  });
};
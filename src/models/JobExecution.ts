import { useState } from 'react';
import { useRequest } from 'ahooks';

import * as Service from '@/services/JobExecution';
import { ITableData, KeyValues } from '@/common/types/Types';

export default () => {
  // 状态定义
  const [jobExecutionData, setJobExecutionData] = useState<ITableData>({});
  const [currentExecution, setCurrentExecution] = useState<any>(null);

  // 分页查询任务执行记录
  const jobExecutionPageRequest = useRequest<ITableData, KeyValues[]>(Service.fetchJobExecutionPageData, {
    manual: true,
    onSuccess: (result: ITableData) => {
      setJobExecutionData(result);
    },
  });

  // 获取任务执行记录详情
  const jobExecutionDetailRequest = useRequest(Service.fetchJobExecutionDetail, {
    manual: true,
    onSuccess: (result) => {
      setCurrentExecution(result);
    },
  });

  // 更新任务执行状态
  const updateStatusRequest = useRequest(Service.updateJobExecutionStatus, {
    manual: true,
    onSuccess: (result, [jobExecutionId, status]) => {
      // 更新列表中的状态
      if (jobExecutionData.records) {
        const updatedRecords = jobExecutionData.records.map(item =>
          item.id === jobExecutionId ? { ...item, status } : item
        );
        setJobExecutionData({ ...jobExecutionData, records: updatedRecords });
      }
      // 更新当前查看的执行记录状态
      if (currentExecution?.id === jobExecutionId) {
        setCurrentExecution({ ...currentExecution, status });
      }
    },
  });

  // 重试执行失败的任务
  const retryExecutionRequest = useRequest(Service.retryJobExecution, {
    manual: true,
  });

  // 继续执行已停止的任务
  const continueExecutionRequest = useRequest(Service.continueJobExecution, {
    manual: true,
  });

  // 停止正在执行的任务
  const stopExecutionRequest = useRequest(Service.stopJobExecution, {
    manual: true,
  });

  // 手动标记任务为失败
  const failExecutionRequest = useRequest(Service.failJobExecution, {
    manual: true,
  });

  // 手动标记任务为完成
  const completeExecutionRequest = useRequest(Service.completeJobExecution, {
    manual: true,
  });

  return {
    // 状态数据
    jobExecutionData,
    currentExecution,

    // 状态更新方法
    setJobExecutionData,
    setCurrentExecution,

    // 请求方法
    jobExecutionPageRequest,
    jobExecutionDetailRequest,

    stopExecutionRequest,
    retryExecutionRequest,
    continueExecutionRequest,

    // 加载状态
    loading: jobExecutionPageRequest.loading || jobExecutionDetailRequest.loading,
    updating: updateStatusRequest.loading ||
      retryExecutionRequest.loading ||
      continueExecutionRequest.loading ||
      stopExecutionRequest.loading ||
      failExecutionRequest.loading ||
      completeExecutionRequest.loading
  };
};
import { useState } from 'react';
import { useRequest } from 'ahooks';

import * as Service from '@/services/JobQueue';
import { ITableData, KeyValues } from '@/common/types/Types';

export default () => {
  // 状态定义
  const [jobQueueData, setJobQueueData] = useState<ITableData>({});
  const [jobQueueInfo, setJobQueueInfo] = useState<KeyValues>({});

  // 分页查询任务队列
  const jobQueuePageRequest = useRequest<ITableData, KeyValues[]>(Service.fetchJobQueuePage, {
    manual: true,
    onSuccess: (result: ITableData) => {
      setJobQueueData(result);
    },
  });

  // 更新任务队列状态
  const updateJobQueueStatusRequest = useRequest(Service.updateJobQueueStatus, {
    manual: true,
    onSuccess: (result, [jobReadyKey, status]) => {
      // 更新列表中对应任务的状态
      const updatedData = {
        ...jobQueueData,
        list: jobQueueData.list?.map((item: KeyValues) => {
          if (item.jobReadyKey === jobReadyKey) {
            return { ...item, status };
          }
          return item;
        }),
      };
      setJobQueueData(updatedData);
    },
  });

  // 查询任务队列详情
  const jobQueueInfoRequest = useRequest<any,any>(Service.fetchJobQueueInfo, {
    manual: true,
    onSuccess: (result) => {
      setJobQueueInfo(result);
    },
  });

  return {
    // 状态数据
    jobQueueData,
    jobQueueInfo,

    // 请求方法
    jobQueuePageRequest,
    updateJobQueueStatusRequest,
    jobQueueInfoRequest,
  };
};
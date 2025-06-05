import {useState} from 'react';
import {useRequest} from 'ahooks';

import * as Service from '@/services/ScheduleJob';
import {ITableData, KeyValues} from '@/common/types/Types';
import {addPageListData, deletePageListData, updatePageListData} from '@/common/utils';

export default () => {
  // 状态定义
  const [scheduleJobData, setScheduleJobData] = useState<ITableData>({});
  const [scheduleJobInfo, setScheduleJobInfo] = useState<KeyValues>({});

  // 分页查询请求
  const scheduleJobPageRequest = useRequest<ITableData, KeyValues[]>(Service.fetchScheduleJobPage, {
    manual: true,
    onSuccess: (result: ITableData) => {
      setScheduleJobData(result);
    },
  });

  // 获取作业详情
  const scheduleJobInfoRequest = useRequest<any, any>(Service.fetchScheduleJobInfo, {
    manual: true,
    onSuccess: (result) => {
      setScheduleJobInfo(result);
    },
  });

  // 创建作业
  const createScheduleJobRequest = useRequest<any, any>(Service.createScheduleJob, {
    manual: true,
    onSuccess: (result) => {
      updateScheduleJob('add', result);
    },
  });

  // 更新作业
  const updateScheduleJobRequest = useRequest<any, any>(Service.updateScheduleJob, {
    manual: true,
    onSuccess: (result) => {
      updateScheduleJob('edit', result);
    },
  });

  // 更新任务状态
  const updateScheduleJobStatusRequest = useRequest<any, any>(Service.updateScheduleJobStatus, {
    manual: true,
    onSuccess: (result, [jobKey, jobStatus]) => {
      updateScheduleJob('edit', { jobKey, jobStatus });
    },
  });

  // 删除任务
  const deleteScheduleJobRequest = useRequest<any, any>(Service.deleteScheduleJob, {
    manual: true,
    onSuccess: (result, [jobKey]) => {
      updateScheduleJob('delete', { jobKey });
    },
  });

  // 统一的数据处理方法
  const updateScheduleJob = (type: string, data: any) => {
    let pageData: ITableData = {};
    if (type === 'add') {
      pageData = addPageListData(scheduleJobData, data) as ITableData;
    } else if (type === 'edit') {
      pageData = updatePageListData(scheduleJobData, data, 'jobKey') as ITableData;
    } else if (type === 'delete') {
      pageData = deletePageListData(scheduleJobData, 'jobKey', data?.jobKey) as ITableData;
    }
    setScheduleJobData(pageData);
  };

  // 执行任务
  const executeJobRequest = useRequest(Service.executeJob, {
    manual: true,
  });

  return {
    // 状态数据
    scheduleJobData,
    scheduleJobInfo,

    // 状态更新方法
    setScheduleJobData,
    setScheduleJobInfo,

    // 请求方法
    scheduleJobPageRequest,
    scheduleJobInfoRequest,
    createScheduleJobRequest,
    updateScheduleJobRequest,
    updateScheduleJobStatusRequest,
    deleteScheduleJobRequest,

    // 执行任务
    executeJobRequest,
  };
};
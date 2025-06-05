import { useState } from 'react';
import { useRequest } from 'ahooks';

import * as Service from '@/services/SysDictionary';
import { ITableData, KeyValues } from '@/common/types/Types';
import { addPageListData, deletePageListData, updatePageListData } from '@/common/utils';

export default () => {
  // 状态定义
  const [dictionaryData, setDictionaryData] = useState<ITableData>({});
  const [dictionaryList, setDictionaryList] = useState<any[]>([]);
  const [dictionaryDetails, setDictionaryDetails] = useState<any>(null);

  // 分页查询字典类型
  const dictionaryTypePageRequest = useRequest<ITableData, KeyValues[]>(Service.fetchDictionaryTypePage, {
    manual: true,
    onSuccess: (result: ITableData) => {
      setDictionaryData(result);
    },
  });

  // 查询字典列表
  const dictionaryListRequest = useRequest<any, any>(Service.fetchDictionaryList, {
    manual: true,
    onSuccess: (result) => {
      setDictionaryList(result);
    },
  });

  // 查询字典详情
  const dictionaryDetailsRequest = useRequest<any, any>(Service.fetchDictionaryDetails, {
    manual: true
  });

  // 保存字典
  const saveDictionaryRequest = useRequest<any, any>(Service.saveDictionary, {
    manual: true
  });

  // 删除字典项
  const deleteDictionaryItemRequest = useRequest<any, any>(Service.deleteDictionaryItem, {
    manual: true,
    onSuccess: (result, [type]) => {
      // 刷新字典列表
      dictionaryListRequest.run(type);
    },
  });

  // 删除字典类型
  const deleteDictionaryTypeRequest = useRequest<any, any>(Service.deleteDictionaryType, {
    manual: true,
  });

  // 更新字典数据
  const updateDictionaryData = (type: string, data: any) => {
    let pageData: ITableData = {};
    if (type === 'add') {
      pageData = addPageListData(dictionaryData, data) as ITableData;
    } else if (type === 'edit') {
      pageData = updatePageListData(dictionaryData, data, 'type') as ITableData;
    } else if (type === 'delete') {
      pageData = deletePageListData(dictionaryData, 'type', data?.type) as ITableData;
    }
    setDictionaryData(pageData);
  };

  return {
    // 状态数据
    dictionaryData,
    dictionaryList,
    dictionaryDetails,

    // 状态更新方法
    setDictionaryData,
    setDictionaryList,
    setDictionaryDetails,
    updateDictionaryData,

    // 请求方法
    dictionaryTypePageRequest,
    dictionaryListRequest,
    dictionaryDetailsRequest,
    saveDictionaryRequest,
    deleteDictionaryItemRequest,
    deleteDictionaryTypeRequest
  };
};
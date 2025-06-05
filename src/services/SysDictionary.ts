import {fetch} from '@/common/request';
import {ITableData, KeyValues} from '@/common/types/Types';

/**
 * 查询字典列表
 * @param type 字典类型
 */
export function fetchDictionaryList(type: string): Promise<any> {
  return fetch(`dictionary/list/${type}`);
}

/**
 * 查询字典详情
 * @param type 字典类型
 */
export function fetchDictionaryDetails(type: string): Promise<any> {
  return fetch(`dictionary/details/${type}`);
}

/**
 * 保存字典列表
 * @param data 字典类型组对象
 */
export function saveDictionary(data: any): Promise<any> {
  return fetch('dictionary/save', {
    method: 'POST',
    data
  });
}

/**
 * 删除字典项
 * @param type 字典类型
 * @param code 字典项代码
 */
export function deleteDictionaryItem(type: string, code: string): Promise<any> {
  return fetch(`dictionary/delete-item/${type}`, {
    method: 'POST',
    params: {
      code
    }
  });
}

/**
 * 删除字典类型
 * @param type 字典类型
 */
export function deleteDictionaryType(type: string): Promise<any> {
  return fetch(`dictionary/delete-type/${type}`, {
    method: 'POST'
  });
}

/**
 * 分页查询字典类型
 * @param params 查询参数
 */
export function fetchDictionaryTypePage(params?: KeyValues): Promise<ITableData> {
  return fetch('dictionary/page-types', {
    params: {
      page: 1,
      size: 20,
      ...params
    }
  });
}
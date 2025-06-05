import { fetch, dataRequest } from '@/common/request';
import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

interface ApproveResult {
  approveInstanceKey: string;
  formData?: any;
  // 其他可能的属性...
}

export const fetchApproveProposer = (data = {}) => {
  return fetch('approve/proposer/page', {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  })
}

export const fetchApproveList = (data = {}) => {
  return fetch('approve/instance/page', {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  })
}

export const fetchAuditHistory = (data = {}) => {
  return fetch('approve/audit/page/history', {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  })
}

export const fetchApproveAudit = (data = {}) => {
  return fetch('approve/audit/page', {
    params: {
      ...DEFAULT_PAGINATION_SETTINGS,
      ...data,
    },
  })
}

export const saveApproveProposer = async (data: any): Promise<ApproveResult> => {
  return fetch('approve/proposer/save', {
    data,
    method: 'post',
  });
}

export const startApprove = (approveInstanceKey: string) => {
  return fetch(`approve/proposer/start/${approveInstanceKey}`, {
    method: 'post',
  });
}

export const revokeApprove = (approveInstanceKey: string) => {
  return fetch(`approve/proposer/revoke/${approveInstanceKey}`, {
    method: 'post',
  });
}

export const approveAudit = (approveInstanceKey: string, message?: string) => {
  return fetch(`approve/audit/approved/${approveInstanceKey}`, {
    method: 'post',
    params: {
      message,
    },
  });
}

export const rejectAudit = (approveInstanceKey: string, message?: string) => {
  return fetch(`approve/audit/reject/${approveInstanceKey}`, {
    method: 'post',
    params: {
      message,
    },
  });
}

export const fetchApproveTypes = () => {
  return fetch('dictionary/list/approveType');
}

export const fetchApproveInfo = (approveInstanceKey: string) => {
  return fetch(`approve/proposer/key/${approveInstanceKey}`);
}

export const fetchApproveAuditInfo = (approveInstanceKey: string) => {
  return fetch(`approve/audit/key/${approveInstanceKey}`);
}

export const deleteApproveProposer = (approveInstanceKey: string) => {
  return fetch(`approve/proposer/key/${approveInstanceKey}`, {
    method: 'delete',
  });
}

export const revokeInstance = (approveInstanceKey: string) => {
  return fetch(`approve/instance/revoke/${approveInstanceKey}`, {
    method: 'post',
  });
}

export const fetchExecutionRecords = (approveInstanceKey: string) => {
  return fetch(`approve/execution/${approveInstanceKey}`);
}

export const fetchInstanceExecutions = (approveInstanceKey: string) => {
  return fetch(`approve/instance/${approveInstanceKey}/executions`);
}

export const reeditApprove = (approveInstanceKey: string) => {
  return fetch(`approve/proposer/reedit/${approveInstanceKey}`, {
    method: 'post',
  });
}

export const fetchExtensionFields = () => {
  return fetch(`approve/extension/fields`);
}

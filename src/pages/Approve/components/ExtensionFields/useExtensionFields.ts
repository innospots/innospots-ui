import { useMemo, useState, useEffect } from 'react';
import { fetchExtensionFields } from '@/services/Approve';

export interface ExtensionField {
  code: string;
  name: string;
  valueType: 'DOUBLE' | 'INTEGER' | 'STRING' | 'DATE';
}

let extensionFieldsCache: ExtensionField[] = [];

export const useExtensionFields = () => {
  const [extensionFields, setExtensionFields] = useState<ExtensionField[]>([]);

  const extensionColumns = useMemo(() => {
    return extensionFields?.map((field) => ({
      key: field.code,
      title: field.name,
      dataIndex: field.code,
      render: (value: any) => value || '-',
    })) || [];
  }, [extensionFields]);

  const getExtensionFields = async () => {
    try {
      const result = await fetchExtensionFields() as ExtensionField[];
      setExtensionFields(result || []);
      extensionFieldsCache = result;
    } catch (error) {
    }
  };

  useEffect(() => {
    if (!extensionFieldsCache?.length) {
      getExtensionFields();
    } else {
      setExtensionFields(extensionFieldsCache);
    }
  }, []);

  return [ extensionFields, extensionColumns ];
};

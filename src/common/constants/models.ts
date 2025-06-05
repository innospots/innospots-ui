export const MODELS = {
  vectorModel: [
    {
      id: 'alicloud',
      name: '阿里云',
    },
  ],
  textModel: [
    {
      id: 'deepseek',
      name: 'DeepSeek',
      children: [
        {
          id: 'deepseek-coder',
          name: 'DeepSeek Coder',
        },
      ],
    },
  ],
  imageModel: [
    {
      id: 'deepseek',
      name: 'DeepSeek',
    },
  ],
};

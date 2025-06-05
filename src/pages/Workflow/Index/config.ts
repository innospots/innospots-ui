export const BUTTON_PERMISSION_MAP = {
  approval: {
    createCategory: 'Approval-WorkflowCategory-createCategory',
    deleteCategory: 'Approval-WorkflowCategory-deleteCategory',
    updateCategory: 'Approval-WorkflowCategory-updateCategory',
    createWorkflow: 'Approval-WorkflowInstance-createWorkflow', // 新建工作流
    updateWorkflow: 'Approval-WorkflowInstance-updateWorkflow', // 编辑工作流
    updateDataStatus: 'Approval-WorkflowInstance-updateDataStatus', // 编辑状态
    deleteWorkflowInstance: 'Approval-WorkflowInstance-deleteWorkflowInstance',
    removeWorkflowToRecycle: 'Approval-WorkflowInstance-removeWorkflowToRecycle',

    builderOpt: 'Approval-workflow-builder-opt',
    executeWorkflow: 'Approval-workflow-builder-execute',
    builderPublish: 'Approval-WorkflowBuilder-publish',
  },

  events: {
    createCategory: 'Event-WorkflowCategory-createCategory',
    deleteCategory: 'Event-WorkflowCategory-deleteCategory',
    updateCategory: 'Event-WorkflowCategory-updateCategory',
    createWorkflow: 'Event-WorkflowInstance-createWorkflow', // 新建工作流
    updateWorkflow: 'Event-WorkflowInstance-updateWorkflow', // 编辑工作流
    updateDataStatus: 'Event-WorkflowInstance-updateDataStatus', // 编辑状态
    deleteWorkflowInstance: 'Event-WorkflowInstance-deleteWorkflowInstance',
    removeWorkflowToRecycle: 'Event-WorkflowInstance-removeWorkflowToRecycle',

    builderOpt: 'Event-workflow-builder-opt',
    executeWorkflow: 'Event-workflow-builder-execute',
    builderPublish: 'Event-WorkflowBuilder-publish',
  },

  job: {
    createCategory: 'Job-bWorkflowCategory-createCategory',
    deleteCategory: 'Job-WorkflowCategory-deleteCategory',
    updateCategory: 'Job-WorkflowCategory-updateCategory',
    createWorkflow: 'Job-WorkflowInstance-createWorkflow', // 新建工作流
    updateWorkflow: 'Job-WorkflowInstance-updateWorkflow', // 编辑工作流
    updateDataStatus: 'Job-WorkflowInstance-updateDataStatus', // 编辑状态
    deleteWorkflowInstance: 'Job-WorkflowInstance-deleteWorkflowInstance',
    removeWorkflowToRecycle: 'Job-WorkflowInstance-removeWorkflowToRecycle',

    builderOpt: 'Job-workflow-builder-opt',
    executeWorkflow: 'Job-workflow-builder-execute',
    builderPublish: 'Job-WorkflowBuilder-publish',
  }
}

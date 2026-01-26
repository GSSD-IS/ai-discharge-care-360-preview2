import { WorkflowDefinitionSchema } from '../types/workflow.types';

/**
 * 建立流程 DTO
 */
export class CreateWorkflowDto {
    name: string;
    description?: string;
    definition: WorkflowDefinitionSchema;
}

/**
 * 更新流程 DTO
 */
export class UpdateWorkflowDto {
    name?: string;
    description?: string;
    definition?: WorkflowDefinitionSchema;
}

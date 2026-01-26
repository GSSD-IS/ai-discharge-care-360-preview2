/**
 * 表單欄位類型
 */
export const FormFieldType = {
    TEXT: 'TEXT',
    NUMBER: 'NUMBER',
    DATE: 'DATE',
    SELECT: 'SELECT',
    CHECKBOX: 'CHECKBOX',
    TEXTAREA: 'TEXTAREA',
    RADIO: 'RADIO',
} as const;

export type FormFieldType = typeof FormFieldType[keyof typeof FormFieldType];

/**
 * 單一表單欄位定義
 */
export interface FormField {
    id: string;
    type: FormFieldType;
    label: string;
    required: boolean;
    placeholder?: string;
    helpText?: string;
    options?: { value: string; label: string }[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
}

/**
 * 完整表單定義 (存於 JSON 欄位)
 */
export interface FormDefinitionSchema {
    fields: FormField[];
}

/**
 * 表單提交資料結構
 */
export interface FormSubmissionData {
    [fieldId: string]: string | number | boolean | string[];
}

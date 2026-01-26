import { useState, useCallback } from 'react';
import { FormFieldType, type FormDefinitionSchema, type FormSubmissionData } from '../../types/form.types';
import {
    TextField,
    NumberField,
    TextAreaField,
    SelectField,
    RadioField,
    CheckboxField,
    DateField,
} from './FormFieldComponents';

interface FormRendererProps {
    schema: FormDefinitionSchema;
    initialData?: FormSubmissionData;
    onSubmit: (data: FormSubmissionData) => Promise<void>;
    readOnly?: boolean;
}

export function FormRenderer({ schema, initialData = {}, onSubmit, readOnly = false }: FormRendererProps) {
    const [formData, setFormData] = useState<FormSubmissionData>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((fieldId: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }));

        // Clear error when user changes value
        if (errors[fieldId]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    }, [errors]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        schema.fields.forEach((field) => {
            const value = formData[field.id];

            // Required check
            if (field.required) {
                if (value === undefined || value === null || value === '') {
                    newErrors[field.id] = '此欄位必填';
                    isValid = false;
                }
                if (Array.isArray(value) && value.length === 0) {
                    newErrors[field.id] = '請至少選擇一項';
                    isValid = false;
                }
            }

            // Numeric logic
            if (field.type === FormFieldType.NUMBER && value !== undefined && value !== '') {
                const numVal = Number(value);
                if (field.validation?.min !== undefined && numVal < field.validation.min) {
                    newErrors[field.id] = `最小值為 ${field.validation.min}`;
                    isValid = false;
                }
                if (field.validation?.max !== undefined && numVal > field.validation.max) {
                    newErrors[field.id] = `最大值為 ${field.validation.max}`;
                    isValid = false;
                }
            }

            // Regex pattern check
            if (field.validation?.pattern && typeof value === 'string' && value) {
                const regex = new RegExp(field.validation.pattern);
                if (!regex.test(value)) {
                    newErrors[field.id] = field.validation.message || '格式不符';
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Submit error:', error);
            alert('提交失敗，請重試');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!schema || !schema.fields) {
        return <div>無效的表單定義</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
            {schema.fields.map((field) => {
                const commonProps = {
                    key: field.id,
                    field,
                    value: formData[field.id],
                    onChange: (val: any) => handleChange(field.id, val),
                    error: errors[field.id],
                };

                // Read-only view logic could be added here
                if (readOnly) {
                    return (
                        <div key={field.id} className="mb-4 border-b pb-2">
                            <label className="text-sm text-gray-500">{field.label}</label>
                            <div className="text-lg text-gray-800 font-medium">
                                {Array.isArray(formData[field.id])
                                    ? (formData[field.id] as string[]).join(', ')
                                    : String(formData[field.id] || '-')}
                            </div>
                        </div>
                    );
                }

                switch (field.type) {
                    case FormFieldType.TEXT:
                        return <TextField {...commonProps} />;
                    case FormFieldType.NUMBER:
                        return <NumberField {...commonProps} />;
                    case FormFieldType.TEXTAREA:
                        return <TextAreaField {...commonProps} />;
                    case FormFieldType.SELECT:
                        return <SelectField {...commonProps} />;
                    case FormFieldType.RADIO:
                        return <RadioField {...commonProps} />;
                    case FormFieldType.CHECKBOX:
                        return <CheckboxField {...commonProps} />;
                    case FormFieldType.DATE:
                        return <DateField {...commonProps} />;
                    default:
                        return <div key={field.id}>不支援的欄位類型: {field.type}</div>;
                }
            })}

            {!readOnly && (
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors 
                            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? '提交中...' : '送出表單'}
                    </button>
                </div>
            )}
        </form>
    );
}

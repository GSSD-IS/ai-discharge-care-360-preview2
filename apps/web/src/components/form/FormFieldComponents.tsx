import React from 'react';
import type { FormField } from '../../types/form.types';

interface FieldProps {
    field: FormField;
    value: any;
    onChange: (value: any) => void;
    error?: string;
}

export const TextField: React.FC<FieldProps> = ({ field, value, onChange, error }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
        {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
);

export const NumberField: React.FC<FieldProps> = ({ field, value, onChange, error }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            min={field.validation?.min}
            max={field.validation?.max}
        />
        {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
);

export const TextAreaField: React.FC<FieldProps> = ({ field, value, onChange, error }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[100px]"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
        {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
);

export const SelectField: React.FC<FieldProps> = ({ field, value, onChange, error }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">請選擇</option>
            {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
);

export const RadioField: React.FC<FieldProps> = ({ field, value, onChange, error }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex flex-col gap-2">
            {field.options?.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name={field.id}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={(e) => onChange(e.target.value)}
                        className="text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-gray-700">{opt.label}</span>
                </label>
            ))}
        </div>
        {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
);

export const CheckboxField: React.FC<FieldProps> = ({ field, value, onChange, error }) => {
    // Checkbox value can be array (multiple) or boolean (single)
    // Here we assume multiple choice if options exist, otherwise single boolean
    const isMultiple = !!field.options;

    const handleChange = (checked: boolean, optionValue?: string) => {
        if (!isMultiple) {
            onChange(checked);
            return;
        }

        const currentValues = (value as string[]) || [];
        if (checked && optionValue) {
            onChange([...currentValues, optionValue]);
        } else if (optionValue) {
            onChange(currentValues.filter((v) => v !== optionValue));
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>

            {isMultiple ? (
                <div className="flex flex-col gap-2">
                    {field.options?.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                value={opt.value}
                                checked={((value as string[]) || []).includes(opt.value)}
                                onChange={(e) => handleChange(e.target.checked, opt.value)}
                                className="text-sky-500 focus:ring-sky-500 rounded"
                            />
                            <span className="text-gray-700">{opt.label}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => handleChange(e.target.checked)}
                        className="text-sky-500 focus:ring-sky-500 rounded"
                    />
                    <span className="text-gray-700">是 / 否</span>
                </label>
            )}

            {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export const DateField: React.FC<FieldProps> = ({ field, value, onChange, error }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
        {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
);

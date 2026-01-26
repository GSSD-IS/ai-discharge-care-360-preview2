import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreateFormDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsObject()
    definition: Record<string, unknown>;

    @IsOptional()
    @IsArray()
    nodeBindings?: string[];
}

export class UpdateFormDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsObject()
    definition?: Record<string, unknown>;

    @IsOptional()
    @IsArray()
    nodeBindings?: string[];
}

export class SubmitFormDto {
    @IsString()
    patientId: string;

    @IsObject()
    data: Record<string, unknown>;
}

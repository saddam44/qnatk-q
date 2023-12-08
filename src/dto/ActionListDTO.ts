import {
    IsString,
    IsNotEmpty,
    ValidateNested,
    IsObject,
    IsArray,
    IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class UIOptionsDTO {
    @IsString()
    mode: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LayoutRow)
    layout?: LayoutRow[];

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => FieldSchema)
    fields?: Record<string, FieldSchema>;

    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    message: string;

    @IsNotEmpty()
    okLabel: string;

    @IsNotEmpty()
    cancelLabel: string;
}

class FieldSchema {
    @IsString()
    type: string;

    @IsString()
    label: string;

    @IsOptional()
    defaultValue: any;

    @IsOptional()
    @IsArray()
    validation: any[]; // Define validation rules here

    // ... add more field properties if needed
}

class LayoutColumn {
    @IsString()
    fieldKey: string;

    @IsOptional()
    width?: number;

    @IsOptional()
    @IsString()
    class?: string;
}

class LayoutRow {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LayoutColumn)
    columns: LayoutColumn[];
}

export class ActionDTO {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    label: string;

    @IsNotEmpty()
    icon: string;

    @IsString()
    @IsOptional()
    iconColor?: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    mode: string;

    @IsObject()
    @ValidateNested()
    @Type(() => UIOptionsDTO)
    ui: UIOptionsDTO;

    @IsString()
    @IsOptional()
    loadBy?: string;

    @IsArray()
    @IsString({ each: true })
    roles: string[];

    @IsOptional()
    @IsObject()
    condition?: Record<string, any>;

    @IsOptional()
    @IsObject()
    returnModel: Record<string, any> | boolean = false;
}

export type ActionListDTO = Record<string, ActionDTO>;

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

    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    message: string;

    @IsNotEmpty()
    okLabel: string;

    @IsNotEmpty()
    cancelLabel: string;
}

export class ActionListDTO {
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

    @IsObject()
    @IsOptional()
    condition?: Record<string, any>;

    @IsObject()
    @IsOptional()
    returnModel: Record<string, any> | boolean = false;
}

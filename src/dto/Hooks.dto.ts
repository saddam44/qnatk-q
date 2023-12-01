import { Model } from 'sequelize-typescript';
import { ActionListDTO } from './ActionListDTO';

export interface BeforeHookParams<DataDTO, UserDTO = any> {
    data: DataDTO;
    user: UserDTO;
}

export interface BeforeActionExecuteParams<RecordDTO = any, UserDTO = any> {
    data: {
        action: ActionListDTO;
        record: RecordDTO;
    };
    user: UserDTO;
}

export interface ActionExecuteParams<
    ModelType extends Model,
    RecordDTO = any,
    UserDTO = any,
> {
    data: {
        action: ActionListDTO;
        record: RecordDTO;
    };
    user: UserDTO;
    modelInstance: ModelType;
}

export interface BulkBeforeActionExecuteParams<RecordDTO = any, UserDTO = any> {
    data: {
        action: ActionListDTO;
        records: RecordDTO;
    };
    user: UserDTO;
}

export interface BulkActionExecuteParams<
    ModelType extends Model,
    RecordDTO = any,
    UserDTO = any,
> {
    data: {
        action: ActionListDTO;
        records: RecordDTO;
    };
    user: UserDTO;
    modelInstances: ModelType;
}

export interface BeforeHookParamsWithFiles<RecordDTO = any, UserDTO = any> {
    data: RecordDTO;
    user: UserDTO;
    files: File[];
}

export interface AfterHookParams<
    ModelType extends Model,
    RecordDTO = any,
    UserDTO = any,
> {
    data: RecordDTO;
    user: UserDTO;
    modelInstance: ModelType;
}

export interface AfterHookParamsWithFiles<
    ModelType extends Model,
    RecordDTO = any,
    UserDTO = any,
> {
    data: RecordDTO;
    user: UserDTO;
    modelInstance: ModelType;
    files: File[];
}

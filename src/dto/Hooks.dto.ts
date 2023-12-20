import { Model } from 'sequelize-typescript';
import { ActionDTO, ActionListDTO } from './ActionListDTO';

export interface BeforeHookParams<DataDTO, UserDTO = any> {
    data: DataDTO;
    user: UserDTO;
}

export interface BeforeActionExecuteParams<
    ModelType extends Model,
    RecordDTO = any,
    UserDTO = any,
> {
    action: ActionDTO;
    data: RecordDTO;
    user: UserDTO;
    modelInstance: ModelType;
}

export interface ActionExecuteParams<
    ModelType extends Model,
    RecordDTO = any,
    UserDTO = any,
> {
    action: ActionDTO;
    data: RecordDTO;
    user: UserDTO;
    modelInstance: ModelType;
}

export interface AfterActionExecuteParams<
    ModelType extends Model,
    RecordDTO = any,
    UserDTO = any,
> {
    action: ActionDTO;
    data: RecordDTO;
    user: UserDTO;
    modelInstance: ModelType;
}

export interface BulkBeforeActionExecuteParams<RecordDTO = any, UserDTO = any> {
    action: ActionDTO;
    data: RecordDTO;
    user: UserDTO;
}

export interface BulkActionExecuteParams<
    ModelType extends Model,
    RecordDTO = any,
    UserDTO = any,
> {
    action: ActionDTO;
    data: RecordDTO;
    user: UserDTO;
    modelInstances: ModelType;
}

export interface BeforeHookParamsWithFiles<RecordDTO = any, UserDTO = any> {
    data: RecordDTO;
    user: UserDTO;
    files: Array<Express.Multer.File>;
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
    files: Array<Express.Multer.File>;
}

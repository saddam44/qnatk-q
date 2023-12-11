import { Injectable } from '@nestjs/common';
import { Model, Sequelize } from 'sequelize-typescript';
import { QnatkService } from './qnatk.service';
import { HooksService } from './hooks/hooks.service';
import { QnatkListDTO } from './dto/QnatkListDTO';

@Injectable()
export class QnatkControllerService {
    constructor(
        private readonly qnatkService: QnatkService,
        private readonly hooksService: HooksService,
        private sequelize: Sequelize,
    ) {}

    async list(
        baseModel: string,
        body: QnatkListDTO,
    ): Promise<Model<any, any>[]> {
        return await this.qnatkService.findAll(baseModel, body);
    }

    async listAndCount(baseModel: string, body: QnatkListDTO) {
        return {
            ...(await this.qnatkService.findAndCountAll(baseModel, body)),
            actions: await this.qnatkService.getActions(baseModel),
        };
    }

    async addNew<UserDTO = any>(baseModel: string, data: any, user: UserDTO) {
        const final_data = await this.sequelize.transaction(
            async (transaction) => {
                const validated_data = await this.hooksService.triggerHooks(
                    `beforeCreate:${baseModel}`,
                    {
                        data,
                        user,
                    },
                    transaction,
                );

                const model_instance = await this.qnatkService.addNew(
                    baseModel,
                    validated_data.data,
                    transaction,
                );

                return await this.hooksService.triggerHooks(
                    `afterCreate:${baseModel}`,
                    {
                        ...validated_data,
                        modelInstance: model_instance,
                    },
                    transaction,
                );
            },
        );

        return {
            ...final_data,
            message: `Action executed successfully`,
        };
    }

    async addNewWithFile<UserDTO = any>(
        baseModel: string,
        data: any,
        files: Array<Express.Multer.File>,
        user: UserDTO,
    ) {
        const final_data = await this.sequelize
            .transaction(async (transaction) => {
                // console.log('files', files);
                const validated_data = await this.hooksService.triggerHooks(
                    `beforeCreate:${baseModel}`,
                    {
                        data,
                        files,
                        user,
                    },
                    transaction,
                );

                console.log('validated_data', validated_data);

                const data_returned = await this.qnatkService.addNew(
                    baseModel,
                    validated_data.data,
                    transaction,
                );

                return await this.hooksService.triggerHooks(
                    `afterCreate:${baseModel}`,
                    {
                        ...validated_data,
                        modelInstance: data_returned,
                    },
                    transaction,
                );
            })
            .catch((err) => {
                console.log(err);
                throw err;
            });
        return {
            ...final_data,
            message: `Action executed successfully`,
        };
    }

    async executeAction<UserDTO = any>(
        baseModel: string,
        action: any,
        data: any,
        user: UserDTO,
    ) {
        const final_data = await this.sequelize.transaction(
            async (transaction) => {
                // console.log('files', files);
                const validated_data = await this.hooksService.triggerHooks(
                    `before:${baseModel}:${action}`,
                    {
                        data,
                        user,
                    },
                    transaction,
                );

                const model_instance =
                    await this.qnatkService.findOneFormActionInfo(
                        baseModel,
                        validated_data.data.action,
                        validated_data,
                        transaction,
                    );

                const executedData = await this.hooksService.triggerHooks(
                    `execute:${baseModel}:${action}`,
                    {
                        ...validated_data,
                        modelInstance: model_instance,
                    },
                    transaction,
                );

                return await this.hooksService.triggerHooks(
                    `after:${baseModel}:${action}`,
                    {
                        ...validated_data,
                        // ...executedData,
                        modelInstance: executedData,
                    },
                    transaction,
                );
            },
        );

        return {
            ...final_data,
            modelInstance: data.action.returnModel
                ? final_data.modelInstance
                : undefined,
            data: undefined,
            user: undefined,
            message: `Action ${action} executed successfully`,
        };
    }

    async bulkExecuteAction<UserDTO = any>(
        baseModel: string,
        action: any,
        data: any,
        user: UserDTO,
    ) {
        const final_data = await this.sequelize.transaction(
            async (transaction) => {
                // console.log('files', files);
                const validated_data = await this.hooksService.triggerHooks(
                    `before:${baseModel}:bulk-${action}`,
                    {
                        data,
                        user,
                    },
                    transaction,
                );

                const model_instance =
                    await this.qnatkService.findAllFormActionInfo(
                        baseModel,
                        validated_data.data.action,
                        validated_data,
                        transaction,
                    );

                console.log('model_instance', model_instance);

                const executedData = await this.hooksService.triggerHooks(
                    `execute:${baseModel}:bulk-${action}`,
                    {
                        ...validated_data,
                        modelInstances: model_instance,
                    },
                    transaction,
                );

                return await this.hooksService.triggerHooks(
                    `after:${baseModel}:bulk-${action}`,
                    {
                        ...validated_data,
                        modelInstance: executedData,
                    },
                    transaction,
                );
            },
        );

        return {
            ...final_data,
            modelInstance: data.action.returnModel
                ? final_data.modelInstance
                : undefined,
            data: undefined,
            user: undefined,
            message: `Action ${action} executed successfully`,
        };
    }
}

import { Transaction } from 'sequelize';
import { HookInterface } from './hook.interface';
import { validateOrReject, ValidationError } from 'class-validator';
import { ValidationException } from '../Exceptions/ValidationException';
import { plainToInstance } from 'class-transformer';

export abstract class BaseHook implements HookInterface {
    priority: number = 0;

    // Define the `execute` method as abstract so that derived classes must implement it.
    abstract execute(
        previousData: any,
        originalData: any,
        transaction: Transaction | undefined,
        extraInfo?: any,
        passedExtraData?: Record<string, any>,
    ): Promise<any>;

    // Method to validate data against a DTO and return the DTO object
    async validateData<T extends object>(
        data: T,
        DTOClass: new () => T,
    ): Promise<T> {
        let dtoInstance;

        // Check if data is already an instance of DTOClass
        if (data instanceof DTOClass) {
            dtoInstance = data;
        } else {
            // Convert plain data to DTO instance
            dtoInstance = plainToInstance(DTOClass, data);
        }

        try {
            await validateOrReject(dtoInstance);
            return dtoInstance;
        } catch (errors) {
            console.log(errors);
            throw new ValidationException(
                this.mapValidationErrors(errors as ValidationError[]),
            );
        }
    }

    mapValidationErrors(
        validationErrors: ValidationError[],
    ): Record<string, string[]> {
        return validationErrors.reduce((acc, err) => {
            const constraints = err.constraints;
            acc[err.property] = constraints
                ? [Object.values(constraints).join('. ')]
                : ['An error occurred'];
            return acc;
        }, {});
    }
}

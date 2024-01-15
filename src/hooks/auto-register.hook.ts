import * as fs from 'fs';
import * as path from 'path';
import { Type } from '@nestjs/common';
import { HookSymbol } from './hook.decorator';
import { HooksService } from './hooks.service';
import { HookInterface } from './hook.interface';
import { ModuleRef } from '@nestjs/core';

async function importHooksFromDirectory(directoryPath: string): Promise<any[]> {
    console.log('importHooksFromDirectory', directoryPath);
    let hookFiles = [];
    const files = fs.readdirSync(directoryPath, { withFileTypes: true });
    for (const file of files) {
        const resolvedPath = path.resolve(directoryPath, file.name);
        if (file.isDirectory()) {
            hookFiles = [
                ...hookFiles,
                ...(await importHooksFromDirectory(resolvedPath)),
            ];
        } else if (
            file.name.endsWith('.service.hook.js') ||
            file.name.endsWith('.service.hook.ts')
        ) {
            hookFiles.push(resolvedPath);
        }
    }
    return hookFiles;
}

export async function AutoRegisterHooks(
    moduleRef: ModuleRef,
    hooksService: HooksService,
    directoryPath: string,
) {
    const hookFilePaths = await importHooksFromDirectory(directoryPath);
    console.log('hookFilePaths', hookFilePaths);

    for (const filePath of hookFilePaths) {
        const hookModule = await import(filePath);
        for (const exported of Object.values(hookModule)) {
            if (typeof exported === 'function' && exported.prototype) {
                const eventPattern = Reflect.getMetadata(HookSymbol, exported);
                if (eventPattern) {
                    const HookType: Type<any> = exported as Type<any>;
                    const instance = await moduleRef.create(HookType);
                    hooksService.registerHook(
                        eventPattern,
                        instance as HookInterface,
                    );
                }
            }
        }
    }
}

import fs from 'fs';
import path from 'path';
import { UrlItem } from '../types/url-item';

const fileExists = (filePath: string): boolean => {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

const CONFIG_FILE_NAME = 'config.ini';

// 使用 IIFE 初始化 configFilePath
const configFilePath: string = (() => {
    let filePath: string | undefined;

    // 检查 /app 目录下的 config.ini 是否存在
    const appConfigPath = path.join('/app', CONFIG_FILE_NAME);
    if (fileExists(appConfigPath)) {
        filePath = appConfigPath;
        console.log(`Found config file at: ${filePath}`); // 输出找到的文件路径
    } else {
        // 检查当前工作目录下的 config.ini 是否存在
        const cwdConfigPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);
        if (fileExists(cwdConfigPath)) {
            filePath = cwdConfigPath;
            console.log(`Found config file at: ${filePath}`); // 输出找到的文件路径
        } else {
            throw new Error('Neither /app nor the current working directory contains a "config.ini" file.');
        }
    }

    return filePath!;
})();

const readConfigFile = (): string[] => {
    if (!configFilePath) {
        throw new Error('Configuration file path is not set.');
    }
    try {
        const data = fs.readFileSync(configFilePath, 'utf-8');
        return data.trim().split('\n');
    } catch (error) {
        return [];
    }
};

const parseConfig = (configLines: string[]): UrlItem[] => {
    return configLines.map((line, index) => {
        const isCommented = line.trim().startsWith('#');
        const lineContent = line.trim().replace(/^#/, '').trim();

        const [url, description] = lineContent.split(',', 2);
        return {
            id: (index + 1).toString(),
            isCommented,
            url: url.trim(),
            description: description ? description.trim() : '',
        };
    });
};

const saveConfigFile = (configLines: string[]) => {
    if (!configFilePath) {
        throw new Error('Configuration file path is not set.');
    }
    fs.writeFileSync(configFilePath, configLines.join('\n'), 'utf-8');
};

export function getUrls(): UrlItem[] {
    const configLines = readConfigFile();
    return parseConfig(configLines);
}

export function updateUrl(id: string, isCommented: boolean): UrlItem | undefined {
    const configLines = readConfigFile();
    const index = parseInt(id) - 1;

    if (index >= 0 && index < configLines.length) {
        const line = configLines[index];
        configLines[index] = isCommented ? `#${line.replace(/^#/, '')}` : line.replace(/^#/, '');
        saveConfigFile(configLines);
        return parseConfig(configLines)[index];
    }

    return undefined;
}

export function addUrl(url: string, description: string): UrlItem {
    const configLines = readConfigFile();
    const newEntry = description ? `${url}, ${description}` : url;
    configLines.push(newEntry);
    saveConfigFile(configLines);

    const updatedUrls = parseConfig(configLines);
    return updatedUrls[updatedUrls.length - 1];
}

export function deleteUrl(id: string): boolean {
    const configLines = readConfigFile();
    const index = parseInt(id) - 1;

    if (index >= 0 && index < configLines.length) {
        configLines.splice(index, 1);
        saveConfigFile(configLines);
        return true;
    }

    return false;
}


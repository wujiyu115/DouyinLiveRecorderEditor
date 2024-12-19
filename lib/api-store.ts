import fs from 'fs';
import path from 'path';
import ini from 'ini';

/**
 * 判断给定路径是否指向一个存在的文件。
 * @param {string} filePath - 文件路径。
 * @returns {boolean} - 路径是否存在且是文件。
 */
const fileExists = (filePath: string): boolean => {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
};

const CONFIG_FILE_NAME = 'api.ini';

/**
 * 初始化配置文件路径。
 * 首先检查 `/app` 目录下是否存在配置文件，如果不存在，则检查当前工作目录。
 * @returns {string} - 配置文件的绝对路径。
 */
const configFilePath: string = (() => {
    const appConfigPath = path.join('/app', CONFIG_FILE_NAME);
    const cwdConfigPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);

    if (fileExists(appConfigPath)) {
        return appConfigPath;
    } else if (fileExists(cwdConfigPath)) {
        return cwdConfigPath;
    } else {
        throw new Error('Neither /app nor the current working directory contains an "api.ini" file.');
    }
})();

console.log(`Found config file at: ${configFilePath}`); // 输出找到的文件路径

/**
 * 从配置文件中读取内容并解析成对象。
 * @returns {any} - 解析后的配置对象。
 */
const readConfigFileOnce = (): any => {
    if (!configFilePath) {
        throw new Error('Configuration file path is not set.');
    }
    try {
        const configFileContent = fs.readFileSync(configFilePath, 'utf-8');
        return ini.parse(configFileContent);
    } catch (error) {
        console.error('Failed to parse configuration file:', error);
        return {};
    }
};

// 使用 IIFE 执行 readConfigFileOnce 并缓存结果
const cachedConfig = (() => {
    try {
        return readConfigFileOnce();
    } catch (error) {
        console.error('Failed to initialize configuration:', error);
        return {};
    }
})();

export { cachedConfig };
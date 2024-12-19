import { cachedConfig } from '../../../lib/api-store';

/**
 * 获取录制数据的异步函数
 */
export async function GET(): Promise<Response> {
    try {
        // 获取缓存配置中的 URL
        const url = cachedConfig.url;

        // 检查 URL 是否存在
        if (!url) {
            return createErrorResponse('URL not found in config', 400);
        }

        // 设置超时时间
        const timeoutMs = 3000;

        // 创建一个超时 Promise
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
        );

        // Fetch data from the URL
        const fetchPromise = fetch(url);

        // 使用 Promise.race 来竞赛 fetch 和 timeout
        const response: Response | Error = await Promise.race([fetchPromise, timeoutPromise]) as Response | Error;

        // 检查是否是超时错误
        if (response instanceof Error) {
            throw response;
        }

        // 检查响应是否有效
        if (!response.ok) {
            return createErrorResponse('Invalid response', response.status);
        }

        // 将响应转换为 JSON 格式的数据
        const data = await response.json();

        // 返回成功响应
        return createSuccessResponse(data);

    } catch (error) {
        // 记录错误日志并返回失败响应
        console.error('Error fetching recordings:', error);

        let errorMessage = 'Failed to fetch recordings';

        // 检查是否是由于超时引起的错误
        if ((error as Error).message === 'Request timed out') {
            errorMessage = 'Request timed out';
        }

        return createErrorResponse(errorMessage, 500);
    }
}

/**
 * 创建错误响应对象
 * @param message 错误信息
 * @param statusCode HTTP状态码
 * @returns 响应对象
 */
function createErrorResponse(message: string, statusCode: number): Response {
    return new Response(JSON.stringify({ error: message }), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * 创建成功响应对象
 * @param data 数据内容
 * @returns 响应对象
 */
function createSuccessResponse(data: any): Response {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
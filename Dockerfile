# 使用官方 Node.js 镜像作为基础镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 只安装生产环境所需的依赖
RUN npm ci --only=production && \
    # 单独安装开发依赖，用于构建
    npm ci --only=development && \
    # 创建.next目录的所有者
    mkdir -p .next && \
    # 设置权限
    chown -R node:node /app

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段 - 使用更小的基础镜像
FROM node:18-alpine AS production

# 设置工作目录
WORKDIR /app

# 设置为非root用户
USER node

# 设置环境变量
ENV NODE_ENV production

# 只复制生产环境所需的文件
COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/package-lock.json ./
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public

# 只安装生产依赖，不安装开发依赖
RUN npm ci --only=production && \
    # 清理npm缓存以减小镜像大小
    npm cache clean --force

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]


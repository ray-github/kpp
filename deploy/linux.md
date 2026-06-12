# Linux ECS 部署指南（无 Docker）

适用：Ubuntu ECS + 本机 PostgreSQL + 本机 Redis + Node + PM2。

## 1. 把代码弄到 ECS

### 方式 A：Git（推荐）

```bash
sudo mkdir -p /opt/kpp && sudo chown $USER:$USER /opt/kpp
git clone <你的仓库地址> /opt/kpp
cd /opt/kpp
```

### 方式 B：本机打包上传

在本机 Windows 项目根目录打包（排除 node_modules、dist）后 `scp` 到 ECS，解压到 `/opt/kpp`。

## 2. 配置环境变量

```bash
cd /opt/kpp
cp .env.production.example .env
nano .env
```

必填：

- `DATABASE_URL` — `postgres` 用户 + `kpp` 库；密码含 `!` 等需 URL 编码（`!` → `%21`）
- `JWT_SECRET` — 生产环境随机长字符串
- `REDIS_URL` — 默认 `redis://127.0.0.1:6379`

## 3. 安装依赖、生成 Prisma、构建

```bash
cd /opt/kpp
npm install

npm run prisma:generate
# 若已从本地 pg_restore 导入整库，可跳过；否则首次部署需执行：
# npm run prisma:deploy

npm run build:api
```

## 4. PM2 启动

```bash
cd /opt/kpp
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # 按提示执行输出的 sudo 命令
```

或使用 npm 脚本（会先 build）：

```bash
npm run start:api:prod
```

## 5. 验证

```bash
curl http://127.0.0.1:3000/api/catalog/categories
curl http://<ECS公网IP>:3000/api/catalog/categories
```

Swagger：`http://<ECS公网IP>:3000/docs`

## 6. 小程序联调

本地 `apps/miniapp/.env`：

```env
TARO_APP_API_BASE=http://<ECS公网IP>:3000/api
TARO_APP_USE_MOCK=false
```

开发者工具勾选「不校验合法域名」。

## 更新发布

```bash
cd /opt/kpp
git pull
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed --workspace=apps/api
npm run build:api
npm run pm2:restart
```

课程封面与轮播图由 API 静态目录 `apps/api/public/assets` 提供，访问路径形如：
`http://<ECS公网IP>:3000/assets/courses/course-math.png`

小程序联调时除 `request` 域名外，还需在微信后台配置 **downloadFile 合法域名**（与 API 同域），否则课程封面图可能无法显示。

## 常用命令

| 操作 | 命令 |
|------|------|
| 日志 | `pm2 logs kpp-api` |
| 状态 | `pm2 status` |
| 重启 | `pm2 restart kpp-api` |
| PG | `sudo systemctl status postgresql` |
| Redis | `sudo systemctl status redis-server` |

## 从本地 Windows 导库

见项目计划文档「从本地 Windows 导库到 Linux ECS」章节，或：

```powershell
# Windows
$env:PGPASSWORD = '本地密码'
pg_dump -U postgres -h localhost -d kpp -F c -f D:\backup\kpp.dump
scp D:\backup\kpp.dump user@<ECS_IP>:~/kpp.dump
```

```bash
# ECS
PGPASSWORD='ECS密码' pg_restore -h 127.0.0.1 -U postgres -d kpp -c --no-owner --no-acl ~/kpp.dump
```

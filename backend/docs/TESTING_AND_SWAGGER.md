## Swagger(OpenAPI) 文档（可打印）

### 在线查看/试跑 API
- 启动后端：`npm run start:dev`
- 打开 Swagger UI：`http://127.0.0.1:3002/api-docs`

### 如何在 Swagger 里“识别当前登录用户”（JWT）
- 先调用 `POST /auth/login`（使用种子账号：`admin@example.com` / `manager@example.com` / `test@example.com`，密码默认 `123456`）
- 拿到 `access_token` 后，在 Swagger UI 右上角 **Authorize** → 选择 **Bearer** → 粘贴 token（不用加 `Bearer ` 前缀也可以）
- 之后所有受保护接口都会自动带上 `Authorization: Bearer <token>`

### 导出 OpenAPI JSON（用于打印/提交）
在 `backend/` 目录执行：
- `npm run swagger:export`

会生成：
- `backend/docs/openapi.json`

打印方式建议：
- 用浏览器打开 `backend/docs/openapi.json`（或导入任意 Swagger Editor/Viewer）→ Print to PDF

---

## Postman 测试（Test Script）

交付物在：
- `backend/postman/dashboard-api.postman_collection.json`
- `backend/postman/dashboard-api.postman_environment.json`

### 推荐执行顺序
在 Postman：
- Import collection + environment
- 选择环境（Environment）后点击 Collection 的 **Run**
- 先跑文件夹 **Auth (JWT)**（会把 `adminToken/managerToken/userToken` 写入 environment）
- 再跑其它接口测试（会自动用 `Authorization: Bearer {{...Token}}`）

### 本周要求覆盖点（每条 API 的测试点）
- 连通性：Status code
- 非法输入：空值/格式错误（验证 400/403 等）
- 返回格式：JSON body + 关键字段存在
- 性能：responseTime 阈值（默认 < 1000ms，可按需要改）


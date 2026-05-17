## Postman 测试脚本（Test Script）交付说明

### 文件位置（可直接提交）
- `backend/postman/dashboard-api.postman_collection.json`
- `backend/postman/dashboard-api.postman_environment.json`

### 导入方式
1. 打开 Postman
2. Import → 选择 collection + environment 两个 JSON 文件
3. 右上角选择环境：`dashboard-backend-local`

### 运行方式（建议 Runner 统一跑）
- Collection → Run（或 Postman Runner）

### 覆盖点（对齐作业要求）
- 连通性：`GET /health`（status 200）
- 非法输入：
  - 缺少 `x-user-email` → 400
  - 未知 `x-user-email` → 404
  - body 空值/格式错误（例：空 email、level 传 string、filter 缺字段、dimension 非法）
- 返回内容与格式：
  - 关键字段存在（id/email/role、KPI keys、data/filter/total 等）
  - 类型正确（array/object/number/string）
- 响应速度（performance）：
  - 大多数请求断言 `< 1000ms`（filter/bubble 放宽到 `< 1200~1500ms`）

### 截图建议（用于提交）
- Postman Runner 的总结果（All Passed）
- 任意 1-2 个“非法输入”的失败/通过断言截图（例如 400/403/404）
- 任意 1 个性能断言截图（responseTime）


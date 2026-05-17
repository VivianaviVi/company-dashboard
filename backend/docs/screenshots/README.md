## 截图交付清单（建议）

> 你本周交付里提到“相关档案和测试截图”，建议按下面清单截图，命名后放到本目录。

### Swagger（API 文档）
1. **Swagger UI 首页**：`/api-docs`（能看到所有 tags / endpoints）
2. **Authorize 截图**：输入 `x-user-email` 后，Try it out 能正常调用
3. **OpenAPI JSON**：`backend/docs/openapi.json`（可导入 Swagger Editor 或直接打印为 PDF）

### Postman（测试脚本）
1. **Environment 选择**：`dashboard-backend-local`（截图）
2. **Collection Runner 总览**：所有请求通过（截图）
3. **非法输入用例**：
   - 缺少 `x-user-email`（400）
   - 非法 dimension / 缺少 filter（400）
   - RBAC 403（例如 user POST /companies）
4. **性能用例**：展示 responseTime 断言通过（截图）

### 文件命名建议
- `swagger-ui.png`
- `swagger-authorize.png`
- `postman-runner.png`
- `postman-invalid-input-400.png`
- `postman-rbac-403.png`
- `postman-performance.png`


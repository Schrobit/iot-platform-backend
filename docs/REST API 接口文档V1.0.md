# 接口文档.md（REST API Only，前缀：`/api/v1`）

> 目标：用一套清晰、可扩展但不复杂的 REST API 完成
> **资产管理（洁净室/网关/设备）→ 遥测数据查询（InfluxDB）→ 命令下行（RabbitMQ→中转→MQTT/WS→设备）→ 日志追溯（MySQL）** 的闭环。

---

## 1. 约定与通用规范

### 1.1 Base URL

* 所有接口统一前缀：`/api/v1`

### 1.2 认证方式（JWT）

* 登录后返回：

  * `access_token`（短期，前端每次请求携带）
  * `refresh_token`（较长，用于刷新）
* 请求头：

  * `Authorization: Bearer <access_token>`

### 1.3 角色与权限

* `staff`：只读（查看资产、查看遥测、查看命令记录）
* `admin`：可写（创建/修改资产、下发命令、管理用户）

> 权限标注规则：
>
> * 🔒 需要登录
> * 🛡️ 需要 admin

### 1.4 通用响应结构

统一使用：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

### 1.5 通用错误码

| HTTP |  code | 场景                |
| ---: | ----: | ----------------- |
|  400 | 40000 | 参数不合法 / 缺字段       |
|  401 | 40100 | 未登录 / token 无效    |
|  403 | 40300 | 无权限               |
|  404 | 40400 | 资源不存在             |
|  409 | 40900 | 冲突（唯一键重复等）        |
|  422 | 42200 | 业务校验失败（比如设备类型不匹配） |
|  500 | 50000 | 服务端错误             |

### 1.6 分页规范

列表接口支持：

* `page`（默认 1）
* `page_size`（默认 20，最大 200）

返回：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [],
    "page": 1,
    "page_size": 20,
    "total": 123
  }
}
```

### 1.7 时间格式

* ISO8601：`2025-12-27T13:05:00+08:00`
* 若只传日期可接受：`2025-12-27`（由后端按本地时区补齐）

---

## 2. 认证与会话

### 2.1 登录

**POST** `/api/v1/auth/login`（🔒 否）

请求：

```json
{
  "username": "alice",
  "password": "plaintext"
}
```

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "access_token": "xxx",
    "refresh_token": "yyy",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "username": "alice",
      "role": "admin",
      "email": "a@example.com"
    }
  }
}
```

### 2.2 刷新 token

**POST** `/api/v1/auth/refresh`（🔒 否）

请求：

```json
{ "refresh_token": "yyy" }
```

响应：同登录（返回新 access_token）

### 2.3 当前用户信息

**GET** `/api/v1/auth/me`（🔒）

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": { "id": 1, "username": "alice", "role": "staff", "email": null }
}
```

---

## 3. 用户管理（简化）

> 初期只保留必要能力：**admin 可增删改用户**，staff 只能看自己。

### 3.1 创建用户

**POST** `/api/v1/users`（🔒 🛡️）

请求：

```json
{
  "username": "bob",
  "password": "123456",
  "role": "staff",
  "email": "bob@example.com"
}
```

### 3.2 用户列表

**GET** `/api/v1/users?page=1&page_size=20&role=staff&keyword=b`（🔒 🛡️）

### 3.3 修改用户（启用/禁用、角色、邮箱）

**PATCH** `/api/v1/users/{id}`（🔒 🛡️）

请求示例：

```json
{
  "role": "admin",
  "email": "new@example.com",
  "is_active": 1
}
```

### 3.4 重置密码

**POST** `/api/v1/users/{id}/reset-password`（🔒 🛡️）

```json
{ "new_password": "newpass123" }
```

---

## 4. 资产模型：洁净室 / 网关 / 设备

> 设计目标：
>
> * 不搞复杂关联逻辑
> * “网关 ↔ 洁净室” 用关联表支持多对多
> * 设备可选绑定 gateway_id / cleanroom_id，允许“先建档后绑定”

---

### 4.1 洁净室 Cleanroom

#### 4.1.1 创建洁净室

**POST** `/api/v1/cleanrooms`（🔒 🛡️）

请求：

```json
{
  "name": "CR-01",
  "meta": { "grade": "ISO5", "location": "F2-Area3" },
  "is_active": 1
}
```

#### 4.1.2 洁净室列表

**GET** `/api/v1/cleanrooms?page=1&page_size=20&keyword=CR`（🔒）

#### 4.1.3 洁净室详情

**GET** `/api/v1/cleanrooms/{id}`（🔒）

#### 4.1.4 修改洁净室

**PATCH** `/api/v1/cleanrooms/{id}`（🔒 🛡️）

#### 4.1.5 删除洁净室

**DELETE** `/api/v1/cleanrooms/{id}`（🔒 🛡️）

> 建议后端做“软删除/禁用”更安全：用 `is_active=0` 代替物理删除

---

### 4.2 网关 Gateway

#### 4.2.1 创建网关

**POST** `/api/v1/gateways`（🔒 🛡️）

请求：

```json
{
  "name": "GW-01",
  "sn": "GW20251227001",
  "meta": { "vendor": "xxx", "ip": "10.0.0.2" },
  "is_active": 1
}
```

#### 4.2.2 网关列表

**GET** `/api/v1/gateways?page=1&page_size=20&keyword=GW`（🔒）

#### 4.2.3 网关详情

**GET** `/api/v1/gateways/{id}`（🔒）

#### 4.2.4 修改网关

**PATCH** `/api/v1/gateways/{id}`（🔒 🛡️）

#### 4.2.5 删除网关

**DELETE** `/api/v1/gateways/{id}`（🔒 🛡️）

---

### 4.3 网关-洁净室关联 GatewayCleanroom（多对多）

#### 4.3.1 绑定网关到洁净室

**POST** `/api/v1/gateways/{gateway_id}/cleanrooms`（🔒 🛡️）

请求：

```json
{
  "cleanroom_id": 10,
  "meta": { "coverage": "north-zone" }
}
```

#### 4.3.2 解绑

**DELETE** `/api/v1/gateways/{gateway_id}/cleanrooms/{cleanroom_id}`（🔒 🛡️）

#### 4.3.3 查询网关覆盖的洁净室

**GET** `/api/v1/gateways/{gateway_id}/cleanrooms`（🔒）

#### 4.3.4 查询洁净室可用网关

**GET** `/api/v1/cleanrooms/{cleanroom_id}/gateways`（🔒）

---

### 4.4 设备 Device（单设备=单变量）

* `type` 仅保留你们确定的集合：

  * `particle`、`temperature`、`humidity`、`diff_pressure`、`micro_vibration`、`actuator`
* MQTT/WS topic 放在 `mqtt_uplink_topic` / `mqtt_downlink_topic`（可为空）
* 其余扩展全放 `meta`

#### 4.4.1 创建设备

**POST** `/api/v1/devices`（🔒 🛡️）

请求：

```json
{
  "name": "CR01-TEMP-01",
  "sn": "T20251227001",
  "type": "temperature",
  "gateway_id": 1,
  "cleanroom_id": 10,
  "unit": "°C",
  "mqtt_uplink_topic": "uplink/CR01/TEMP01",
  "mqtt_downlink_topic": "downlink/CR01/TEMP01",
  "meta": { "point_code": "CR01-TEMP-01", "range": "0-50" },
  "is_active": 1
}
```

#### 4.4.2 设备列表（支持过滤）

**GET** `/api/v1/devices?page=1&page_size=20&type=temperature&gateway_id=1&cleanroom_id=10&keyword=CR01`（🔒）

#### 4.4.3 设备详情

**GET** `/api/v1/devices/{id}`（🔒）

#### 4.4.4 修改设备

**PATCH** `/api/v1/devices/{id}`（🔒 🛡️）

#### 4.4.5 删除设备

**DELETE** `/api/v1/devices/{id}`（🔒 🛡️）

> 同样建议用 `is_active=0` 代替物理删除

---

## 5. 遥测数据 Telemetry（InfluxDB）

> 前端不用 WS 的情况下，常见做法：
>
> * 首页/看板：**轮询 latest**（比如 2s～5s）
> * 曲线：按时间范围查询（带聚合/降采样）

### 5.1 查询某设备最新值

**GET** `/api/v1/devices/{id}/telemetry/latest`（🔒）

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "device_id": 123,
    "type": "temperature",
    "value": 22.3,
    "unit": "°C",
    "ts": "2025-12-27T13:00:01+08:00"
  }
}
```

### 5.2 查询某设备时间序列

**GET** `/api/v1/devices/{id}/telemetry?from=2025-12-27T12:00:00+08:00&to=2025-12-27T13:00:00+08:00&agg=mean&interval=10s`（🔒）

参数说明：

* `from`/`to`：时间范围（必填）
* `agg`：`raw | mean | min | max | last`（默认 `raw`）
* `interval`：聚合窗口（如 `10s` / `1m` / `5m`），当 `agg != raw` 时建议必填
* `limit`：限制点数（可选）

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "device_id": 123,
    "points": [
      { "ts": "2025-12-27T12:00:00+08:00", "value": 22.1 },
      { "ts": "2025-12-27T12:00:10+08:00", "value": 22.2 }
    ]
  }
}
```

### 5.3 洁净室看板：按洁净室取“各设备最新值”

**GET** `/api/v1/cleanrooms/{id}/telemetry/latest`（🔒）

返回该洁净室下所有设备（或指定类型）的最新值集合，便于前端一次刷新：

* 可选参数：`type=temperature`、`types=temperature,humidity`

---

## 6. 命令下行 Commands（MySQL 记录 + RabbitMQ 入队）

> 你们目前不追踪 status 是可行的：
>
> * 初期返回“已入队/已记录”即可
> * 后期要做 ack/status：只需要在 `command_log` 加字段（`status`、`acked_at`、`error`、`trace_id`），不会推翻现有 API（最多新增字段/新增查询维度）

### 6.1 下发命令（对某设备）

**POST** `/api/v1/devices/{id}/commands`（🔒 🛡️）

请求：

```json
{
  "command_name": "set_target",
  "payload": { "target": 22.0 }
}
```

建议请求头（可选但推荐）：

* `Idempotency-Key: <uuid>`
  防止用户重复点击导致重复下发（后端可用该 key 做去重）

响应（表示已写入 MySQL 且已投递 RabbitMQ downlink.queue）：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "command_id": 9876,
    "device_id": 123,
    "enqueued_at": "2025-12-27T13:05:00+08:00"
  }
}
```

### 6.2 命令记录列表

**GET** `/api/v1/commands?page=1&page_size=20&device_id=123&issued_by=1&from=...&to=...`（🔒）

### 6.3 命令记录详情

**GET** `/api/v1/commands/{id}`（🔒）

---

## 7. 系统与运维辅助

### 7.1 健康检查

**GET** `/api/v1/health`（🔒 否）

返回建议包含依赖状态（可简化为 up/down）：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "service": "up",
    "mysql": "up",
    "influxdb": "up",
    "rabbitmq": "up"
  }
}
```

---

## 8. 与“消息模型”的对齐点（接口层需要声明的最小内容）

虽然你要求本文件只写 REST 接口，但为了后续你们“数据模型 → 消息模型 → 接口模型”一致，REST 层最好明确以下映射原则：

1. **下发命令接口**只负责两件事：

* 写 MySQL `command_log`
* 投递 RabbitMQ `downlink.queue`（routing_key=`downlink.queue`）

2. **遥测查询接口**只读 InfluxDB（MySQL 不承担高频写）

* MySQL 的 `device` 提供资产与元数据
* InfluxDB 存高频点（value+ts）

3. **设备在线 last_seen_at** 更新策略（建议）：

* 由中转服务器/后端在收到上行消息时，**低频**更新 MySQL（比如每设备 30s/60s 才写一次），避免写爆

---

## 9. 最小落地建议（前端不用 WS 的情况下）

* 看板（实时感）：前端每 **2～5 秒**调用一次

  * `/cleanrooms/{id}/telemetry/latest`
* 曲线：用户切换时间范围时调用

  * `/devices/{id}/telemetry?from&to&agg&interval`
* 命令：按钮触发

  * `/devices/{id}/commands`



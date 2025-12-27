你正在协助我开发一个 Node.js 后端项目（Express + REST API），
这是一个物联网平台后端，采用严格的分层结构：
- docs：该目录中有各种你可以参考的文档，请积极查看

- routes：仅定义路由
- controllers：只处理 req / res，不写业务逻辑
- services：业务逻辑层，可调用 dao / MQ / InfluxDB
- dao：仅做数据库访问（MySQL），不写业务判断
- middlewares：鉴权、权限、错误处理
- utils：通用工具（token、response、errors 等）
- config：配置文件（MySQL、MQ、InfluxDB 等）

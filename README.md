# 通用后台管理系统（Vue3 + SpringBoot 全栈实现）
本项目是**个人全程独立搭建的全栈后台管理系统**的前端文件，采用前后端分离架构，聚焦于企业级后台管理的核心场景与技术落地，实现了完整的用户认证、数据管理、交互优化等功能，兼具实用性与学习参考价值。

##  项目核心功能
1.  **用户认证模块**：支持用户注册、登录功能，基于 JWT 实现无状态身份认证，保障系统访问安全性。
2.  **核心数据管理**：实现业务数据的完整增删改查（CURD），支持数据搜索、条件筛选，满足后台数据管理的核心需求。
3.  **个人中心功能**：提供用户资料维护、头像上传与更换功能，支持个性化信息配置。
4.  **系统个性化设置**：内置主题切换功能（亮色/暗色等），适配不同使用场景与用户偏好。
5.  **交互优化功能**：引入防抖节流机制，优化高频操作（如搜索输入、按钮点击）的性能，减少无效请求与页面卡顿。
6.  **权限控制拦截**：实现前端路由拦截，未登录/无权限用户无法访问核心管理页面，保障系统数据安全。
7.  **数据可视化展示**：集成 ECharts 实现数据图表渲染，直观呈现业务数据统计结果（如数据趋势、占比分析等）。

##  技术栈选型
### 前端技术栈
| 技术/工具 | 用途说明 |
|----------|----------|
| Vue 3 | 新一代前端核心框架，基于 Composition API 实现组件化、响应式开发，提升项目可维护性 |
| Element Plus | 基于 Vue 3 的企业级 UI 组件库，快速搭建美观、高效的后台管理界面，减少原生样式开发成本 |
| ECharts | 数据可视化图表库，实现各类统计图表（折线图、柱状图、饼图等）的渲染与交互 |
| Vite | 新一代前端构建工具，相比传统 Webpack 拥有更快的冷启动、热更新速度，大幅提升开发效率 |
| Vue Router | 前端路由管理器，实现页面无刷新跳转、路由守卫与前端权限拦截 |
| Axios | 基于 Promise 的 HTTP 客户端，用于与后端 SpringBoot 接口进行数据交互 |
| ESLint | 代码检查工具，规范代码书写格式，发现潜在语法错误，保障团队代码风格一致性（个人开发亦可提升代码质量） |
| 防抖/节流 | 优化高频操作性能，减少无效接口请求与 DOM 操作，提升用户交互体验 |

### 后端技术栈
| 技术/工具 | 用途说明 |
|----------|----------|
| Spring Boot | 后端核心框架，快速搭建分布式、可扩展的 Java 后端服务，简化配置与开发流程 |
| Maven | 项目构建与依赖管理工具，统一管理后端项目依赖，简化项目打包与部署流程 |
| JWT（JSON Web Token） | 无状态身份认证技术，实现用户登录后的身份校验，支持跨域认证，无需服务端存储会话 |
| MySQL（SQL 数据库） | 关系型数据库，用于存储系统用户数据、业务数据等核心信息，支持事务与复杂查询 |
| YAML（yml） | 配置文件格式，替代传统 properties 文件，语法简洁、层级清晰，用于配置数据库连接、服务端口等核心参数 |
| Spring IoC/DI | 依赖注入（Autowired）与 Bean 注入，实现组件解耦，提升项目可维护性与扩展性 |
| Lombok | 简化 Java 代码开发，通过注解（如 `@Data`、`@NoArgsConstructor`）消除冗余的 getter/setter、构造方法等代码 |

##  项目核心亮点
1.  **全栈独立搭建**：从前端工程化构建到后端接口开发，全程独立完成，架构清晰，前后端交互顺畅，可直接作为全栈学习参考模板。
2.  **高效前端构建**：选用 Vite 作为前端构建工具，相比传统构建工具拥有更快的冷启动速度与热更新效率，大幅降低开发过程中的等待时间，提升开发体验。
3.  **安全的 JWT 认证机制**：后端生成 JWT 令牌，前端存储并在后续请求中携带，结合前端路由拦截与后端接口校验，实现完整的身份认证与权限控制，无状态设计更易扩展。
4.  **规范的后端配置与开发**：采用 yml 格式配置文件，清晰管理数据库连接、服务端口等参数；基于 Spring IoC 实现 Bean 注入与 `@Autowired` 依赖注入，代码解耦性强；引入 Lombok 简化冗余代码，提升开发效率。
5.  **优化的用户交互体验**：
   -  引入防抖节流机制，优化搜索输入、高频点击等场景，减少无效接口请求，降低服务器压力。
   -  支持主题切换，满足不同用户使用偏好，提升系统个性化程度。
   -  集成 Element Plus 组件库，实现流畅的表单提交、数据表格、文件上传等交互，界面美观且易用。
6.  **完整的工程化规范**：前端引入 ESLint 规范代码格式，后端遵循 Spring Boot 开发规范，项目结构清晰，注释完善，便于后续二次开发与功能扩展。
7.  **数据可视化与高效查询**：集成 ECharts 实现数据可视化展示，支持业务数据快速统计分析；内置数据搜索功能，提升数据查询效率，满足后台管理高频使用场景。

##  项目使用说明
### 前置准备
1.  环境要求：安装 Node.js（推荐 LTS 版本）、npm/yarn、JDK 1.8+、MySQL（5.7+ 或 8.0+）、Maven。
2.  下载/克隆项目源码，分别解压前端与后端项目目录。

### 后端项目启动步骤
1.  进入后端 Spring Boot 项目根目录。
2.  配置数据库：打开 `src/main/resources/application.yml`（或 `application-dev.yml`）文件，找到数据库连接配置节点，修改 `url`、`username`、`password` 为本地 MySQL 数据库的对应信息：
    ```yaml
    spring:
      datasource:
        url: jdbc:mysql://localhost:3306/你的数据库名?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
        username: 你的MySQL用户名（默认通常为root）
        password: 你的MySQL密码
        driver-class-name: com.mysql.cj.jdbc.Driver
    ```
3.  初始化数据库：在本地 MySQL 中创建与配置文件对应的数据库（字符集推荐 utf8mb4），可手动执行项目附带的 SQL 脚本初始化表结构，或等待项目启动后自动创建表（需开启 Spring Boot 自动建表配置），之后可自行添加测试数据。
4.  启动后端项目：
    -  方式一（Maven 命令）：执行 `mvn spring-boot:run` 启动项目。
    -  方式二（IDE 直接运行）：在 IDE 中找到项目主启动类（带有 `@SpringBootApplication` 注解），直接运行 `main` 方法。
    -  启动成功后，后端服务默认端口通常为 8080（可在 yml 中修改），接口可正常访问。

### 前端项目启动步骤
1.  进入前端项目根目录。
2.  安装项目依赖：执行 `npm install` 或 `yarn install`，等待所有依赖安装完成。
3.  配置接口地址：修改前端项目中的 Axios 基础请求地址，确保指向后端 Spring Boot 服务的地址（默认通常为 `http://localhost:8080`）。
4.  启动前端项目：执行 `npm run dev` 启动 Vite 开发服务器，启动成功后会在终端输出访问地址（通常为 `http://localhost:5173`），直接在浏览器中打开即可。
5.  功能使用：先进行用户注册，注册成功后使用账号密码登录，即可体验数据增删改查、头像更换、主题切换等全部功能。

##  学习价值
1.  掌握 Vue 3 + Vite 前端工程化开发流程，熟悉 Composition API 与 Element Plus 组件库的实战应用。
2.  学会 Spring Boot 项目的搭建、yml 配置、数据库连接与 Maven 依赖管理，掌握后端开发的基础规范。
3.  理解前后端分离架构下的 JWT 认证流程，掌握前端路由拦截与后端接口权限校验的实现方式。
4.  学会防抖节流的实际应用场景与实现，提升前端交互性能优化的思维能力。
5.  掌握 ECharts 数据可视化的基础集成与使用，了解后台管理系统中数据统计的常见实现方式。
6.  理解 Lombok 注解的使用与 Spring IoC/DI 依赖注入的核心思想，简化 Java 后端开发代码。
7.  培养全栈开发思维，掌握前后端数据交互的完整流程，为后续复杂全栈项目开发打下坚实基础。

##  补充说明
1.  本项目为个人独立开发的学习实战项目，仅用于技术交流与学习参考，不用于任何商业用途。
2.  项目中数据库表结构、业务逻辑可根据个人需求进行二次扩展，如添加角色权限、数据导出等功能。
3.  若遇到项目启动失败、接口请求异常等问题，可优先检查环境配置、数据库连接信息与接口地址配置是否正确。
4.  项目中部分功能（如主题切换、防抖节流）可进一步优化扩展，欢迎感兴趣的开发者共同完善。

<img width="2145" height="1335" alt="image" src="https://github.com/user-attachments/assets/7f509fa5-f02d-4c36-8630-1ef4300775dc" />
<img width="2160" height="1368" alt="image" src="https://github.com/user-attachments/assets/67141646-f141-4bcf-92c3-68e37fd4c966" />
<img width="2153" height="1301" alt="image" src="https://github.com/user-attachments/assets/62b531ba-8094-45a6-8f1e-c110c0dea9c6" />
<img width="2160" height="1256" alt="image" src="https://github.com/user-attachments/assets/521f83c9-f826-4369-9d72-4f24ba6d572e" />
admin登录：
<img width="2139" height="1186" alt="image" src="https://github.com/user-attachments/assets/06f034d4-f9a4-4a98-a8fc-1dbbb0f063c5" />
<img width="2155" height="1187" alt="image" src="https://github.com/user-attachments/assets/bb584c2e-e44f-4615-b980-98b7737a9973" />
普通用户登录：
<img width="2149" height="1309" alt="image" src="https://github.com/user-attachments/assets/c746b23e-ead9-4a10-83a3-76226ab6b1fa" />

<img width="2154" height="1170" alt="image" src="https://github.com/user-attachments/assets/b3134afe-b06c-432e-a876-47c20974f74f" />
<img width="2156" height="1209" alt="image" src="https://github.com/user-attachments/assets/38118a43-56a7-44f7-a875-0bc2f0f279f4" />
<img width="2148" height="1318" alt="image" src="https://github.com/user-attachments/assets/9978a2c8-6e07-4f97-a7aa-849eb0d01e81" />
<img width="2126" height="1226" alt="image" src="https://github.com/user-attachments/assets/92a7d50f-038e-4167-bdb0-3d687a1b7049" />
主题切换
<img width="2144" height="1182" alt="image" src="https://github.com/user-attachments/assets/87e36048-a2a4-4480-a198-530533b5a544" />
更换头像
<img width="2148" height="1281" alt="image" src="https://github.com/user-attachments/assets/e579cea7-257b-4e61-9e3b-5a4d7e31b7d9" />












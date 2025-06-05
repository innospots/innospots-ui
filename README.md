# Innospots 前端项目
  
## 组件依赖

- [基于 UMI 前端应用框架](https://umijs.org/docs/introduce/introduce)
 
- [通过 React 构建用户界面](https://github.com/facebook/react)

- [UI组件库 Antd](https://ant-design.antgroup.com/docs/spec/introduce-cn)

## 环境变量
**\.env**
`UMI_APP_API_BASE_URL` 前端接口请求地址


## 项目构建编译

本项目依赖 **nodejs 18** 及以上 版本

安装依赖命令

`npm run bootstrap`

启动本地服务前端调试

`npm start`

构建前端项目

`npm run build`

打包Maven WebJar 包

`mvn clean install`
  

## 二、目录结构

**各页面目录可参考 /config/routes.ts 路由配置**

- src/app  项目入口
- src/config  配置文件
- src/layouts  布局组件
- src/assets  静态资源
- src/utils  工具类
- src/services  后端服务
- src/pages  前端页面
- src/components  公共组件
- src/models  数据流管理  
- src/components  组件库
- .env 环境变量

https://umijs.org/docs/max/data-flow



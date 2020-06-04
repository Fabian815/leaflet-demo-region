# leaflet-demo-region
- 关联缩放及行政区域地统计项目数量

## 使用
- yarn：安装依赖
- yarn start: 运行项目

## 项目结构
- src/pcas.js:中国四级行政区域数据
- src/pcas-latlon.js:中国三级行政区域数据(含经纬度)，由调用天地图服务接口构造得到的
- src/project.js:测试数据，测试数据对象含有四个字段：province、city、area、town
- src/util.js:含有用于构造pcas-latlon.json文件的函数、用于构造project.json文件的函数

import "./leaflet";
import "./util";
import PcasLatlon from "./pcas-latlon.js";
import MockProjects from "./project.js";
import {
  ProvinceMaxLevel,
  CityMinLevel,
  CityMaxLevel,
  AreaMinLevel,
  Util
} from "./util";
import "../styles/style.css";
import "../styles/leaflet.css";

function Entry() {
  this.currentAdministrationPopup = [];
  this.beforeZoom = null;
  this.map = null;
  this.projects = MockProjects.projects;
  this.init = function () {
    var map = L.map("app", {
      //参考坐标系
      crs: L.CRS.EPSG3857,
      //不添加属性说明控件
      attributionControl: false,
      //不添加缩放控件
      zoomControl: false,
      //禁止双击进行缩放
      doubleClickZoom: false,
      //显示中心
      center: [40, 116.3],
      //最小显示等级
      minZoom: 1,
      //最大显示等级
      maxZoom: 18,
      //当前显示等级
      zoom: 12,
      //限制显示地理范围
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      zoomControl: false,
      //设置渲染器
      render: L.svg(),
    });
    //添加天地图影像图层
    var imageMap = L.tileLayer(
      "http://t0.tianditu.gov.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk=" +
        "269189877f401cc343b45867852ecbce",
      {
        noWrap: true,
        // 设置图层显示范围
        bounds: [
          [-90, -180],
          [90, 180],
        ],
      }
    );
    //添加天地图影像注记
    var imageAnnotion = L.tileLayer(
      "http://t0.tianditu.gov.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}&tk=" +
        "269189877f401cc343b45867852ecbce",
      {
        noWrap: true,
        // 设置图层显示范围
        bounds: [
          [-90, -180],
          [90, 180],
        ],
      }
    );
    //设置图层组
    var image = L.layerGroup([imageMap, imageAnnotion]);
    //初始时加载矢量图层组
    map.addLayer(image);
    this.map = map;

    this.draw(this.map.getZoom());
    this.map.on("zoomstart", (e) => {
      this.beforeZoom = e.target._zoom;
    });
    this.map.on("zoomend", (e) => {
      let currentZoom = e.target._zoom;
      console.log("zoom", currentZoom);
      let needRedraw = Util.needRedraw(this.beforeZoom, currentZoom);
      if (!needRedraw) {
        return;
      }
      this.draw(currentZoom);
    });
  };
  this.draw = function (currentZoom) {
    console.log("here",currentZoom);
    if(this.currentAdministrationPopup){
      this.currentAdministrationPopup.forEach(popup=>{
        this.map.closePopup(popup);
      })
      this.currentAdministrationPopup=[];
    }
    //省级情况
    if (currentZoom <= ProvinceMaxLevel) {
      let mapProvinceProjectNumber = new Map();
      this.projects.forEach((project) => {
        let number = mapProvinceProjectNumber.get(project.province);
        if (number) {
          mapProvinceProjectNumber.set(project.province, ++number);
        } else {
          mapProvinceProjectNumber.set(project.province, 1);
        }
      });
      mapProvinceProjectNumber.forEach((value, key) => {
        let province = PcasLatlon[key];
        if (province) {
          let popup= L.popup({closeButton:false,autoClose:false,closeOnClick:false,autoPan:false}).setLatLng(province.latlon).setContent(`${key}：${value}`).openOn(this.map)
          ;
          this.currentAdministrationPopup.push(popup);
        }
      });
    } else if (currentZoom >= CityMinLevel && currentZoom <= CityMaxLevel) {
      let mapCityProjectNumber = new Map();
      this.projects.forEach((project) => {
        let key = project.province + "-" + project.city;
        let number = mapCityProjectNumber.get(key);
        if (number) {
          mapCityProjectNumber.set(key, ++number);
        } else {
          mapCityProjectNumber.set(key, 1);
        }
      });
      mapCityProjectNumber.forEach((value, key) => {
        let provinceAndCity = key.split("-");
        let provinceName = provinceAndCity[0];
        let cityName = provinceAndCity[1];
        let city = PcasLatlon[provinceName][cityName];
        if (city) {
          let popup = L.popup({closeButton:false,autoClose:false,closeOnClick:false,autoPan:false}).setLatLng(city.latlon).setContent(`${key}：${value}`).openOn(this.map);
          this.currentAdministrationPopup.push(popup);
        }
      });
    } else if (currentZoom >= AreaMinLevel) {
      let mapAreaProjectNumber = new Map();
      this.projects.forEach((project) => {
        let key = project.province + "-" + project.city + "-" + project.area;
        let number = mapAreaProjectNumber.get(key);
        if (number) {
          mapAreaProjectNumber.set(key, ++number);
        } else {
          mapAreaProjectNumber.set(key, 1);
        }
      });
      mapAreaProjectNumber.forEach((value, key) => {
        let provinceAndCityAndArea = key.split("-");
        let provinceName = provinceAndCityAndArea[0];
        let cityName = provinceAndCityAndArea[1];
        let areaName = provinceAndCityAndArea[2];
        let area = PcasLatlon[provinceName][cityName][areaName];
        if (area) {
          let popup = L.popup({closeButton:false,autoClose:false,closeOnClick:false,autoPan:false}).setLatLng(area.latlon).setContent(`${key}：${value}`).openOn(this.map);
          this.currentAdministrationPopup.push(popup);
        }
      });
    }
  };
}
(function () {
  let entry = new Entry();
  entry.init();
})();

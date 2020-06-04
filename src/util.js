import AdministrativeData from "./pcas.js";
import Axios from "./axios.min.js";
export const ProvinceMaxLevel=6;//省级行政区域显示的最大等级
export const CityMinLevel=7;//市级行政区域显示的最小等级
export const CityMaxLevel=9;//市级行政区域显示的最大等级
export const AreaMinLevel=10;//区级行政区域显示的最小等级

export const Util={
    //判断是否需要重新绘制Popup
    needRedraw:function(beforeZoom,currentZoom){
        if(beforeZoom<=ProvinceMaxLevel){
            if(currentZoom>ProvinceMaxLevel){
              return true;
            }
          }else if(beforeZoom>=CityMinLevel&&beforeZoom<=CityMaxLevel){
            if(currentZoom<CityMinLevel||currentZoom>CityMaxLevel){
              return true;
            }
          }else if(beforeZoom>=AreaMinLevel){
            if(currentZoom<AreaMinLevel){
              return true;
            }
          }
          return false;
    },
    //调用天地图服务接口获取中国行政区域(含经纬度)
    getChinaAdministrationDataFromTianDiTu: async function () {
      let queryParam = {
        searchWord: "中国",
        searchType: "1",
        needSubInfo: "true",
        needAll: "true",
        needPre: "true",
      };
      let url = `http://api.tianditu.gov.cn/administrative?postStr=${JSON.stringify(
        queryParam
      )}&tk=269189877f401cc343b45867852ecbce`;
      let result = await Axios.get(url);
      let provinces = result.data.data[0].child;
      let data = {};
      provinces.forEach((province) => {
        let name = province.name;
        let citycode = province.cityCode;
        let latlon = [province.lat, province.lnt];
        let provinceObject = {
          citycode,
          latlon,
        };
        let citys = province.child;
        if (citys) {
          if (!citys[0].child) {
            let citycode = province.cityCode;
            let latlon = [province.lat, province.lnt];
            let cityObject = {
              citycode,
              latlon,
            };
            citys.forEach((area) => {
              let areaName = area.name;
              let latlon = [area.lat, area.lnt];
              let citycode = area.cityCode;
              cityObject[areaName] = {
                citycode: citycode,
                latlon: latlon,
              };
            });
            provinceObject["市辖区"] = cityObject;
          } else {
            citys.forEach((city) => {
              let cityName = city.name;
              let areas = city.child;
              let citycode = city.cityCode;
              let latlon = [city.lat, city.lnt];
              let cityObject = {
                citycode,
                latlon,
              };
              if (areas) {
                areas.forEach((area) => {
                  let areaName = area.name;
                  let latlon = [area.lat, area.lnt];
                  let citycode = area.cityCode;
                  cityObject[areaName] = {
                    citycode,
                    latlon,
                  };
                });
              }
              provinceObject[cityName] = cityObject;
            });
          }
        }
        data[name] = provinceObject;
      });
      return data;
    },
    //将数据写出到文件
    createFile:async function(data,filename) {
      console.log("d",data);
      let strData=JSON.stringify(data);
      console.log("data",strData);
      try {
        let element = document.createElement("a");
        element.setAttribute(
          "href",
          "data:text/plain;charset=utf-8," + encodeURIComponent(strData)
        );
        element.setAttribute("download", filename);
      
        element.style.display = "none";
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element); 
      } catch (error) {
        console.error("error",error);
      }
    },
    //根据行政区域构造测试数据
    createMockProjectData:async function(){
      let data=[];
      for (const provinceName in AdministrativeData) {
        if (AdministrativeData.hasOwnProperty(provinceName)) {
          if(provinceName==="内蒙古自治区")
            break;
          const province = AdministrativeData[provinceName];
          for (const cityName in province) {
            if (province.hasOwnProperty(cityName)) {
              const city = province[cityName];
              for (const areaName in city) {
                if (city.hasOwnProperty(areaName)) {
                  const area = city[areaName];
                  for (const townName in area) {
                    if (area.hasOwnProperty(townName)) {
                      const town = area[townName];
                      let project={
                        town:townName,
                        area:areaName,
                        city:cityName,
                        province:provinceName
                      };
                      data.push(project);
                    }
                  }
                }
              }
            }
          }
        }
      }
      return {"projects":data};
    },
}
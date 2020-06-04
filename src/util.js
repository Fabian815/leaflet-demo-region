export const ProvinceMaxLevel=6;//省级行政区域显示的最大等级
export const CityMinLevel=7;//市级行政区域显示的最小等级
export const CityMaxLevel=9;//市级行政区域显示的最大等级
export const AreaMinLevel=10;//区级行政区域显示的最小等级

export const Util={
    //判断是否需要重新绘制
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
}
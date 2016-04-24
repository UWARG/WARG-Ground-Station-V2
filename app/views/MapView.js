var Template=require('../util/Template');
var Map=require('../Map');
var TelemetryData=require('../models/TelemetryData');
var Validator=require('../util/Validator');
var Logger=require('../util/Logger');
var PathManager=require('../map/PathManager');

module.exports=function(Marionette,L,$){

  return Marionette.ItemView.extend({
    template:Template('MapView'),
    className:'mapView', 

    ui:{
      map:'#leaflet-map',
      plane_location_lat:'.plane-latitude',
      plane_location_lon:'.plane-longitude',
      path_verified:'#path-verified'
    },
    events:{
      'click #clear-plane-trail-button': 'clearPlaneTrail',
      'click #add-waypoint-button':'addWaypointToggle',
      'click #delete-waypoint-button':'deleteWaypointToggle',
      'click #send-path-button':'sendPath',
      'submit .waypointPopupForm':'clickedWaypointPopupSubmit'
    },

    initialize: function(){
      this.map=new Map(L);
      this.add_waypoint_mode=false;
      this.delete_waypoint_mode=false;
    },
    onRender:function(){
      TelemetryData.addListener('data_received',function(data){
        if(Validator.isValidLatitude(data.lat) && Validator.isValidLongitude(data.lng)){
          if(Validator.isValidHeading(data.heading)){
            this.map.movePlane(data.lat,data.lon,data.heading);
          }
          this.map.expandPlaneTrail(data.lat,data.lon);
          this.setLatitudeLongitude(data.lat,data.lon);
        }
        if(Validator.isValidNumber(data.path_checksum)){
          if(Number(data.path_checksum)===PathManager.current_path_checksum){
            this.ui.path_verified.text('Yes');
          }
          else{
            this.ui.path_verified.text('No. A: '+data.path_checksum+', L: '+PathManager.current_path_checksum);
          }
        }
        else{
          Logger.warn('Invalid value for path_checksum received. Value: '+data.path_checksum);
        }
      }.bind(this));
      this.ui.map.ready(function(){
       this.map.createMap('leaflet-map');
      }.bind(this));
      this.ui.map.resize(function(){
        this.map.resize();
      }.bind(this));
    },
    onBeforeDestroy:function(){
      
    },
    setLatitudeLongitude: function(lat,lon){
      if(Validator.isValidLatitude(lat) && Validator.isValidLongitude(lon)){
        this.ui.plane_location_lat.text(Number(lat).toFixed(5));
        this.ui.plane_location_lon.text(Number(lon).toFixed(5));
      }else{
        Logger.warn('Invalid longitude or latitude received! Latitude: '+lat+' Longitude: '+lon);
        this.ui.plane_location_lat.text('Invalid');
        this.ui.plane_location_lon.text('Invalid');
      }
    },

    sendPath: function(){
      PathManager.sendPath();
    },

    clearPlaneTrail: function(e){
      this.map.clearPlaneTrail();
    },
    addWaypointToggle: function(e){
      this.map.addWaypointMode(!this.add_waypoint_mode);
      this.add_waypoint_mode=!this.add_waypoint_mode;
    },
    deleteWaypointToggle: function(e){
      this.map.deleteWaypointMode(!this.delete_waypoint_mode);
      this.delete_waypoint_mode=!this.delete_waypoint_mode;
    },
    clickedWaypointPopupSubmit: function(e){
      e.preventDefault();
      this.map.popupSubmitted(Number($('.waypoint-altitude').val()),Number($('.waypoint-radius').val()));
    }
  });
};
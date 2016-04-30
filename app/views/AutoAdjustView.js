var Template = require('../util/Template');
var Logger = require('../util/Logger');
var Commands = require('../models/Commands');
var Bitmask=require('../util/Bitmask');
var TelemetryData=require('../models/TelemetryData');

module.exports = function(Marionette) {

  return Marionette.ItemView.extend({
    template: Template('AutoAdjustView'),
    className: 'gainsAdjustView',

    ui: {
      all_button: "#sendall",
      rc_button: "#fullRC",
      auto_button: "fullAuto",
      ground_button: "fullGround",
      pitch_select: "#pitchsource",
      roll_select: "#rollsource",
      head_select: "#headsource",
      alt_select: "#altsource",
      throttle_select: "#throttlesource",
      flap_select: "#flapssource",
      rolltype_select: "#rolltype",
      pitchtype_select: "#pitchtype",
      alttype_select: '#altitudetype',
      headingtype_select: '#headingtype',

      remote_pitch_type:'#remote_pitch_type',
      remote_roll_type:'#remote_roll_type',
      remote_heading_toggle:'#remote_heading_toggle',
      remote_altitude_toggle:'#remote_altitude_toggle',
      remote_pitch_source:'#remote_pitch_source',
      remote_roll_source:'#remote_roll_source',
      remote_heading_source:'#remote_heading_source',
      remote_altitude_source:'#remote_altitude_source',
      remote_throttle_source:'#remote_throttle_source',
      remote_flap_source:'#remote_flap_source',

      remote_autonomous_level_value: '#remote_autonomous_level_value',
      autonomous_level_synced:'#autonomous_level_synced'
    },

    events: {
      "click #sendall": "sendAll",
      "click #fullRC": "fullRC",
      "click #fullAuto": "fullAuto",
      "click #fullGround": "fullGround"
    },

    intialize: function(){
      this.telemetryCallback=null;
    },

    onRender: function(){
      TelemetryData.on('data_received', this.dataReceivedCallback.bind(this));
    },
/*
0000000000b = Full manual control (default)
0000000001b = Set Pitch Rate(0), Pitch Angle(1)
0000000010b = Pitch Control Source: Controller(0), Ground Station(1) 
0000000100b = Roll Control Type: Roll Rate(0), Roll Angle(1)
0000001000b = Roll Control Sources: Controller(0), Ground Station(1)
0000110000b = Throttle control source: Controller(0), Ground Station(1), Autopilot(2)
0001000000b = Altitude Source: Ground Station(0), Autopilot(1)
0010000000b = Altitude Control On(1) or Off(0)
0100000000b = Heading control source: Ground Station(0), Autopilot(1)
1000000000b= To fly with Ground Station Control of the Pitch Rate and Roll Angle:
*/
    dataReceivedCallback: function(data){
      this.ui.remote_autonomous_level_value.text(data.autonomousLevel);
      this.ui.autonomous_level_synced.text(Number(data.autonomousLevel)===this.encodeInputs() ? 'Yes' : 'No');
      var alevel=new Bitmask(Number(data.autonomousLevel));

      if(alevel.getBit(0)){
        this.ui.remote_pitch_type.text('Angle');
      }
      else{
        this.ui.remote_pitch_type.text('Rate');
      }
      if(alevel.getBit(1)){
        this.ui.remote_pitch_source.text('Ground Station');
      }
      else{
        this.ui.remote_pitch_source.text('Controller');
      }
      if(alevel.getBit(2)){
        this.ui.remote_roll_type.text('Angle');
      }
      else{
        this.ui.remote_roll_type.text('Rate');
      }
      if(alevel.getBit(3)){
        this.ui.remote_roll_source.text('Ground Station');
      }
      else{
        this.ui.remote_roll_source.text('Controller');
      }
      if(alevel.getBit(5)){
        this.ui.remote_throttle_source.text('Autopilot');
      }
      else if (alevel.getBit(4)){
        this.ui.remote_throttle_source.text('Groundstation'); 
      }
      else{
        this.ui.remote_throttle_source.text('Controller');
      }
      if(alevel.getBit(6)){
        this.ui.remote_altitude_source.text('Autopilot');
      }
      else{
        this.ui.remote_altitude_source.text('Groundstation');
      }
      if(alevel.getBit(7)){
        this.ui.remote_altitude_toggle.text('On');
      }
      else{
        this.ui.remote_altitude_toggle.text('Off');
      }
      if(alevel.getBit(8)){
        this.ui.remote_heading_source.text('Autopilot');
      }
      else{
        this.ui.remote_heading_source.text('Groundstation');
      }
      if(alevel.getBit(9)){
        this.ui.remote_heading_toggle.text('On');
      }
      else{
        this.ui.remote_heading_toggle.text('Off');
      }
      if(alevel.getBit(11)){
        this.ui.remote_flap_source.text('Autopilot');
      }
      else if(alevel.getBit(10)){
        this.ui.remote_flap_source.text('Groundstation');
      }
      else{
        this.ui.remote_flap_source.text('Controller');
      }
    },

    sendAll: function(event) {
      Commands.sendAutoLevel(this.encodeInputs());
    },

    encodeInputs: function(){
      var autolevel = new Bitmask(0);

      if (this.ui.pitchtype_select.val() === "Angle") {
        autolevel.setBit(0, true);
      }
      if (this.ui.pitch_select.val() === "Ground Station") {
        autolevel.setBit(1,true);
      }
      if (this.ui.rolltype_select.val() === "Angle") {
        autolevel.setBit(2,true);
      }
      if (this.ui.roll_select.val() === "Ground Station") {
        autolevel.setBit(3, true);
      }
      if (this.ui.throttle_select.val() === "Autopilot") {
        autolevel.setBit(5,true);
      }
      else if (this.ui.throttle_select.val() === "Ground Station") { //we dont add anything if its a controller
        autolevel.setBit(4,true);
      }
      if (this.ui.alt_select.val() === "Autopilot") {
        autolevel.setBit(6,true);
      }
      if (this.ui.alttype_select.val() === "On") {
        autolevel.setBit(7, true);
      }
      if (this.ui.head_select.val() === "Autopilot") {
        autolevel.setBit(8, true);
      }
      if (this.ui.headingtype_select.val() === "On") {
        autolevel.setBit(9, true);
      }
      if (this.ui.flap_select.val() === "Autopilot") {
        autolevel.setBit(11,true);
      }
      else if (this.ui.flap_select.val() === "Ground Station") {
        autolevel.setBit(10, true);
      }
      
      return autolevel.decimal_value;
    },

    fullRC: function(event) {
      this.ui.flap_select.val('Controller');
      this.ui.throttle_select.val('Controller');
      this.ui.alt_select.val('Ground Station');
      this.ui.head_select.val('Ground Station');
      this.ui.roll_select.val('Controller');
      this.ui.pitch_select.val('Controller');
      this.ui.pitchtype_select.val('Rate');
      this.ui.rolltype_select.val('Rate');
      this.ui.headingtype_select.val('Off');
      this.ui.alttype_select.val('Off');
      this.sendAll();
    },

    fullAuto: function(event) { //full autopilot and groundstation (defaults to angle)
      this.ui.flap_select.val('Autopilot');
      this.ui.throttle_select.val('Autopilot');
      this.ui.alt_select.val('Autopilot');
      this.ui.head_select.val('Autopilot');
      this.ui.roll_select.val('Ground Station');
      this.ui.pitch_select.val('Ground Station');
      this.ui.pitchtype_select.val('Angle');
      this.ui.rolltype_select.val('Angle');
      this.ui.headingtype_select.val('On');
      this.ui.alttype_select.val('On');
      this.sendAll();
    },

    fullGround: function(event) { //full groundstation (defaults to angle)
      this.ui.flap_select.val('Ground Station');
      this.ui.throttle_select.val('Ground Station');
      this.ui.alt_select.val('Ground Station');
      this.ui.head_select.val('Ground Station');
      this.ui.roll_select.val('Ground Station');
      this.ui.pitch_select.val('Ground Station');
      this.ui.pitchtype_select.val('Angle');
      this.ui.rolltype_select.val('Angle');
      this.ui.headingtype_select.val('On');
      this.ui.alttype_select.val('On');
      this.sendAll();
    }
  });
};
//this is copied from the data link documentation
/*
0000000000b = Full manual control (default)
0000000001b = Set Pitch Rate(0), Pitch Angle(1)
0000000010b = Pitch Control Source: Controller(0), Ground Station(1) 
0000000100b = Roll Control Type: Roll Rate(0), Roll Angle(1)
0000001000b = Roll Control Sources: Controller(0), Ground Station(1)
0000110000b = Throttle control source: Controller(0), Ground Station(1), Autopilot(2)
0001000000b = Altitude Source: Ground Station(0), Autopilot(1)
0010000000b = Altitude Control On(1) or Off(0)
0100000000b = Heading control source: Ground Station(0), Autopilot(1)
1000000000b= To fly with Ground Station Control of the Pitch Rate and Roll Angle:
*/
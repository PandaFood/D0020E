/**
 * @fileOverview Manages all sensors
 */
var WideFind = require('./WidefindSystem/widefind')

var wideFind = new WideFind()

module.exports = class sensorManager {
  /**
   *  Handling all the different sensors
   *  @return {WideFind} The WideFind Sensor
   */
  get wideFind () {
    return wideFind
  }
}

var WideFind = require('./WidefindSystem/widefind')

var wideFind = new WideFind()

module.exports = class sensorManager {
  get wideFind () {
    return wideFind
  }
}

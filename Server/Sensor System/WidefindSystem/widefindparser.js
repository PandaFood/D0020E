/**
 * @fileOverview Class for parsing WideFind data to standardized json format
 */

/**
 *     Outputs standardized JSON format
 *  @param data Data to parse
 */
module.exports.jsonify = function (data) {
  var json = {
    version: 1,
    action: 0,
    entities: []
  }

  json.entities.push({
    id: data.id,
    type: 'human',
    data: {
      position: {
        x: data.pos[0],
        y: data.pos[2],
        z: data.pos[1]
      },
      velocity: {
        x: data.vel[0],
        y: data.vel[2],
        z: data.vel[1]
      },
      battery: data.bat,
      signal: data.rssi
    }
  })

  return JSON.stringify(json)
}

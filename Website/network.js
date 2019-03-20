
//Network class for communicating with server and handling received data
class Network {
	constructor(entityModel, worldModel, alertModel, camera2D) {
		this._entityModel = entityModel;
		this._worldModel = worldModel;
		this._alertModel = alertModel;
		this._camera2D = camera2D;

		//Init network state
		this._resetState();

		//Network settings
		this._version = 1;
		this._maxEntityUpdates = 1000000;
		this._maxAlertsUpdates = 10000;
		this._maxLengthAlertMessage = 10000;
		this._maxAlertShapes = 1000;
		this._maxLengthID = 10000;
		this._maxLengthType = 10000;
		this._maxLengthDisplayName = 10000;
		this._maxLengthName = 10000;
		this._maxLengthSalt = 100000;
		this._maxLengthErrorReason = 100000;
		this._maxTypeUpdates = 100000;
		this._maxLengthURI = 1000000;
		this._maxImages = 10000;
	}

	//Connect to a URL using the specified password.
	connect(url, password) {
		this._resetState();
		this._passwordHash = this._hash("VarnandeLurar" + password);

		const self = this;

		try {
			this._socket = new WebSocket(url);
			this._socket.addEventListener("close", function(event) {
				if(!self._safeDisconnect) {
					self._throwError("Connection error (" + event.code + ")");
				}
			});
			this._socket.addEventListener("message", function(event) {
				try {
					self._handleMessage(JSON.parse(event.data));
				} catch(error) {
					self._throwError(error);
					self.disconnect();
				}
			});
		} catch(error) {
			this._throwError(error);
		}
	}

	//Gracefully disconnect from the server
	disconnect() {
		if(this._socket != null) {
			this._socket.close();
		}
		this._entityModel.clear();
		this._worldModel.clear();
		this._resetState();
		this._safeDisconnect = true;
	}

	//Reset variables keeping track of the current state
	_resetState() {
		//The WebSocket
		this._socket = null;

		//A hash of the password
		this._passwordHash = null;

		//Keeps track whether the salt has been received from the server.
		this._serverSaltReceived = false;

		//Keeps track whether the authorization result has been received from the server.
		this._authorizationResultReceived = false;

		//Whether an error has occurred
		this._hasError = false;

		//If an error has occurred the error message will be stored in this variable.
		this._errorMessage = "";

		//Whether the socket was safetly disconnected using the disconnect() method.
		this._safeDisconnect = false;
	}

	//Set error variables and disconnect
	_throwError(error) {
		this._hasError = true;
		this._errorMessage = "Error: " + error;
		this._safeDisconnect = true;
		if(this._socket != null) {
			this._socket.close();
		}
	}

	//Check whether an error has occurred
	hasError() {
		return this._hasError;
	}

	//If an error has occurred this function returns the error message.
	getErrorMessage() {
		return this._errorMessage;
	}

	//Check whether the authorization result has been received
	isAuthorized() {
		return this._authorizationResultReceived;
	}

	//Hash a string with SHA256 and return a hex string
	_hash(string) {
		const hash = new sjcl.hash.sha256();
		hash.update(string);
		const result = hash.finalize();

		const hex = sjcl.codec.hex.fromBits(result);
		return hex;
	}

	//Handle a received message
	_handleMessage(data) {
		try {
			//Check whether the version field is present
			if(data.hasOwnProperty("version")) {
				const version = parseInt(data["version"]);

				//Check whether the server and client have the same version
				if(version == this._version) {

					//Check whether the action field is present
					if(data.hasOwnProperty("action")) {
						const action = parseInt(data["action"]);

						//Handle the specified action
						switch(action) {
							case 0: this._handleEntitiesUpdate(data); break;
							case 1: this._handleServerSalt(data); break;
							case 3: this._handleAuthorizationResult(data); break;
							case 4: this._handleEntityTypeConfigs(data); break;
							case 5: this._handleMapImages(data); break;
							case 6: this._handleAlertsUpdate(data); break;
							default: throw "Server sent unknown action";
						}
					} else {
						throw "No action field present";
					}
				} else {
					throw "Server has incompatible version";
				}
			} else {
				throw "Server did not specify version";
			}
		} catch(error) {
			this._throwError(error);
		}
	}

	//Handle entities update message
	_handleEntitiesUpdate(data) {
		if(data.hasOwnProperty("entities")) {
			if(data["entities"] instanceof Array) {
				const length = data["entities"].length;
				if(length <= this._maxEntityUpdates) {
					for(let i = 0; i < length; ++i) {
						const entity = data["entities"][i];
						this._handleEntityUpdate(entity);
					}
				} else {
					throw "Entities list is larger than the maximum size of " + this._maxEntityUpdates + " entities";
				}
			} else {
				throw "Entities field is not an array";
			}
		} else {
			throw "No entities list present";
		}
	}
	_handleEntityUpdate(data) {
		let id;
		if(data.hasOwnProperty("id")) {
			if(typeof data["id"] === "string" || data["id"] instanceof String) {
				if(data["id"].length <= this._maxLengthID) {
					id = data["id"];
				} else {
					throw "Entity ID is too long";
				}
			} else {
				throw "Entity ID is not of type string";
			}
		} else {
			throw "Entity has no ID field";
		}

		let type;
		if(data.hasOwnProperty("type")) {
			if(typeof data["type"] === "string" || data["type"] instanceof String) {
				if(data["type"].length <= this._maxLengthType) {
					type = data["type"];
				} else {
					throw "Entity type is too long";
				}
			} else {
				throw "Entity type is not of type string";
			}
		} else {
			throw "Entity has no type field";
		}

		let name = null;
		if(data.hasOwnProperty("name")) {
			if(typeof data["name"] === "string" || data["name"] instanceof String) {
				if(data["name"].length <= this._maxLengthName) {
					name = data["name"];
				} else {
					throw "Entity name is too long";
				}
			} else {
				throw "Entity name is not of type string";
			}
		}

		let position;
		if(data.hasOwnProperty("position")) {
			let posData = data["position"];
			if(posData.hasOwnProperty("x") && posData.hasOwnProperty("y") && posData.hasOwnProperty("z")) {
				let x = parseFloat(posData["x"]);
				let y = parseFloat(posData["y"]);
				let z = parseFloat(posData["z"]);
				if(!isNaN(x) && !isNaN(y) && !isNaN(z)) {
					position = {x:x, y:y, z:z};
				} else {
					throw "Entity position have NaN values";
				}
			} else {
				throw "Entity position is malformed";
			}
		} else {
			throw "Entity has no position field";
		}

		let velocity = {x:0, y:0, z:0};
		if(data.hasOwnProperty("velocity")) {
			let velData = data["velocity"];
			if(velData.hasOwnProperty("x") && velData.hasOwnProperty("y") && velData.hasOwnProperty("z")) {
				let x = parseFloat(velData["x"]);
				let y = parseFloat(velData["y"]);
				let z = parseFloat(velData["z"]);
				if(!isNaN(x) && !isNaN(y) && !isNaN(z)) {
					velocity = {x:x, y:y, z:z};
				} else {
					throw "Entity velocity have NaN values";
				}
			} else {
				throw "Entity velocity is malformed";
			}
		}

		let battery = null;
		if(data.hasOwnProperty("battery")) {
			let b = parseFloat(data["battery"]);
			if(!isNaN(b)) {
				if(b >= 0 && b <= 1) {
					battery = b;
				} else {
					throw "Entity battery level is out of range";
				}
			} else {
				throw "Entity battery level is NaN value";
			}
		}

		let signal = null;
		if(data.hasOwnProperty("signal")) {
			let s = parseFloat(data["signal"]);
			if(!isNaN(s)) {
				signal = s;
			} else {
				throw "Entity signal strength is NaN value";
			}
		}

		let entity = this._entityModel.getById(id);
		if(entity == null) {
			entity = new Entity(this._entityModel, id, type, name);
			this._entityModel.entities.push(entity);
		} else {
			entity.type = type;
			entity.name = name;
		}

		entity.posX = position.x;
		entity.posY = position.y;
		entity.posZ = position.z;

		entity.velX = velocity.x;
		entity.velY = velocity.y;
		entity.velZ = velocity.z;

		entity.battery = battery;
		entity.signal = signal;
	}

	//Handle server salt message
	_handleServerSalt(data) {
		if(this._serverSaltReceived) {
			throw "Received server salt twice";
		} else {
			this._serverSaltReceived = true;
		}

		let salt;
		if(data.hasOwnProperty("salt")) {
			if(typeof data["salt"] === "string" || data["salt"] instanceof String) {
				if(data["salt"].length <= this._maxLengthSalt) {
					salt = data["salt"];
				} else {
					throw "Server salt is too long";
				}
			} else {
				throw "Salt is not of type string";
			}
		} else {
			throw "Salt field not present";
		}

		this._sendClientAuthorization(salt, this._passwordHash);
	}

	//Send client authorization message to server
	_sendClientAuthorization(serverSalt, passwordHash) {
		const crypto = window.crypto || window.msCrypto;

		let clientSalt;
		if(crypto) {
			const values = new Uint8Array(32);
			crypto.getRandomValues(values);
			clientSalt = btoa(values);
		} else {
			throw "Your browser does not support the Crypto API";
		}

		const hash = this._hash("VarnandeLurar" + serverSalt + passwordHash + clientSalt);
		this._socket.send(JSON.stringify({
			"version":this._version,
			"action":2,
			"salt":clientSalt,
			"hash":hash
		}));
	}

	//Handle authorization result message from server
	_handleAuthorizationResult(data) {
		if(this._authorizationResultReceived) {
			throw "Received authorization result twice";
		} else {
			this._authorizationResultReceived = true;
		}

		if(data.hasOwnProperty("success")) {
			const success = (data["success"] == true);
			if(success) {
				//Authorization success
			} else {
				if(data.hasOwnProperty("reason")) {
					if(typeof data["reason"] === "string" || data["reason"] instanceof String) {
						if(data["reason"].length <= this._maxLengthErrorReason) {
							let result = data["reason"];
							throw "Authorization failed: " + result;
						} else {
							throw "Server authorization error reason is too long";
						}
					} else {
						throw "Authorization error reason is not of type string";
					}
				} else {
					throw "Authorization result has no reason field";
				}
			}
		} else {
			throw "Authorization result has no success field";
		}
	}

	//Handle entity type configs message
	_handleEntityTypeConfigs(data) {
		if(data.hasOwnProperty("types")) {
			if(data["types"] instanceof Array) {
				const length = data["types"].length;
				if(length <= this._maxTypeUpdates) {
					for(let i = 0; i < length; ++i) {
						const type = data["types"][i];
						this._handleEntityTypeConfig(type);
					}
				} else {
					throw "Entity types list is larger than the maximum size of " + this._maxTypeUpdates + " types";
				}
			} else {
				throw "Types field is not an array";
			}
		} else {
			throw "No entity types list present";
		}
	}
	_handleEntityTypeConfig(data) {
		let type;
		if(data.hasOwnProperty("type")) {
			if(typeof data["type"] === "string" || data["type"] instanceof String) {
				if(data["type"].length <= this._maxLengthType) {
					type = data["type"];
				} else {
					throw "Type name is too long";
				}
			} else {
				throw "Type is not of type string";
			}
		} else {
			throw "No type field present";
		}

		let displayName;
		if(data.hasOwnProperty("displayName")) {
			if(typeof data["displayName"] === "string" || data["displayName"] instanceof String) {
				if(data["displayName"].length <= this._maxLengthDisplayName) {
					displayName = data["displayName"];
				} else {
					throw "Display name is too long";
				}
			} else {
				throw "Display name is not of type string";
			}
		}

		let iconURI;
		if(data.hasOwnProperty("iconURI")) {
			if(typeof data["iconURI"] === "string" || data["iconURI"] instanceof String) {
				if(data["iconURI"].length <= this._maxLengthURI) {
					iconURI = data["iconURI"];
				} else {
					throw "Type iconURI is too long";
				}
			} else {
				throw "Type iconURI is not of type string";
			}
		} else {
			throw "No iconURI field present";
		}

		this._entityModel.addType(type, {
			"displayName":displayName,
			"iconURI":iconURI
		})
	}

	//Handle map images message
	_handleMapImages(data) {
		this._worldModel.clearImages();
		if(data.hasOwnProperty("images")) {
			if(data["images"] instanceof Array) {
				const length = data["images"].length;
				if(length <= this._maxImages) {
					for(let i = 0; i < length; ++i) {
						const imageConfig = data["images"][i];
						this._handleMapImage(imageConfig);
					}
				} else {
					throw "Map images list is larger than the maximum size of " + this._maxImages + " images";
				}
			} else {
				throw "Images field is not an array";
			}
		} else {
			throw "No images list present";
		}
	}
	_handleMapImage(data) {
		let imageURI;
		if(data.hasOwnProperty("imageURI")) {
			if(typeof data["imageURI"] === "string" || data["imageURI"] instanceof String) {
				if(data["imageURI"].length <= this._maxLengthURI) {
					imageURI = data["imageURI"];
				} else {
					throw "Map imageURI is too long";
				}
			} else {
				throw "Map imageURI is not of type string";
			}
		} else {
			throw "No imageURI field present";
		}

		let position;
		if(data.hasOwnProperty("position")) {
			let posData = data["position"];
			if(posData.hasOwnProperty("x") && posData.hasOwnProperty("y") && posData.hasOwnProperty("z")) {
				let x = parseFloat(posData["x"]);
				let y = parseFloat(posData["y"]);
				let z = parseFloat(posData["z"]);
				if(!isNaN(x) && !isNaN(y) && !isNaN(z)) {
					position = {x:x, y:y, z:z};
				} else {
					throw "Map image position have NaN values";
				}
			} else {
				throw "Map image position is malformed";
			}
		} else {
			throw "Map image has no position field";
		}

		let rotation = 0;
		if(data.hasOwnProperty("rotation")) {
			let r = parseFloat(data["rotation"]);
			if(!isNaN(r)) {
				rotation = r;
			} else {
				throw "Map image rotation is NaN value";
			}
		}

		let scale = 1;
		if(data.hasOwnProperty("scale")) {
			let s = parseFloat(data["scale"]);
			if(!isNaN(s)) {
				scale = s;
			} else {
				throw "Map image scale is NaN value";
			}
		}

		this._worldModel.addImage(imageURI, position.x, position.y, position.z, rotation, scale);
		this._camera2D.floorSetBottom(this._worldModel.floors);
	}

	//Handle alerts
	_handleAlertsUpdate(data) {
		if(data.hasOwnProperty("alerts")) {
			if(data["alerts"] instanceof Array) {
				const length = data["alerts"].length;
				if(length <= this._maxAlertsUpdates) {
					this._alertModel.alerts.length = 0;
					for(let i = 0; i < length; ++i) {
						const alert = data["alerts"][i];
						this._handleAlertUpdate(alert);
					}
				} else {
					throw "Alerts list is larger than the maximum size of " + this._maxAlertsUpdates;
				}
			} else {
				throw "Alerts field is not an array";
			}
		} else {
			throw "No alerts list present";
		}
	}

	_handleAlertUpdate(data) {
		let message;
		if(data.hasOwnProperty("message")) {
			if(typeof data["message"] === "string" || data["message"] instanceof String) {
				if(data["message"].length <= this._maxLengthAlertMessage) {
					message = data["message"];
				} else {
					throw "Alert message is too long";
				}
			} else {
				throw "Alert message is not of type string";
			}
		} else {
			throw "Alert has no message field";
		}

		let severity;
		if(data.hasOwnProperty("severity")) {
			severity = parseInt(data["severity"]);
			if(isNaN(severity)) {
				throw "Alert severity level is NaN value";
			} else if(severity < Alert.severity.low && severity > Alert.severity.high) {
				throw "Alert severity level is out of range";
			}
		} else {
			throw "Alert has no severity field";
		}

		let alert = new Alert(message, severity);

		if(data.hasOwnProperty("shapes")) {
			if(data["shapes"] instanceof Array) {
				const length = data["shapes"].length;
				if(length <= this._maxAlertShapes) {
					for(let i = 0; i < length; ++i) {
						const shape = data["shapes"][i];
						this._handleAlertShapeUpdate(alert, shape);
					}
				} else {
					throw "Alert shapes list is larger than the maximum size of " + this._maxAlertShapes;
				}
			} else {
				throw "Alert shapes field is not an array";
			}
		}

		this._alertModel.alerts.push(alert);
	}

	_handleAlertShapeUpdate(alert, data) {
		if(data.hasOwnProperty("type")) {
			if(typeof data["type"] === "string" || data["type"] instanceof String) {
				switch(data["type"]) {
					case "cylinder": this._handleAlertShapeCylinderUpdate(alert, data); break;
					default: throw "Alert shape has unknown type";
				}
			} else {
				throw "Alert shape type field is not of type string";
			}
		} else {
			throw "Alert shape has no type field";
		}
	}

	_handleAlertShapeCylinderUpdate(alert, data) {
		let entityID = null;
		if(data.hasOwnProperty("entity")) {
			if(typeof data["entity"] === "string" || data["entity"] instanceof String) {
				if(data["entity"].length <= this._maxLengthID) {
					entityID = data["entity"];
				} else {
					throw "Alert shape cylinder entity ID is too long";
				}
			} else {
				throw "Alert shape cylinder entity field is not of type string";
			}
		}

		let position;
		if(data.hasOwnProperty("position")) {
			let posData = data["position"];
			if(posData.hasOwnProperty("x") && posData.hasOwnProperty("y") && posData.hasOwnProperty("z")) {
				let x = parseFloat(posData["x"]);
				let y = parseFloat(posData["y"]);
				let z = parseFloat(posData["z"]);
				if(!isNaN(x) && !isNaN(y) && !isNaN(z)) {
					position = {x:x, y:y, z:z};
				} else {
					throw "Alert shape position have NaN values";
				}
			} else {
				throw "Alert shape position is malformed";
			}
		} else {
			position = {x:0, y:0, z:0};
		}

		let radius;
		if(data.hasOwnProperty("radius")) {
			radius = parseFloat(data["radius"]);
			if(isNaN(radius)) {
				throw "Alert shape cylinder radius is NaN value";
			} else if(radius == 0) {
				throw "Alert shape cylinder radius is zero";
			} else if(radius < 0) {
				throw "Alert shape cylinder radius is negative";
			}
		} else {
			throw "Alert shape cylinder radius field does not exist";
		}

		let height = Infinity;
		if(data.hasOwnProperty("height")) {
			height = parseFloat(data["height"]);
			if(isNaN(height)) {
				throw "Alert shape cylinder height is NaN value";
			} else if(height == 0) {
				throw "Alert shape cylinder height is zero";
			} else if(height < 0) {
				throw "Alert shape cylinder height is negative";
			}
		}

		let shape = new AlertShapeCylinder(this._entityModel, entityID, position.x, position.y, position.z, radius, height);
		alert.addShape(shape);
	}
}

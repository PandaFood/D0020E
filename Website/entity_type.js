
//Keeps track of entity configuration
class EntityType {
	constructor(config) {
		this._displayName = "Unnamed";
		if(config.hasOwnProperty("displayName")) {
			this._displayName = config["displayName"];
		}

		this._iconURI = "images/unknown.png";
		if(config.hasOwnProperty("iconURI")) {
			this._iconURI = config["iconURI"];
		}
	}

	//Returns icon URI
	get iconURI() {
		return this._iconURI;
	}

	//Returns the display name of the type
	get displayName() {
		return this._displayName;
	}
}

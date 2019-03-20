
//An Entity representing a tracked object with a specific type and optional name
class Entity {
	constructor(entityModel, id, type, name = null) {
		this._entityModel = entityModel;
		this._localID = ++Entity._localIDCounter;
		this._id = id;
		this.type = type;
		this.name = name;
		this._color = null;
		this._randomizeColor();

		this.posX = -Infinity;
		this.posY = -Infinity;
		this.posZ = -Infinity;

		this.velX = 0;
		this.velY = 0;
		this.velZ = 0;

		this.battery = null;
		this.signal = null;
	}

	//Set this entity to a random color
	_randomizeColor() {
		this._color = "hsl(" + (Math.floor(Math.random() * 14) / 14) * 360 + ",50%,50%)";
	}

	//Calculate the squared distance to another entity
	distanceToSquared(entity) {
		const dx = this.posX - entity.posX;
		const dy = this.posY - entity.posY;
		const dz = this.posZ - entity.posZ;
		return dx * dx + dy * dy + dz * dz;
	}

	//Calculate the distance to another entity
	distanceTo(entity) {
		return Math.sqrt(this.distanceToSquared(entity));
	}

	//Return a nicely formatted distance to another entity
	formattedDistanceTo(entity) {
		const distance = this.distanceTo(entity);
		const distanceRounded = Math.round(distance * 10) / 10;
		if(distanceRounded == Math.floor(distanceRounded)) {
			return distanceRounded + ".0&nbsp;m";
		} else {
			return distanceRounded + "&nbsp;m";
		}
	}

	//Returns image URI
	get iconURI() {
		const type = this._entityModel.getType(this.type);
		if(type == null) {
			return "images/unknown.png";
		} else {
			return type.iconURI;
		}
	}

	//Returns the color of the entity
	get color() {
		return this._color;
	}

	get displayName() {
		if(this.name != null) {
			return this.name;
		} else {
			const type = this._entityModel.getType(this.type);
			if(type == null) {
				return "Unnamed";
			} else {
				return type.displayName;
			}
		}
	}

	get id() {
		return this._id;
	}

	get localID() {
		return this._localID;
	}
}

Entity._localIDCounter = 0;

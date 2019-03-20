
//An EntityModel keeping track of entities and entity types
class EntityModel {
	constructor() {
		this.entities = [];
		this._types = new Map();
	}

	clear() {
		this.entities.length = 0;
		this._types = new Map();
	}

	//Adds a new entity type with the specified configuration
	addType(type, config) {
		this._types.set(type, new EntityType(config));
	}

	//Get EntityType by name
	getType(type) {
		if(this._types.has(type)) {
			return this._types.get(type);
		} else {
			return null;
		}
	}

	//Get the Entity with the specified ID
	getById(id) {
		for(let i = 0; i < this.entities.length; ++i) {
			let entity = this.entities[i];
			if(entity.id == id) {
				return entity;
			}
		}

		return null;
	}
}

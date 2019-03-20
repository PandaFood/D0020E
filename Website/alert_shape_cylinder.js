
//A class representing a cylinder alert shape
class AlertShapeCylinder {
	/*
	Constructs an AlertShapeCylinder.
	If the entityID argument is not null, the shape will be locked relative to the entity with the specified ID.
	The posX, posY, posZ arguments represents the center position of the cylinder.
	The radius specifies the radius of the circle of the cylinder on the XZ-plane.
	The height specifies the height of the cylinder where height/2 is located above posY and height/2 is located below posY. By default the height is set to Infinity.
	*/
	constructor(entityModel, entityID, posX, posY, posZ, radius, height = Infinity) {
		this._entityModel = entityModel;
		this._entityID = entityID;
		this._entity = null;
		this._posX = posX;
		this._posY = posY;
		this._posZ = posZ;
		this._radius = radius;
		this._height = height;
	}

	//Searches for an entity with the correct entityID and if found sets the entity variable.
	_refreshEntity() {
		if(this._entityID != null) {
			if(this._entity == null) {
				this._entity = this._entityModel.getById(this._entityID);
			}
		}
	}

	//Check whether the specified entity is within the cylinder.
	isInside(entity) {
		this._refreshEntity();
		
		//If the entityID is set. Make sure the entity has been found before proceeding.
		if(this._entityID == null || this._entity != null) {
			let posX;
			let posY;
			let posZ;

			if(this._entity != null) {
				//Position the shape relative to the parent entity.
				posX = this._posX + this._entity.posX;
				posY = this._posY + this._entity.posY;
				posZ = this._posZ + this._entity.posZ;
			} else {
				//Position the shape relative to global coordinates.
				posX = this._posX;
				posY = this._posY;
				posZ = this._posZ;
			}

			const cylinderBottom = posY - this._height / 2;
			const cylinderTop = posY + this._height / 2;

			//Check whether the entity is within the height of the cylinder.
			if(entity.posY >= cylinderBottom && entity.posY <= cylinderTop) {
				//Check whether the entity is within the circle of the cylinder.
				const dx = entity.posX - posX;
				const dz = entity.posZ - posZ;
				if(dx * dx + dz * dz <= this._radius * this._radius) {
					//The entity is within the cylinder.
					return true;
				}
			}
		}

		return false;
	}

	//Draw the cylinder shape in 2D on the specified context. The context.fillStyle has to be set prior to calling this function.
	draw(context, camera) {
		this._refreshEntity();
		
		//If the entityID is set. Make sure the entity has been found before proceeding.
		if(this._entityID == null || this._entity != null) {
			let posX;
			let posY;
			let posZ;

			if(this._entity != null) {
				//Position the shape relative to the parent entity.
				posX = this._posX + this._entity.posX;
				posY = this._posY + this._entity.posY;
				posZ = this._posZ + this._entity.posZ;
			} else {
				//Position the shape relative to global coordinates.
				posX = this._posX;
				posY = this._posY;
				posZ = this._posZ;
			}

			const cylinderBottom = posY - this._height / 2;
			const cylinderTop = posY + this._height / 2;
			
			//Check that the cylinder would be visible within the culling values of the camera.
			if(camera.topCulling >= cylinderBottom && camera.bottomCulling <= cylinderTop) {
				//Draw a circle representing the cylinder seen from above.
				context.beginPath();
				context.arc(posX, posZ, this._radius, 0, Math.PI * 2);
				context.fill();
			}
		}
	}
}

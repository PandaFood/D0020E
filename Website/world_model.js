
//A WorldModel keeping track of 2D maps used for visualizing the world
class WorldModel {
	constructor() {
		//Sorted from bottom to top
		this._images = [];

		//Array of heights sorted from bottom to top
		this._floors = null;
	}

	clear() {
		this.clearImages();
	}

	//Deletes all map images
	clearImages() {
		this._images.length = 0;
		this._floors = null;
	}

	//Add map image with specified position and optional rotation and scaling
	addImage(imageURI, posX, posY, posZ, rotation = 0, scale = 1) {
		const map = {
			imageURI:imageURI,
			posX:posX,
			posY:posY,
			posZ:posZ,
			rotation:rotation,
			scale:scale
		};

		let added = false;
		for(let i = 0; i < this._images.length; ++i) {
			if(this._images[i].posY >= map.posY) {
				this._images.splice(i, 0, map);
				added = true;
				break;
			}
		}

		if(!added) {
			this._images.push(map);
		}
		this._floors = null;
	}

	//Returns array of map images
	get images() {
		return this._images;
	}

	get floors() {
		if(this._floors == null) {
			this._floors = [];
			let currentFloor = null;
			for(let i = 0; i < this._images.length; ++i) {
				let image = this._images[i];
				if(currentFloor == null) {
					currentFloor = image.posY;
					this._floors.push(currentFloor);
				} else if(image.posY > currentFloor) {
					currentFloor = image.posY;
					this._floors.push(currentFloor);
				}
			}
		}
		return this._floors;
	}
}


//Renders the world and entities in 2D within a canvas
class View2D {
	constructor(background, view, overlay, camera, worldModel, entityModel, alertModel, userData) {
		this._worldModel = worldModel;
		this._entityModel = entityModel;
		this._alertModel = alertModel;
		this._userData = userData;

		//View div where image elements will be added
		this._view = view;

		//Background canvas with grid
		this._backgroundCanvas = background;
		this._backgroundContext = background.getContext("2d", {alpha:false});

		//Overlay canvas where entities are drawn
		this._canvas = overlay;
		this._context = overlay.getContext("2d");

		//The display pixel ratio
		this._dpr = 1;

		this._disableImageSmoothing();

		//Camera used for positioning the viewport
		this._camera = camera;

		/*
			Key-value map keeping track of icon images
			The keys are the imageURIs
			The value is a HTML element img

			The img element is also a key-value map
			The keys are the color codes(ex. "0xff00ff")
			The values are canvases of the img colored with the specified color
		*/
		this._icons = {};

		//Keeps track of elements added to the view div
		this._viewElements = [];
	}

	/*
		Disables linear interpolation of drawn images
		causing nearest-neighbour interpolation to be used
	*/
	_disableImageSmoothing() {
		this._backgroundContext.mozImageSmoothingEnabled = false;
		this._backgroundContext.webkitImageSmoothingEnabled = false;
		this._backgroundContext.msImageSmoothingEnabled = false;
		this._backgroundContext.imageSmoothingEnabled = false;

		this._context.mozImageSmoothingEnabled = false;
		this._context.webkitImageSmoothingEnabled = false;
		this._context.msImageSmoothingEnabled = false;
		this._context.imageSmoothingEnabled = false;
	}

	//Handles resizing of the canvases
	_updateSize() {
		const dpr = this._dpr = window.devicePixelRatio || 1;

		//Update background canvas size

		const bgWidth = this._backgroundCanvas.width * dpr;
		const bgOffsetWidth = this._backgroundCanvas.offsetWidth * dpr;
		const bgHeight = this._backgroundCanvas.height * dpr;
		const bgOffsetHeight = this._backgroundCanvas.offsetHeight * dpr;

		if(bgWidth != bgOffsetWidth || bgHeight != bgOffsetHeight) {
			this._backgroundCanvas.width = bgOffsetWidth;
			this._backgroundCanvas.height = bgOffsetHeight;
			this._disableImageSmoothing();
		}

		//Update overlay canvas size

		const width = this._canvas.width * dpr;
		const offsetWidth = this._canvas.offsetWidth * dpr;
		const height = this._canvas.height * dpr;
		const offsetHeight = this._canvas.offsetHeight * dpr;

		if(width != offsetWidth || height != offsetHeight) {
			this._canvas.width = offsetWidth;
			this._canvas.height = offsetHeight;
			this._disableImageSmoothing();
		}
	}

	//Strokes a grid filling the screen with scale specifing the distance between grid lines
	_strokeGrid(scale) {
		const dpr = this._dpr;

		const left = this._camera.posX - this._backgroundCanvas.width / dpr / 2 / this._camera.zoom;
		const right = this._camera.posX + this._backgroundCanvas.width / dpr / 2 / this._camera.zoom + scale;
		const top = this._camera.posZ - this._backgroundCanvas.height / dpr / 2 / this._camera.zoom;
		const bottom = this._camera.posZ + this._backgroundCanvas.height / dpr / 2 / this._camera.zoom + scale;
		for(let x = left; x <= right; x += scale) {
			for(let z = top; z <= bottom; z += scale) {
				this._backgroundContext.strokeRect(Math.floor(x / scale) * scale, Math.floor(z / scale) * scale, scale, scale);
			}
		}
	}

	//Draws background and grid
	_drawBackground() {
		const backgroundColor = "#07213d";
		const lineColor = "#32506d";

		//Fill background color
		this._backgroundContext.fillStyle = backgroundColor;
		this._backgroundContext.fillRect(0, 0, this._backgroundCanvas.width, this._backgroundCanvas.height);

		//Setup before drawing grid
		this._setCameraTransform(this._backgroundContext);
		this._backgroundContext.strokeStyle = lineColor;

		//Find which grid sizes to draw
		const logZoom = Math.log2(this._camera.zoom);
		const low = Math.floor(logZoom - 0.5);
		const high = Math.floor(logZoom + 0.5);

		//Draw bigger grid
		this._backgroundContext.lineWidth = 0.2 / Math.pow(2, high);
		this._backgroundContext.beginPath();
		this._strokeGrid(50 / Math.pow(2, high));
		this._backgroundContext.stroke();

		//Draw smaller grid
		this._backgroundContext.lineWidth = 0.5 / Math.pow(2, low);
		this._backgroundContext.beginPath();
		this._strokeGrid(50 / Math.pow(2, low));
		this._backgroundContext.stroke();

		//Reset camera transform
		this._resetTransform(this._backgroundContext);
	}

	//Updates view div elements to visualize the world
	_updateWorld() {
		const images = this._worldModel.images;

		for(let i = 0; i < images.length; ++i) {
			const image = images[i];
			let element = null;

			//Find existing map image element
			for(let j = 0; j < this._viewElements.length; ++j) {
				const e = this._viewElements[j];
				if(e.image == image) {
					element = e;
					break;
				}
			}

			//If element does not exist, create it
			if(element == null) {
				element = new Image();
				element.image = image;
				element.onload = function() {
					//Center image
					this.style.position = "absolute";
					this.style.left = -this.width / 2 + "px";
					this.style.top = -this.height / 2 + "px";
				};
				element.src = image.imageURI;

				this._view.appendChild(element);
				this._viewElements.push(element);
			}

			const visible = (image.posY >= this._camera.bottomCulling && image.posY < this._camera.topCulling);
			if(visible) {
				const dpr = this._dpr;
				const width = image.scale / element.width;
				const height = image.scale / element.width;

				let transform = "";

				//Camera transform
				transform += "translate(" + (-this._camera.posX * this._camera.zoom + this._canvas.width / dpr / 2) + "px," + (-this._camera.posZ * this._camera.zoom + this._canvas.height / dpr / 2) + "px)";
				transform += "scale(" + this._camera.zoom + "," + this._camera.zoom + ")";

				//Image transform
				transform += "translate(" + image.posX + "px," + image.posZ + "px)";
				transform += "rotate(" + image.rotation + "deg)";
				transform += "scale(" + width + "," + height + ")";

				element.style.transform = transform;

				if(element.style.display != "block") {
					element.style.display = "block";
				}
			} else {
				if(element.style.display != "none") {
					element.style.display = "none";
				}
			}
		}

		//Delete unused map image elements
		for(let i = 0; i < this._viewElements.length; ++i) {
			const element = this._viewElements[i];
			let found = false;

			for(let i = 0; i < images.length; ++i) {
				const image = images[i];
				if(image == element.image) {
					found = true;
					break;
				}
			}

			if(!found) {
				this._view.removeChild(element);
				this._viewElements.splice(i, 1);
				--i;
			}
		}
	}

	//Load icon from URI
	_loadIcon(uri) {
		const icon = new Image();
		icon.isLoaded = false;
		icon.addEventListener("error", function() {
			this.src = "images/unknown.png";
		});
		icon.addEventListener("load", function() {
			this.isLoaded = true;
		});
		icon.src = uri;
		this._icons[uri] = icon;
	}

	//Generate color icon canvas
	_loadIconColor(icon, color) {
		//Create canvas and context
		const canvas = document.createElement("canvas");
		canvas.width = icon.width;
		canvas.height = icon.height;
		const context = canvas.getContext("2d");

		//Draw icon
		context.drawImage(icon, 0, 0);
		context.globalCompositeOperation = "source-atop";

		//Colorize
		context.fillStyle = color;
		context.fillRect(0, 0, canvas.width, canvas.height);

		icon[color] = canvas;
	}

	//Get icon and load it if it is unloaded, will return null while loading
	_getIcon(iconURI, color) {
		//If icon does not exist, load it
		if(!this._icons.hasOwnProperty(iconURI)) {
			this._loadIcon(iconURI);
		}
		const icon = this._icons[iconURI];

		if(icon.isLoaded) {
			//If icon color does not exist, generate canvas
			if(!icon.hasOwnProperty(color)) {
				this._loadIconColor(icon, color);
			}

			return icon[color];
		} else {
			return null;
		}
	}

	//Get the size of entities drawn on the canvas
	getEntitySize() {
		const minSize = 0.75;
		const maxSize = 10;
		const sizeFactor = 12;

		const size = Math.max(minSize, Math.min(maxSize, sizeFactor / this._camera.zoom));
		return size;
	}

	//Draw the entities on the overlay canvas
	_drawEntities() {
		for(let i = 0; i < this._entityModel.entities.length; ++i) {
			this._drawEntity(this._entityModel.entities[i]);
		}
	}

	//Draw the specified entity on the overlay canvas
	_drawEntity(entity) {
		if(entity.posY >= this._camera.bottomCulling && entity.posY <= this._camera.topCulling) {
			this._drawEntityIcon(entity);

			//Draw entity display name
			const textZoomLimit = 25;
			if(this._camera.zoom > textZoomLimit) {
				this._drawEntityText(entity);
			}
		}
	}

	_drawEntityIcon(entity) {
		const size = this.getEntitySize();

		const color = entity.color;
		const iconURI = entity.iconURI;

		const icon = this._getIcon(iconURI, color);
		const iconShadow = this._getIcon(iconURI, "#000");

		//Draw black icon at entity position as entity shadow
		if(iconShadow != null) {
			this._context.drawImage(iconShadow, entity.posX - size / 2 + 0.0125, entity.posZ - size / 2 + 0.025, size, size);
		}

		//Draw colored icon at entity position
		if(icon != null) {
			this._context.drawImage(icon, entity.posX - size / 2, entity.posZ - size / 2, size, size);
		}
	}

	_drawEntityText(entity) {
		const size = this.getEntitySize();
		const color = entity.color;

		const textSize = 0.05 * size;
		const text = entity.displayName;

		this._context.translate(entity.posX, entity.posZ);
		this._context.scale(textSize, textSize);

		this._context.font = "bold 10px Verdana";
		const textWidth = this._context.measureText(text).width;
		let textX = -textWidth / 2;
		const textY = 20;

		if(this._userData.isFavorite(entity)) {
			const favoriteStarIcon = this._getIcon("images/star_filled.png", color);
			const favoriteStarIconShadow = this._getIcon("images/star_filled.png", "#000");
			if(favoriteStarIcon != null && favoriteStarIconShadow != null) {
				const favoriteStarSize = 8;
				const starX = textWidth / 2 + 1 - favoriteStarSize / 2;
				const starY = 12.5;
				this._context.drawImage(favoriteStarIconShadow, starX + 0.5, starY + 0.75, favoriteStarSize, favoriteStarSize);
				this._context.drawImage(favoriteStarIcon, starX, starY, favoriteStarSize, favoriteStarSize);

				textX -= favoriteStarSize / 2;
			}
		}

		//Text shadowing
		this._context.fillStyle = "#000";
		this._context.fillText(text, textX + 0.5, textY + 0.75);

		//Text
		this._context.fillStyle = color;
		this._context.fillText(text, textX, textY);

		this._context.scale(1 / textSize, 1 / textSize);
		this._context.translate(-entity.posX, -entity.posZ);
	}

	_drawAlerts() {
		this._context.globalAlpha = 0.5;
		for(let i = 0; i < this._alertModel.alerts.length; ++i) {
			this._alertModel.alerts[i].draw(this._context, this._camera);
		}
		this._context.globalAlpha = 1;
	}

	//Apply camera transform to the specified context
	_setCameraTransform(context) {
		const dpr = this._dpr;
		context.translate(context.canvas.width / 2, context.canvas.height / 2);
		context.scale(this._camera.zoom * dpr, this._camera.zoom * dpr);
		context.translate(-this._camera.posX, -this._camera.posZ);
	}

	//Reset the transform of the specified context
	_resetTransform(context) {
		context.setTransform(1, 0, 0, 1, 0, 0);
	}

	//Redraw view
	update() {
		this._updateSize();
		this._drawBackground();

		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
		this._setCameraTransform(this._context);
		this._updateWorld();
		this._drawAlerts();
		this._drawEntities();
		this._resetTransform(this._context);
	}
}

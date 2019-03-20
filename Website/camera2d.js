
//A 2D Camera with mouse and touch input for movement and zooming
class Camera2D {
	constructor(canvas) {
		this._canvas = canvas;

		//Current state of the camera
		this._posX = 0;
		this._posZ = 0;
		this._zoom = 1;
		this._bottomCulling = -Infinity;
		this._topCulling = Infinity;

		//Camera limits
		this._minPosX = -Infinity;
		this._maxPosX = Infinity;
		this._minPosZ = -Infinity;
		this._maxPosZ = Infinity;
		this._minZoom = 1 / 1000000000;
		this._maxZoom = 400;

		//Grabbed position in world space
		this._grabPos = null;

		//Array of grabbed pinch positions in world space, used for zooming with touch
		this._zoomGrabPositions = null;

		let self = this;

		//Disable right click context menu
		canvas.addEventListener("contextmenu", function(event) {
			event.preventDefault();
		});

		//Mouse dragging
		canvas.addEventListener("mousedown", function(event) {
			self._grabDown(event.clientX, event.clientY);
		});
		window.addEventListener("mouseup", function(event) {
			self._grabUp();
		});
		window.addEventListener("mousemove", function(event) {
			self._grabMove(event.clientX, event.clientY);
		});

		//Mouse scroll wheel zooming
		canvas.addEventListener("wheel", function(event) {
			self._scrollEvent(event);
		});

		//Touch dragging and pinch zooming
		canvas.addEventListener("touchstart", function(event) {
			self._touchStart(event);

			//Prevent page zooming which causes touch event throttling
			event.preventDefault();
		});
		window.addEventListener("touchend", function(event) {
			self._touchEnd(event);
		});
		window.addEventListener("touchmove", function(event) {
			self._touchMove(event);
		});
	}

	_grabDown(x, y) {
		this._grabPos = this.screenToWorld(x, y);
	}
	_grabUp(event) {
		this._grabPos = null;
	}
	_grabMove(x, y) {
		if(this._grabPos != null) {
			const pos = this.screenToWorld(x, y);
			this.posX += this._grabPos.x - pos.x;
			this.posZ += this._grabPos.z - pos.z;
		}
	}

	_scrollEvent(event) {
		//Mouse world space position before zoom
		const before = this.screenToWorld(event.clientX, event.clientY);

		//Perform zooming
		const speed = 1.1;
		if(event.deltaY > 0) {
			this.zoom = Math.max(this._minZoom, this.zoom / speed);
		} else if(event.deltaY < 0) {
			this.zoom = Math.min(this._maxZoom, this.zoom * speed);
		}

		//Mouse world space position after zoom
		const after = this.screenToWorld(event.clientX, event.clientY);

		//Move camera to keep mouse at same world space position
		this.posX = before.x - (after.x - this.posX);
		this.posZ = before.z - (after.z - this.posZ);
	}

	_touchStart(event) {
		if(event.touches.length == 1) {
			//Start drag with 1 touch point
			const touch = event.touches[0];
			this._grabDown(touch.clientX, touch.clientY);
		} else if(event.touches.length == 2) {
			const touch0 = event.touches[0];
			const touch1 = event.touches[1];

			//Start drag with 2 touch points
			const centerX = (touch0.clientX + touch1.clientX) / 2;
			const centerY = (touch0.clientY + touch1.clientY) / 2;
			this._grabDown(centerX, centerY);

			//Start pinch zoom with 2 touch points
			this._zoomGrabPositions = [
				this.screenToWorld(touch0.clientX, touch0.clientY),
				this.screenToWorld(touch1.clientX, touch1.clientY)
			];
		} else {
			//Release grab if no touch points, or more than 2 touch points
			this._grabUp();
		}
	}
	_touchEnd(event) {
		if(event.touches.length == 1) {
			//Grab when going from 2 touch points to 1 touch point
			const touch = event.touches[0];
			this._grabDown(touch.clientX, touch.clientY);
		} else {
			this._grabUp();
		}

		//Release pinch zoom grab
		this._zoomGrabPositions = null;
	}
	_touchMove(event) {
		if(event.touches.length == 1) {
			//Drag with 1 touch point
			const touch = event.touches[0];
			this._grabMove(touch.clientX, touch.clientY);
		} else if(event.touches.length == 2) {
			const touch0 = event.touches[0];
			const touch1 = event.touches[1];

			//Position between the 2 touch points
			const centerX = (touch0.clientX + touch1.clientX) / 2;
			const centerY = (touch0.clientY + touch1.clientY) / 2;

			//Drag with 2 touch points
			this._grabMove(centerX, centerY);

			//Pinch zoom with 2 touch points
			if(this._zoomGrabPositions != null) {
				//Current touch positions
				const current0 = this.screenToWorld(touch0.clientX, touch0.clientY);
				const current1 = this.screenToWorld(touch1.clientX, touch1.clientY);

				//Distance between the 2 current touch positions
				const currentDistance = Math.sqrt(Math.pow(current0.x - current1.x, 2) + Math.pow(current0.z - current1.z, 2));

				//Starting pinch zoom touch positions
				const start0 = this._zoomGrabPositions[0];
				const start1 = this._zoomGrabPositions[1];

				//Distance between the 2 start touch positions
				const startDistance = Math.sqrt(Math.pow(start0.x - start1.x, 2) + Math.pow(start0.z - start1.z, 2));

				//Touch center world space position before zoom
				const before = this.screenToWorld(centerX, centerY);

				//Apply zoom
				this.zoom *= currentDistance / startDistance;

				//Touch center world space position after zoom
				const after = this.screenToWorld(centerX, centerY);

				//Move camera to keep the touch center at the same world space position
				this.posX = before.x - (after.x - this.posX);
				this.posZ = before.z - (after.z - this.posZ);
			}
		} else {
			this._grabUp();
		}
	}

	//Converts a screen space position to world space
	screenToWorld(x, y) {
		const dpr = window.devicePixelRatio || 1;
	 	return {
			x:(x - this._canvas.width / dpr / 2) / this.zoom + this.posX,
			z:(y - this._canvas.height / dpr / 2) / this.zoom + this.posZ
		};
	}

	//Move the camera to the entity and select the correct floor
	goToEntity(entity, floors) {
		this.posX = entity.posX;
		this.posZ = entity.posZ;
		this.zoom = 50;

		for(let i = floors.length - 1; i >= 0; --i) {
			if(entity.posY >= floors[i] || i == 0) {
				if(i == 0) {
					this._bottomCulling = -Infinity;
				} else {
					this._bottomCulling = floors[i];
				}

				if(i == floors.length - 1) {
					this._topCulling = Infinity;
				} else {
					this._topCulling = floors[i + 1];
				}

				break;
			}
		}
	}

	//Move the view down one floor
	floorMoveDown(floors) {
		if(this._bottomCulling > -Infinity) {
			for(let i = 1; i < floors.length; ++i) {
				if(floors[i] == this._bottomCulling) {
					this._topCulling = floors[i];
					if(i == 1) {
						this._bottomCulling = -Infinity;
					} else {
						this._bottomCulling = floors[i - 1];
					}
					break;
				}
			}
		}
	}
	
	//Move the view up one floor
	floorMoveUp(floors) {
		if(this._topCulling < Infinity) {
			for(let i = 0; i < floors.length; ++i) {
				if(floors[i] == this._topCulling) {
					this._bottomCulling = floors[i];
					if(i == floors.length - 1) {
						this._topCulling = Infinity;
					} else {
						this._topCulling = floors[i + 1];
					}
					break;
				}
			}
		}
	}

	//Move the view to the bottom floor
	floorSetBottom(floors) {
		this._bottomCulling = -Infinity;
		if(floors.length > 1) {
			this._topCulling = floors[1];
		} else {
			this._topCulling = Infinity;
		}
	}

	set minPosX(minPosX) {
		this._minPosX = minPosX;
		this._posX = Math.max(this._minPosX, this._posX);
	}
	get minPosX() {
		return this._minPosX;
	}

	set maxPosX(maxPosX) {
		this._maxPosX = maxPosX;
		this._posX = Math.min(this._maxPosX, this._posX);
	}
	get maxPosX() {
		return this._maxPosX;
	}

	set minPosZ(minPosZ) {
		this._minPosZ = minPosZ;
		this._posZ = Math.max(this._minPosZ, this._posZ);
	}
	get minPosZ() {
		return this._minPosZ;
	}

	set maxPosZ(maxPosZ) {
		this._maxPosZ = maxPosZ;
		this._posZ = Math.min(this._maxPosZ, this._posZ);
	}
	get maxPosZ() {
		return this._maxPosZ;
	}

	set minZoom(minZoom) {
		this._minZoom = minZoom;
		this._zoom = Math.max(this._minZoom, this._zoom);
	}
	get minZoom() {
		return this._minZoom;
	}

	set maxZoom(maxZoom) {
		this._maxZoom = maxZoom;
		this._zoom = Math.min(this._maxZoom, this._zoom);
	}
	get maxZoom() {
		return this.maxZoom;
	}

	set posX(posX) {
		this._posX = Math.max(this._minPosX, Math.min(this._maxPosX, posX));
	}
	get posX() {
		return this._posX;
	}

	set posZ(posZ) {
		this._posZ = Math.max(this._minPosZ, Math.min(this._maxPosZ, posZ));
	}
	get posZ() {
		return this._posZ;
	}

	set zoom(zoom) {
		this._zoom = Math.max(this._minZoom, Math.min(this._maxZoom, zoom));
	}
	get zoom() {
		return this._zoom;
	}

	get bottomCulling() {
		return this._bottomCulling;
	}
	get topCulling() {
		return this._topCulling;
	}
}

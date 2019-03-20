
//A class handling user interactions with entities from a map view.
class EntityInteraction {
	constructor(infoUI, entityModel, view2D, camera2D, overlayCanvas) {
		const self = this;

		this._infoUI = infoUI;
		this._entityModel = entityModel;
		this._view2D = view2D;
		this._camera2D = camera2D;

		//The position from when the mouse button was pressed
		this._mouseDownPosition = null;
		
		//Whether the current interaction is still a valid click
		this._mouseIsClick = null;

		overlayCanvas.addEventListener("mousedown", function(event) {
			self._mouseDownPosition = {x:event.clientX, y:event.clientY};
			self._mouseIsClick = true;
		});
		overlayCanvas.addEventListener("mousemove", function(event) {
			if(self._mouseDownPosition != null) {
				const dx = event.clientX - self._mouseDownPosition.x;
				const dy = event.clientY - self._mouseDownPosition.y;
				
				//Check whether the mouse has moved more than 25 pixels from the position the mouse button was first pressed at.
				if(Math.abs(dx) > 25 || Math.abs(dy) > 25) {
					//If the mouse has moved too much this is no longer a valid click, since the user is dragging the map.
					self._mouseIsClick = false;
				}
			}
		});
		overlayCanvas.addEventListener("mouseup", function(event) {
			//Run the click event only if this is a valid click.
			if(self._mouseIsClick) {
				self._click(event.clientX, event.clientY);
			}
		});

		//The position from when the touch event first started
		this._touchDownPosition = null;
		
		//Whether the current interaction is still a valid click
		this._touchIsClick = null;

		overlayCanvas.addEventListener("touchstart", function(event) {
			if(event.touches.length > 0) {
				const touch = event.touches[0];
				self._touchDownPosition = {x:touch.clientX, y:touch.clientY};
				self._touchIsClick = true;
			}
		});
		overlayCanvas.addEventListener("touchmove", function(event) {
			if(event.touches.length > 0) {
				const touch = event.touches[0];
				if(self._touchDownPosition != null) {
					const dx = touch.clientX - self._touchDownPosition.x;
					const dy = touch.clientY - self._touchDownPosition.y;
					
					//Check whether the touch point has moved more than 25 pixels from where it started.
					if(Math.abs(dx) > 25 || Math.abs(dy) > 25) {
						//If the touch event has moved too much this is no longer a valid click, since the user is dragging the map.
						self._touchIsClick = false;
					}
				}
			}
		});
		overlayCanvas.addEventListener("touchend", function(event) {
			if(event.changedTouches.length > 0) {
				const touch = event.changedTouches[0];
				
				//Run the click event only if this is a valid click
				if(self._touchIsClick) {
					self._click(touch.clientX, touch.clientY);
				}
			}
		});
	}

	//Trigger a click event on the specified screen coordinates
	_click(x, y) {
		//Convert to world coordinates
		const pos = this._camera2D.screenToWorld(x, y);

		//Find the nearest entity to the clicking position.
		let nearestEntity = null;
		let nearestDistanceSquared = Infinity;
		for(let i = 0; i < this._entityModel.entities.length; ++i) {
			const entity = this._entityModel.entities[i];

			const dx = entity.posX - pos.x;
			const dz = entity.posZ - pos.z;
			const distanceSquared = dx * dx + dz * dz;

			if(distanceSquared < nearestDistanceSquared) {
				nearestEntity = entity;
				nearestDistanceSquared = distanceSquared;
			}
		}

		if(nearestEntity != null) {
			//Check whether the nearest entity is within the interaction distance.
			const interactionDistance = 1.5 * this._view2D.getEntitySize();
			if(nearestDistanceSquared < interactionDistance * interactionDistance) {
				//Show entity info
				this._infoUI.show(nearestEntity);
			}
		}
	}
}

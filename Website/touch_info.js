
//Touch user interface showing info regarding an entity
class TouchInfo {
	constructor(div, userData, entityModel, view2D, camera2D, overlayCanvas) {
		const self = this;

		this._userData = userData;
		this._entityModel = entityModel;
		this._entityInteraction = new EntityInteraction(this, entityModel, view2D, camera2D, overlayCanvas);

		this._div = document.createElement("div");
		this._div.className = "touch_info";
		div.appendChild(this._div);

		this._close = document.createElement("div");
		this._close.className = "close";
		this._close.addEventListener("click", function() {
			self.hide();
		});
		this._div.appendChild(this._close);

		this._title = document.createElement("h1");
		this._div.appendChild(this._title);

		this._info = document.createElement("div");
		this._div.appendChild(this._info);

		this._buttonFavorite = document.createElement("div");
		this._buttonFavorite.className = "button";
		this._buttonFavorite.addEventListener("click", function(event) {
			if(self._userData.isFavorite(self._entity)) {
				self._userData.removeFavorite(self._entity);
			} else {
				self._userData.addFavorite(self._entity);
			}
		});
		this._div.appendChild(this._buttonFavorite);

		this._button = document.createElement("div");
		this._button.className = "button";
		this._button.addEventListener("click", function(event) {
			if(self._userData.activeUser == self._entity) {
				self._userData.activeUser = null;
			} else {
				self._userData.activeUser = self._entity;
			}
		});
		this._div.appendChild(this._button);

		this._entity = null;
		this._isOpen = false;
	}

	hide() {
		if(this._isOpen) {
			this._div.style.display = "none";
			this._entity = null;
			this._isOpen = false;
		}
	}
	show(entity) {
		if(!this._isOpen) {
			this._div.style.display = "block";
			this._entity = entity;
			this._isOpen = true;

			this.update();
		}
	}

	_addInfo(text) {
		const p = document.createElement("p");
		p.textContent = text;
		this._info.appendChild(p);
	}

	update() {
		const entity = this._entity;
		if(entity != null) {
			const activeUser = this._userData.activeUser;

			this._title.textContent = entity.displayName;
			if(activeUser != null && activeUser != entity) {
				this._title.innerHTML += " (" + activeUser.formattedDistanceTo(entity) + ")";
			}

			this._info.innerHTML = "";

			const type = this._entityModel.getType(entity.type);
			if(type == null) {
				this._addInfo("Type: Unknown type \"" + type + "\"");
			} else {
				this._addInfo("Type: " + type.displayName);
			}


			this._addInfo("Position: (" + entity.posX + ", " + entity.posY + ", " + entity.posZ + ")");
			this._addInfo("Velocity: (" + entity.velX + ", " + entity.velY + ", " + entity.velZ + ")");
			if(entity.battery != null) {
				this._addInfo("Battery: " + Math.floor(entity.battery * 100) + "%");
			}
			if(entity.signal != null) {
				this._addInfo("Signal strength: " + entity.signal);
			}

			if(this._userData.isFavorite(this._entity)) {
				this._buttonFavorite.textContent = "Clear favourite";
			} else {
				this._buttonFavorite.textContent = "Set as favourite";
			}

			if(this._entity == activeUser) {
				this._button.textContent = "Clear active user";
			} else {
				this._button.textContent = "Set active user";
			}
		}
	}
}

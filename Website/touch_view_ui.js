
//Touch user interface for home button and floor changing buttons
class TouchViewUI {
	constructor(div, userData, worldModel, camera2D) {
		const self = this;

		this._userData = userData;
		this._worldModel = worldModel;
		this._camera2D = camera2D;

		this._div = document.createElement("div");
		this._div.className = "touch_view_ui";
		div.appendChild(this._div);

		const arrows = document.createElement("div");
		arrows.className = "arrows";
		this._div.appendChild(arrows);

		this._arrowUp = document.createElement("div");
		this._arrowUp.addEventListener("click", function() {
			self._camera2D.floorMoveUp(self._worldModel.floors);
			self._updateButtons();
		});
		arrows.appendChild(this._arrowUp);

		this._arrowDown = document.createElement("div");
		this._arrowDown.addEventListener("click", function() {
			self._camera2D.floorMoveDown(self._worldModel.floors);
			self._updateButtons();
		});
		arrows.appendChild(this._arrowDown);

		this._home = document.createElement("div");
		this._home.className = "home";
		this._home.addEventListener("click", function() {
			const activeUser = self._userData.activeUser;
			if(activeUser != null) {
				self._camera2D.goToEntity(activeUser, self._worldModel.floors);
			}
		});
		this._div.appendChild(this._home);
	}

	show() {
		this._div.style.display = "block";
		this._isOpen = true;
		this._updateButtons();
	}
	hide() {
		this._div.style.display = "none";
		this._isOpen = false;
	}

	_updateButtons() {
		if(this._camera2D.topCulling != Infinity) {
			this._arrowUp.className = "";
		} else {
			this._arrowUp.className = "disabled";
		}

		if(this._camera2D.bottomCulling != -Infinity) {
			this._arrowDown.className = "";
		} else {
			this._arrowDown.className = "disabled";
		}

		if(this._userData.activeUser != null) {
			this._home.style.display = "block";
		} else {
			this._home.style.display = "none";
		}
	}

	update() {
		this._updateButtons();
	}
}

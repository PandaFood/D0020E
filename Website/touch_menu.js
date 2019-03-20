
//Touch user interface for the menu
class TouchMenu {
	constructor(div, userData, network, touchLogin, worldModel, camera2D) {
		const self = this;

		this._userData = userData;
		this._worldModel = worldModel;
		this._camera2D = camera2D;

		this._div = document.createElement("div");
		this._div.className = "touch_menu";
		div.appendChild(this._div);

		this._addButton("Disconnect", function() {
			network.disconnect();
			touchLogin.show();
			self.hide();
		});

		this._clearUserButton = this._addButton("Go to active user", function() {
			const activeUser = self._userData.activeUser;
			if(activeUser != null) {
				self._camera2D.goToEntity(activeUser, self._worldModel.floors);
				self.hide();
			}
		});
	}

	_updateClearUserButton() {
		if(this._userData.activeUser == null) {
			this._clearUserButton.className = "disabled";
		} else {
			this._clearUserButton.className = "";
		}
	}

	_addButton(text, onClick) {
		const button = document.createElement("div");
		button.textContent = text;
		button.addEventListener("click", onClick);
		this._div.appendChild(button);

		return button;
	}

	show() {
		this._div.style.display = "block";
		this._isOpen = true;
		this._updateClearUserButton();
	}
	hide() {
		this._div.style.display = "none";
		this._isOpen = false;
	}
	toggle() {
		if(this._isOpen) {
			this.hide();
		} else {
			this.show();
		}
	}
}

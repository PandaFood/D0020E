
//Touch user interface
class TouchUI {
	constructor(div, network, userData, alertModel, entityModel, worldModel, view2D, camera2D, overlayCanvas) {
		const self = this;

		this._login = new TouchLogin(div, network);
		this._viewUI = new TouchViewUI(div, userData, worldModel, camera2D);
		this._info = new TouchInfo(div, userData, entityModel, view2D, camera2D, overlayCanvas);
		this._menu = new TouchMenu(div, userData, network, this._login, worldModel, camera2D);
		this._alert = new TouchAlert(div, userData, alertModel);
		this._search = new TouchSearch(div, userData, entityModel, worldModel, camera2D);

		this._navigation = new TouchNavigation(div);
		this._navigation.addButton("images/menu.png", function() {
			self._info.hide();
			self._menu.toggle();
			self._alert.hide();
			self._search.hide();
		});
		this._alertButton = this._navigation.addAlertButton(alertModel, function() {
			self._info.hide();
			self._menu.hide();
			self._alert.toggle();
			self._search.hide();
		});
		this._navigation.addButton("images/magnifier.png", function() {
			self._info.hide();
			self._menu.hide();
			self._alert.hide();
			self._search.toggle();
		});
	}

	update() {
		this._alertButton.update();
		this._alert.update();
		this._login.update();
		this._info.update();
		this._viewUI.update();
	}
}

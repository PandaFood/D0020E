
//Touch user interface showing list of alerts the active user is within.
class TouchAlert {
	constructor(div, userData, alertModel) {
		const self = this;

		this._userData = userData;
		this._alertModel = alertModel;

		this._div = document.createElement("div");
		this._div.className = "touch_alert";
		div.appendChild(this._div);

		this._lastUpdateCount = alertModel.getUpdateCount();
		this._isOpen = false;
	}

	//Show the UI
	show() {
		this._div.style.display = "block";
		this._isOpen = true;
		this._refresh();
	}
	
	//Hide the UI
	hide() {
		this._div.style.display = "none";
		this._isOpen = false;
	}
	
	//Toggle showing and hiding the UI
	toggle() {
		if(this._isOpen) {
			this.hide();
		} else {
			this.show();
		}
	}

	//Add an alert to the list
	_addAlert(alert) {
		const self = this;

		const div = document.createElement("div");

		const img = document.createElement("img");
		switch(alert.severity) {
			case Alert.severity.low: img.src = "images/alert_yellow.png"; break;
			case Alert.severity.medium: img.src = "images/alert_orange.png"; break;
			case Alert.severity.high: img.src = "images/alert_red.png"; break;
		}
		div.appendChild(img);

		const p = document.createElement("p");
		p.textContent = alert.message;
		p.style.color = alert.getColor();
		div.appendChild(p);

		this._div.appendChild(div);
	}
	
	//Refresh the alert list
	_refresh() {
		this._lastUpdateCount = this._alertModel.getUpdateCount();

		this._div.innerHTML = "";
		const alerts = this._alertModel.getCurrentAlerts();
		for(let i = 0; i < alerts.length; ++i) {
			this._addAlert(alerts[i]);
		}
	}

	update() {
		//If the alerts list has been updated refresh the UI
		if(this._lastUpdateCount != this._alertModel.getUpdateCount()) {
			this._refresh();
		}
	}
}

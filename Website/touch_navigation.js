
//Touch user interface for the navigation bar
class TouchNavigation {
	constructor(div) {
		this._navigation = document.createElement("div");
		this._navigation.className = "touch_navigation";
		div.appendChild(this._navigation);
	}

	addButton(imageURI, onClick) {
		let div = document.createElement("div");
		div.addEventListener("click", onClick);

		let img = document.createElement("img");
		img.src = imageURI;
		div.appendChild(img);

		this._navigation.appendChild(div);

		for(let i = 0; i < this._navigation.children.length; ++i) {
			let element = this._navigation.children[i];
			element.style.width = "calc(" + (100 / this._navigation.children.length) + "% - 3px)";
		}

		return div;
	}

	addAlertButton(alertModel, onClick) {
		const button = this.addButton("images/alert_white.png", onClick);
		let lastUpdateCounter = alertModel.getUpdateCount();
		button.update = function() {
			if(alertModel.getUpdateCount() != lastUpdateCounter) {
				const alerts = alertModel.getCurrentAlerts();
				let maxSeverity = null;
				for(let i = 0; i < alerts.length; ++i) {
					const alert = alerts[i];
					if(maxSeverity == null) {
						maxSeverity = alert.severity;
					} else if(alert.severity > maxSeverity) {
						maxSeverity = alert.severity;
					}
				}

				if(maxSeverity == null) {
					this.children[0].src = "images/alert_white.png";
				} else if(maxSeverity == Alert.severity.low) {
					this.children[0].src = "images/alert_yellow.png";
				} else if(maxSeverity == Alert.severity.medium) {
					this.children[0].src = "images/alert_orange.png";
				} else if(maxSeverity == Alert.severity.high) {
					this.children[0].src = "images/alert_red.png";
				}

				lastUpdateCounter = alertModel.getUpdateCount();
			}
		};
		return button;
	}
}

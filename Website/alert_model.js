
//A class keeping track of global alerts and the alerts 
class AlertModel {
	//Constructors an AlertModel with the specified UserData. The UserData is needed since the AlertModel has to know which entity is the active user.
	constructor(userData) {
		this._userData = userData;

		//Incremented by one each time the currentAlerts list has been updated. This variable is used by UI displaying real time data which has to know when the data has changed.
		this._updateCounter = 0;
		
		//Keeps track of the alerts the active user is within.
		this._currentAlerts = [];
		
		//List of all added alerts
		this.alerts = [];
	}

	//Returns all alerts the specified entity is within
	getAlerts(entity) {
		let alerts = [];

		for(let i = 0; i < this.alerts.length; ++i) {
			const alert = this.alerts[i];
			if(alert.isInside(entity)) {
				alerts.push(alert);
			}
		}

		return alerts;
	}

	//Get the number of times the current alerts list has been updated.
	getUpdateCount() {
		return this._updateCounter;
	}
	
	//Get the alerts the active user is within.
	getCurrentAlerts() {
		return this._currentAlerts;
	}

	//Updates the list of current alerts the active user is within.
	update() {
		++this._updateCounter;
		const activeUser = this._userData.activeUser;
		if(activeUser != null) {
			this._currentAlerts = this.getAlerts(activeUser);
		} else {
			this._currentAlerts = [];
		}
	}
}

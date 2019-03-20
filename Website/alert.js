
//A class representing Alerts. AlertShapes can be added to the alert to define an area for the alert. When no AlertShapes have been added the Alert spans over an infinity area.
class Alert {
	//Construct an Alert with the specified alert message and severity.
	constructor(message, severity) {
		this._shapes = [];
		this._message = message;
		this._severity = severity;

		//Make sure severity is within range.
		if(severity < 0 || severity > 2) {
			throw "Undefined alert severity";
		}
	}

	//The alert message
	get message() {
		return this._message;
	}
	
	//The alert severity
	get severity() {
		return this._severity;
	}

	//Add an AlertShape to the alert.
	addShape(shape) {
		this._shapes.push(shape);
	}

	//Check whether the specified entity is within the area of the alert.
	isInside(entity) {
		//If there are no shapes, the area is infinite.
		if(this._shapes.length == 0) {
			return true;
		}

		//Check if the entity is within any of the added shapes.
		for(let i = 0; i < this._shapes.length; ++i) {
			if(this._shapes[i].isInside(entity)) {
				return true;
			}
		}

		return false;
	}

	//Get the color of the alert. The color varies depending on the severity.
	getColor() {
		switch(this._severity) {
			case Alert.severity.low: return "#efcb16";
			case Alert.severity.medium: return "#ef8717";
			case Alert.severity.high: return "#d82929";
		}
	}

	//Draw the alert area on the specified context.
	draw(context, camera) {
		context.fillStyle = this.getColor();
		for(let i = 0; i < this._shapes.length; ++i) {
			this._shapes[i].draw(context, camera);
		}
	}
}

//An enum representing different alert severity levels
Alert.severity = {
	low:0,
	medium:1,
	high:2
}

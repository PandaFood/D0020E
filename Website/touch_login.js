
//Touch user interface for the login page
class TouchLogin {
	constructor(div, network) {
		const self = this;

		this._network = network;

		this._div = document.createElement("div");
		this._div.className = "touch_login";
		div.appendChild(this._div);

		const title = document.createElement("h1");
		title.textContent = "Varnande Lurar";
		this._div.appendChild(title);

		this._urlInput = document.createElement("input");
		this._urlInput.type = "text";
		this._urlInput.placeholder = "Server IP";
		this._div.appendChild(this._urlInput);

		this._passwordInput = document.createElement("input");
		this._passwordInput.type = "password";
		this._passwordInput.placeholder = "Password";
		this._div.appendChild(this._passwordInput);

		this._button = document.createElement("div");
		this._button.textContent = "Connect";
		this._button.addEventListener("click", function() {
			if(!self._isLoading) {
				self._message.textContent = "";
				self._showLoading();
				self._connect();
			}
		});
		this._div.appendChild(this._button);

		this._message = document.createElement("p");
		this._div.appendChild(this._message);

		this._isOpen = true;
		this._isLoading = false;
	}

	_showLoading() {
		this._isLoading = true;
		this._button.className = "loading";
		this._button.textContent = "Loading...";
	}
	_hideLoading() {
		this._isLoading = false;
		this._button.className = "";
		this._button.textContent = "Connect";
	}

	_connect() {
		const url = this._urlInput.value;
		const password = this._passwordInput.value;
		this._network.connect(url, password);
	}

	hide() {
		if(this._isOpen) {
			this._div.style.display = "none";
			this._isOpen = false;
		}
	}
	show() {
		if(!this._isOpen) {
			this._div.style.display = "block";
			this._isOpen = true;
		}
	}

	_showError(text) {
		this._message.textContent = text;
		this.show();
	}

	update() {
		if(this._network.hasError()) {
			this._showError(this._network.getErrorMessage());
			this._hideLoading();
		} else if(this._network.isAuthorized()) {
			this.hide();
			this._hideLoading();
		}
	}
}

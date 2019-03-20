
//Keeps track of the active user and favorites
class UserData {
	constructor(entityModel) {
		this._entityModel = entityModel;

		this._activeUserEntity = null;
		this._activeUserID = null;
		this._loadActiveUser();

		this._favorites = new Map();
		this._favoritesList = [];
		this._unpairedFavorites = new Map();
		this._loadFavorites();
	}

	set activeUser(entity) {
		this._activeUserEntity = entity;
		if(entity != null) {
			this._activeUserID = entity.id;
		} else {
			this._activeUserID = null;
		}
		this._saveActiveUser();
	}
	get activeUser() {
		if(this._activeUserEntity == null && this._activeUserID != null) {
			this._activeUserEntity = this._entityModel.getById(this._activeUserID);
		}
		return this._activeUserEntity;
	}

	//Add an entity to favorites without saving
	_addFavorite(entity) {
		if(this._favorites.has(entity.localID)) {
			throw "Entity is already favorited";
		}

		this._favorites.set(entity.localID, entity);
		this._favoritesList.push(entity);
	}

	//Add an entity to favorites
	addFavorite(entity) {
		this._addFavorite(entity);
		this._saveFavorites();
	}

	//Remove an entity from favorites
	removeFavorite(entity) {
		if(this._favorites.has(entity.localID)) {
			this._favorites.delete(entity.localID);

			for(let i = 0; i < this._favoritesList.length; ++i) {
				if(this._favoritesList[i] == entity) {
					this._favoritesList.splice(i, 1);
					break;
				}
			}

			this._saveFavorites();
		} else {
			throw "Can not remove entity favorite since it does not exist";
		}
	}

	//Check whether the given entity is favorited or not
	isFavorite(entity) {
		if(this._unpairedFavorites.has(entity.id)) {
			this._unpairedFavorites.delete(entity.id);
			this._addFavorite(entity);
		}

		return this._favorites.has(entity.localID);
	}

	//Store favorites in localStorage
	_saveFavorites() {
		try {
			if(window.localStorage) {
				const favorites = [];

				for(let i = 0; i < this._favoritesList.length; ++i) {
					favorites.push(this._favoritesList[i].id);
				}

				this._unpairedFavorites.forEach(function(value, key) {
					favorites.push(key);
				});

				localStorage.setItem("favorites", JSON.stringify(favorites));
			}
		} catch(error) {
			//Fail silently
		}
	}

	//Load favorites from localStorage
	_loadFavorites() {
		try {
			if(window.localStorage) {
				const favorites = JSON.parse(localStorage.getItem("favorites"));
				if(favorites != null) {
					for(let i = 0; i < favorites.length; ++i) {
						this._unpairedFavorites.set(favorites[i], true);
					}
				}
			}
		} catch(error) {
			//Fail silently
		}
	}

	//Store active user in localStorage
	_saveActiveUser() {
		try {
			if(window.localStorage) {
				localStorage.setItem("active_user", this._activeUserID);
			}
		} catch(error) {
			//Fail silently
		}
	}

	//Load active user from localStorage
	_loadActiveUser() {
		try {
			if(window.localStorage) {
				this._activeUserID = localStorage.getItem("active_user");
			}
		} catch(error) {
			//Fail silently
		}
	}
}

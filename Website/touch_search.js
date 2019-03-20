
//Touch user interface  
class TouchSearch {
	constructor(div, userData, entityModel, worldModel, camera2D) {
		this._userData = userData;
		this._entityModel = entityModel;
		this._worldModel = worldModel;
		this._camera2D = camera2D;

		this._div = document.createElement("div");
		this._div.className = "touch_search";
		div.appendChild(this._div);

		this._searchBar = null;
		this._backButton = null;
		this._createSearchBar();

		this._category = document.createElement("div");
		this._category.className = "category";
		this._div.appendChild(this._category);

		this._search = document.createElement("div");
		this._search.className = "search";
		this._div.appendChild(this._search);

		this._currentType = null;
		this._isOpen = false;
	}

	_hideBackButton() {
		this._backButton.style.visibility = "hidden";
	}
	_showBackButton() {
		this._backButton.style.visibility = "visible";
	}

	_createSearchBar() {
		const self = this;

		const div = document.createElement("div");

		const span = document.createElement("span");
		span.className = "back";
		span.addEventListener("click", function() {
			self.showCategory();
		});
		this._backButton = span;

		const image = document.createElement("img");
		image.src = "images/back.png";
		span.appendChild(image);

		div.appendChild(span);

		const bar = document.createElement("input");
		bar.type = "text";
		bar.placeholder = "Search";
		bar.addEventListener("input", function() {
			self.showSearch(self._currentType, this.value);
		});
		div.appendChild(bar);
		this._searchBar = bar;

		const image2 = document.createElement("img");
		image2.src = "images/magnifier.png";
		div.appendChild(image2);

		this._div.appendChild(div);
	}
	_clearSearchBar() {
		this._searchBar.value = "";
	}
	_searchMatch(entity, query) {
		if(query == null) {
			return true;
		} else {
			const q = query.toLowerCase();
			const name = entity.displayName.toLowerCase();
			if(name.includes(q)) {
				return true;
			} else {
				return false;
			}
		}
	}

	_clearCategories() {
		this._category.innerHTML = "";
	}
	_addCategory(type) {
		const self = this;
		const entityType = this._entityModel.getType(type);

		const div = document.createElement("div");
		div.addEventListener("click", function() {
			self.showSearch(type);
		});

		const img = document.createElement("img");
		if(type == null) {
			img.src = "images/all.png";
		} else if(entityType == null) {
			img.src = "images/unknown.png";
		} else {
			img.src = entityType.iconURI;
		}
		div.appendChild(img);

		let numberOfEntities = 0;
		for(let i = 0; i < this._entityModel.entities.length; ++i) {
			const entity = this._entityModel.entities[i];
			if(entity.type == type || type == null) {
				++numberOfEntities;
			}
		}

		const title = document.createElement("h2");
		if(type == null) {
			title.textContent = "All" + " (" + numberOfEntities + ")";
		} else if(entityType == null) {
			title.textContent = "Unknown type \"" + type + "\" (" + numberOfEntities + ")";
		} else {
			title.textContent = entityType.displayName + " (" + numberOfEntities + ")";
		}
		div.appendChild(title);

		this._category.appendChild(div);
	}

	_clearSearch() {
		this._search.innerHTML = "";
	}
	_createSearchTitle(type) {
		const entityType = this._entityModel.getType(type);

		const span = document.createElement("span");
		span.className = "title";

		let numberOfEntities = 0;
		for(let i = 0; i < this._entityModel.entities.length; ++i) {
			const entity = this._entityModel.entities[i];
			if(entity.type == type || type == null) {
				++numberOfEntities;
			}
		}

		const title = document.createElement("h1");
		if(type == null) {
			title.textContent = "All" + " (" + numberOfEntities + ")";
		} else if(entityType == null) {
			title.textContent = "Unknown type \"" + type + "\" (" + numberOfEntities + ")";
		} else {
			title.textContent = entityType.displayName + " (" + numberOfEntities + ")";
		}
		span.appendChild(title);

		this._search.appendChild(span);
	}
	_addSearchElement(entity) {
		const self = this;

		const div = document.createElement("div");
		div.addEventListener("click", function() {
			self._camera2D.goToEntity(entity, self._worldModel.floors);
			self.hide();
		});

		const divLeft = document.createElement("div");
		div.appendChild(divLeft);

		const divMiddle = document.createElement("div");
		divMiddle.className = "middle";
		div.appendChild(divMiddle);

		const divRight = document.createElement("div");
		div.appendChild(divRight);

		const icon = document.createElement("img");
		icon.src = entity.iconURI;
		divLeft.appendChild(icon);

		const name = document.createElement("h2");
		name.textContent = entity.displayName;
		divMiddle.appendChild(name);

		const activeUser = this._userData.activeUser;
		if(activeUser != null) {
			const rightText = document.createElement("h2");
			rightText.className = "right";
			if(activeUser == entity) {
				rightText.textContent = "Active user";
			} else {
				rightText.innerHTML = activeUser.formattedDistanceTo(entity);
			}
			divRight.appendChild(rightText);
		}

		const favoriteImage = document.createElement("img");
		if(this._userData.isFavorite(entity)) {
			favoriteImage.src = "images/star_filled.png";
		} else {
			favoriteImage.src = "images/star_empty.png";
		}
		favoriteImage.addEventListener("click", function(event) {
			if(self._userData.isFavorite(entity)) {
				self._userData.removeFavorite(entity);
				favoriteImage.src = "images/star_empty.png";
			} else {
				self._userData.addFavorite(entity);
				favoriteImage.src = "images/star_filled.png";
			}
			event.stopPropagation();
		});
		divRight.appendChild(favoriteImage);

		this._search.appendChild(div);
	}

	show() {
		this.showCategory();

		this._div.style.display = "block";
		this._isOpen = true;
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

	showCategory() {
		this._currentType = null;
		this._hideBackButton();
		this._clearSearchBar();
		this._category.style.display = "block";
		this._search.style.display = "none";

		this._clearCategories();
		this._addCategory(null);

		const types = {};
		for(let i = 0; i < this._entityModel.entities.length; ++i) {
			const entity = this._entityModel.entities[i];
			types[entity.type] = true;
		}

		for(let type in types) {
			if(types.hasOwnProperty(type)) {
				this._addCategory(type);
			}
		}
	}
	showSearch(type, query = null) {
		this._currentType = type;
		this._category.style.display = "none";
		this._search.style.display = "block";

		this._showBackButton();
		this._clearSearch();
		this._createSearchTitle(type);

		const activeUser = this._userData.activeUser;

		const favoriteEntities = [];
		const entities = [];

		if(activeUser != null) {
			if(activeUser.type == type || type == null) {
				favoriteEntities.push(activeUser);
			}
		}
		for(let i = 0; i < this._entityModel.entities.length; ++i) {
			const entity = this._entityModel.entities[i];
			if(entity != activeUser) {
				if((entity.type == type || type == null) && this._searchMatch(entity, query)) {
					if(this._userData.isFavorite(entity)) {
						favoriteEntities.push(entity);
					} else {
						entities.push(entity);
					}
				}
			}
		}

		let sortingFunction;
		if(activeUser != null) {
			const self = this;
			sortingFunction = function(a, b) {
				const aDistance = a.distanceToSquared(activeUser);
				const bDistance = b.distanceToSquared(activeUser);
				return (aDistance - bDistance);
			};
		} else {
			const self = this;
			sortingFunction = function(a, b) {
				if(a.displayName.toString() > b.displayName.toString()) {
					return 1;
				} else {
					return -1;
				}
			};
		}

		favoriteEntities.sort(sortingFunction);
		entities.sort(sortingFunction);

		for(let i = 0; i < favoriteEntities.length; ++i) {
			const entity = favoriteEntities[i];
			this._addSearchElement(entity);
		}
		for(let i = 0; i < entities.length; ++i) {
			const entity = entities[i];
			this._addSearchElement(entity);
		}
	}
}


/*
	VarnandeLurar 2018-2019
	This project was developed at LTU during the course D0020E.
	Authors:
		Jonathan Bergstedt - ojaebe-6@student.ltu.se
		Markus Jonsson     - amuojo-6@student.ltu.se
		Oskar Sundin       - osksun-6@student.ltu.se
*/

(function() {
	//Initalize
	const worldModel = new WorldModel();
	const entityModel = new EntityModel();
	const userData = new UserData(entityModel);
	const alertModel = new AlertModel(userData);

	const background = document.getElementById("background");
	const view = document.getElementById("view");
	const overlay = document.getElementById("overlay");
	const camera2D = new Camera2D(overlay);
	const view2D = new View2D(background, view, overlay, camera2D, worldModel, entityModel, alertModel, userData);

	const network = new Network(entityModel, worldModel, alertModel, camera2D);

	//Testing
	//const fakeServer = new FakeServer(network);

	const uiDiv = document.getElementById("ui");
	const touchUI = new TouchUI(uiDiv, network, userData, alertModel, entityModel, worldModel, view2D, camera2D, overlay);

	//Time used for calculating delta.
	let time = new Date().getTime();

	function update() {
		//Calculate the delta since last frame.
		const newTime = new Date().getTime();
		const delta = Math.abs(newTime - time) / 1000;
		time = newTime;

		//Testing
		//fakeServer.update(delta);

		alertModel.update();
		view2D.update();
		touchUI.update();
		requestAnimationFrame(update);
	}
	update();
})();

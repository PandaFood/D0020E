
//A fake server used for testing
class FakeServer {
	constructor(network) {
		this._network = network;

		this._entities = [];

		const firstNames = ["Oskar", "Markus", "Jonathan", "Kai", "Mikael", "Rickard", "Oscar", "Viktor"];
		const lastNames = ["Sundin", "Jonsson", "Bergstedt", "Brorsson", "Hammar", "Alanko", "Holmberg", "Ferm", "From"];

		for(let i = 0; i < firstNames.length * lastNames.length; ++i) {
			this._entities.push({
				posX:Math.random() * 100 - 50,
				posY:Math.floor(Math.random() * 3) * 2 + 1,
				posZ:Math.random() * 100 - 50,
				velocity:Math.random(),
				direction:Math.random() * Math.PI * 2,
				name:firstNames[i % (firstNames.length)] + " " + lastNames[i % (lastNames.length)],
				type:"human"
			});
		}

		const toolProperties = ["150 mm", "200 mm", "250 mm", "300 mm", "350 mm", "400 mm", "450 mm", "500 mm", "550 mm", "600 mm"];

		for(let i = 0; i < 20; ++i) {
			this._entities.push({
				posX:Math.random() * 160 - 80,
				posY:Math.floor(Math.random() * 3) * 2 + 1,
				posZ:Math.random() * 160 - 80,
				velocity:0,
				direction:0,
				name:"Wrench " + toolProperties[Math.floor(Math.random() * toolProperties.length)],
				type:"wrench"
			});
		}

		network._handleMessage({
			"version":1,
			"action":3,
			"success":true
		});

		network._handleMessage({
			"version":1,
			"action":5,
			"images":[
				{
					"imageURI":"images/test/map_floor_1.png",
					"position":{"x":0,"y":0,"z":0},
					"rotation":0,
					"scale":180
				},
				{
					"imageURI":"images/test/map_floor_2.png",
					"position":{"x":0,"y":2,"z":0},
					"rotation":0,
					"scale":180
				},
				{
					"imageURI":"images/test/map_floor_3.png",
					"position":{"x":0,"y":4,"z":0},
					"rotation":0,
					"scale":180
				}
			]
		});

		network._handleMessage({
			"version":1,
			"action":4,
			"types":[
				{
					"type":"human",
					"displayName":"Human",
					"iconURI":"images/test/human.png"
				},
				{
					"type":"wrench",
					"displayName":"Wrench",
					"iconURI":"images/test/wrench.png"
				},
			]
		});

		network._handleMessage({
			version:1,
			action:6,
			alerts:[
				{
					message:"Safety helmet required.",
					severity:0,
					shapes:[
						{
							type:"cylinder",
							position:{x:-50, y:1, z:-40},
							radius:35,
							height:1.99
						}
					]
				},
				{
					message:"Caution, heavy machinery in use.",
					severity:1,
					shapes:[
						{
							type:"cylinder",
							entity:"0",
							position:{x:0, y:0, z:0},
							radius:15,
							height:12
						}
					]
				},
				{
					message:"Warning, highly flammable material in this area.",
					severity:2,
					shapes:[
						{
							type:"cylinder",
							position:{x:30, y:1, z:-30},
							radius:30,
							height:1.8
						}
					]
				}
			]
		});
	}

	update(delta) {
		const entities = [];

		for(let i = 0; i < this._entities.length; ++i) {
			const entity = this._entities[i];

			entity.direction += (Math.random() - 0.5) * 0.1;
			entity.posX += entity.velocity * Math.cos(entity.direction) * delta;
			entity.posZ += entity.velocity * Math.sin(entity.direction) * delta;

			entities.push({
				id:i.toString(),
				type:entity.type,
				name:entity.name,
				position:{x:entity.posX, y:entity.posY, z:entity.posZ},
				velocity:{x:entity.velocity * Math.cos(entity.direction), y:0, z:entity.velocity * Math.sin(entity.direction)}
			});
		}

		this._network._handleMessage({
			version:1,
			action:0,
			entities:entities
		});
	}
}

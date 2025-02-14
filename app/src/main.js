import { Resources, Utils, Console,  loop } from "./engine/engine.js";

async function loadGameModules() {
	Utils.dispatchCustomEvent("loading", { state: "LOADING_MODULES" });

	const modules = await Promise.all([
		import("./game/controls.js").catch(err => null),
		import("./game/arena.js").catch(err => null),
		import("./game/weapons.js").catch(err => null)
	]);

	const [controls, arena, weapons] = modules;

	if (!arena?.default || !weapons?.default) {
		Console.error("Failed to load required game modules");
	}

	return {
		Arena: arena.default,
		Weapons: weapons.default
	};
}

(async () => {
	await Resources.load(["resources.list"]);

	const { Arena, Weapons } = await loadGameModules();

	await Arena.load("demo");
	Weapons.load();

	// Add small delay to ensure first frame renders before showing menu
	setTimeout(() => {
		Utils.dispatchCustomEvent("changestate", {
			state: "MENU",
			menu: "MAIN_MENU",
		});
	}, 100);

	loop();
})();
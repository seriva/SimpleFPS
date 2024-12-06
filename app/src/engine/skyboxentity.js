import { mat4 } from "../dependencies/gl-matrix.js";
import Camera from "./camera.js";
import { gl } from "./context.js";
import { Entity, EntityTypes } from "./entity.js";
import Resources from "./resources.js";
import { Shaders } from "./shaders.js";
import { skybox } from "./shapes.js";

class SkyboxEntity extends Entity {
	static FACE_NAMES = ["front", "back", "top", "bottom", "right", "left"];
	static shape = skybox;

	constructor(id, updateCallback) {
		super([0, 0, 0], updateCallback);
		this.type = EntityTypes.SKYBOX;
		this.shader = Shaders.geometry;

		// Initialize shape resources once
		if (!SkyboxEntity.shape.resources) {
			SkyboxEntity.shape.resources = Resources;
		}

		// Set material names
		for (const [i, index] of SkyboxEntity.shape.indices.entries()) {
			index.material = `mat_skybox_${id}_${SkyboxEntity.FACE_NAMES[i]}`;
		}
	}

	render() {
		// Disable depth operations
		gl.disable(gl.DEPTH_TEST);
		gl.depthMask(false);

		// Optimize matrix operation by translating directly
		mat4.translate(this.base_matrix, this.ani_matrix, Camera.position);

		// Set shader uniforms
		this.shader.setMat4("matWorld", this.base_matrix);
		this.shader.setMat4("matViewProj", Camera.viewProjection);

		// Render
		SkyboxEntity.shape.renderSingle();

		// Restore gl state
		gl.enable(gl.DEPTH_TEST);
		gl.depthMask(true);
	}
}

export default SkyboxEntity;

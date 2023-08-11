import { Shaders, Shader } from './shaders.js';
import Resources from './resources.js';
import { Buffers, BlurSourceType } from './buffers.js';
import Settings from './settings.js';
import Scene from './scene.js';
import Texture from './texture.js';
import { gl, Context } from './context.js';
import Utils from './utils.js';

Utils.dispatchEvent('resize');

const blurImage = (source, iterations, radius) => {
    Shaders.gaussianBlur.bind();
    Buffers.startBlurPass(source);
    for (let i = 0; i < iterations; i++) {
        Buffers.swapBlur(i);

        Shaders.gaussianBlur.setInt('colorBuffer', 0);
        Shaders.gaussianBlur.setVec2('viewportSize', [Context.width(), Context.height()]);
        Shaders.gaussianBlur.setVec2('direction', i % 2 === 0 ? [radius, 0] : [0, radius]);

        const quad = Resources.get('system/quad.mesh');
        quad.renderSingle();
    }
    Buffers.endBlurPass();
    Shader.unBind();
};

const worldGeomPass = () => {
    Buffers.startGeomPass();

    Scene.renderWorldGeometry();

    Buffers.endLightingPass();
};

const shadowPass = () => {
    Buffers.startShadowPass();

    Scene.renderShadows();

    Buffers.endShadowPass();
};

const fpsGeomPass = () => {
    Buffers.startGeomPass(true);

    Scene.renderFPSGeometry();

    Buffers.endLightingPass();
};

const lightingPass = () => {
    Buffers.startLightingPass();

    gl.enable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    Scene.renderLighting();

    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    Buffers.endLightingPass();

    blurImage(BlurSourceType.LIGHTING, 3, 1.5);
};

const emissiveBlurPass = () => {
    blurImage(BlurSourceType.EMISSIVE, Settings.emissiveIteration, Settings.emissiveOffset);
};

const postProcessingPass = () => {
    Buffers.startPostProcessingPass();
    const dirt = Resources.get('system/dirt.webp');
    dirt.bind(gl.TEXTURE5);
    Shaders.postProcessing.bind();
    Shaders.postProcessing.setInt('doFXAA', Settings.doFXAA);
    Shaders.postProcessing.setInt('colorBuffer', 0);
    Shaders.postProcessing.setInt('lightBuffer', 1);
    Shaders.postProcessing.setInt('positionBuffer', 2);
    Shaders.postProcessing.setInt('normalBuffer', 3);
    Shaders.postProcessing.setInt('emissiveBuffer', 4);
    Shaders.postProcessing.setInt('dirtBuffer', 5);
    Shaders.postProcessing.setVec2('viewportSize', [Context.width(), Context.height()]);
    Shaders.postProcessing.setFloat('emissiveMult', Settings.emissiveMult);
    Shaders.postProcessing.setFloat('gamma', Settings.gamma);
    Shaders.postProcessing.setFloat('noiseAmmount', Settings.noiseAmmount);
    Shaders.postProcessing.setFloat('noiseSpeed', Settings.noiseSpeed);
    Shaders.postProcessing.setFloat('noiseTime', performance.now());

    const quad = Resources.get('system/quad.mesh');
    quad.renderSingle();

    Shader.unBind();
    Texture.unBind(gl.TEXTURE5);
    Buffers.endPostProcessingPass();
};

const Renderer = {
    render() {
        worldGeomPass();
        shadowPass();
        fpsGeomPass();
        lightingPass();
        emissiveBlurPass();
        postProcessingPass();
    }
};

export { Renderer as default };

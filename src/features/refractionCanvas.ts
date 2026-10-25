import {
  CanvasTexture,
  HalfFloatType,
  LinearFilter,
  LinearSRGBColorSpace,
  Mesh,
  NearestFilter,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
  type Texture,
  type WebGLRenderer,
} from 'three'

export interface RefractionCanvas {
  context: CanvasRenderingContext2D | null
  /** Linear copy of the canvas, for the glass to refract. */
  texture: Texture
  /** Uploads what was drawn on the canvas. */
  update: () => void
  dispose: () => void
}

/**
 * A 2D canvas the glass refracts. Uploading a canvas into an sRGB texture takes a slow
 * browser path (a 1024px canvas froze each frame it changed), so its bytes go up raw and
 * the GPU decodes them into a half-float buffer: the same values sRGB sampling would give.
 */
export function createRefractionCanvas(gl: WebGLRenderer, resolution: number): RefractionCanvas {
  // Sized once: resizing a canvas reallocates it, which scroll redraws can't afford.
  const canvas = document.createElement('canvas')
  canvas.width = resolution
  canvas.height = resolution
  const source = new CanvasTexture(canvas)
  source.colorSpace = NoColorSpace
  source.minFilter = NearestFilter
  source.magFilter = NearestFilter
  source.generateMipmaps = false

  const target = new WebGLRenderTarget(resolution, resolution, {
    type: HalfFloatType,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    generateMipmaps: false,
    depthBuffer: false,
  })
  target.texture.colorSpace = LinearSRGBColorSpace

  const geometry = new PlaneGeometry(2, 2)
  const material = new ShaderMaterial({
    uniforms: { map: { value: source } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(sRGBTransferEOTF(texture2D(map, vUv)).rgb, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  })
  const quad = new Mesh(geometry, material)
  quad.frustumCulled = false
  const scene = new Scene()
  scene.add(quad)
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

  return {
    context: canvas.getContext('2d'),
    texture: target.texture,
    update() {
      source.needsUpdate = true
      const previous = gl.getRenderTarget()
      gl.setRenderTarget(target)
      gl.render(scene, camera)
      gl.setRenderTarget(previous)
    },
    dispose() {
      target.dispose()
      source.dispose()
      material.dispose()
      geometry.dispose()
    },
  }
}

import { Color, MeshPhysicalMaterial, Vector3, Vector4, type Texture } from 'three'

export const MAX_GLASS_WORDS = 4
/** A word rect that no canvas coordinate falls in, for unused slots. */
export const EMPTY_WORD_RECT = new Vector4(2, 2, 2, 2)

// Reflections stay faint, so tilting the mark never washes its faces out in white.
const ENV_MAP_INTENSITY = 0.45
const CLEARCOAT = 0.35

export interface GlassUniforms {
  /** What lies behind the canvas, in its UV, when the glass refracts a backdrop. */
  uGlassBackdrop: { value: Texture | null }
  /** Alpha mask of the heading words, one cell per word. */
  uGlassWords: { value: Texture | null }
  /** Each word's box on the canvas, in UV (min x, min y, max x, max y; y up). */
  uGlassWordRect: { value: Vector4[] }
  /** Each word's cell in the atlas, in the same layout. */
  uGlassWordAtlas: { value: Vector4[] }
  uGlassBackground: { value: Color }
  uGlassText: { value: Color }
  /** Colour of the glass itself, mixed over what it refracts. */
  uGlassBody: { value: Color }
  /** How much of the body colour a face shows head-on; grazing faces show more. */
  uGlassBodyDensity: { value: number }
  /** Distance a refracted ray travels through the slab, in view units. */
  uGlassThickness: { value: number }
  /** Refractive index per channel, for the chromatic aberration. */
  uGlassIor: { value: Vector3 }
}

export interface GlassOptions {
  /** Multiplies the light through the glass; warm white keeps it neutral. */
  tint: Color
  /** Page colour behind the words; also the backdrop's colour until its texture arrives. */
  background: Color
  thickness: number
  ior: Vector3
  /** Refracts `uGlassBackdrop` instead of the words' atlas. */
  backdrop?: boolean
  body?: { color: Color; density: number }
}

const PARS = /* glsl */ `
uniform mat4 projectionMatrix;
uniform sampler2D uGlassBackdrop;
uniform sampler2D uGlassWords;
uniform vec4 uGlassWordRect[${MAX_GLASS_WORDS}];
uniform vec4 uGlassWordAtlas[${MAX_GLASS_WORDS}];
uniform vec3 uGlassBackground;
uniform vec3 uGlassText;
uniform vec3 uGlassBody;
uniform float uGlassBodyDensity;
uniform float uGlassThickness;
uniform vec3 uGlassIor;

#ifdef GLASS_BACKDROP

vec3 glassPage(vec2 uv) {
  return texture2D(uGlassBackdrop, uv).rgb;
}

#else

float glassWordMask(vec2 uv) {
  float mask = 0.0;
  for (int i = 0; i < ${MAX_GLASS_WORDS}; i++) {
    vec4 rect = uGlassWordRect[i];
    vec2 local = (uv - rect.xy) / max(rect.zw - rect.xy, vec2(1e-5));
    if (all(greaterThanEqual(local, vec2(0.0))) && all(lessThanEqual(local, vec2(1.0)))) {
      vec4 cell = uGlassWordAtlas[i];
      mask = max(mask, texture2D(uGlassWords, mix(cell.xy, cell.zw, local)).a);
    }
  }
  return mask;
}

vec3 glassPage(vec2 uv) {
  return mix(uGlassBackground, uGlassText, glassWordMask(uv));
}

#endif

// What a ray refracted here sees once it has crossed the slab: the page behind the canvas.
vec3 glassBehind(vec3 position, vec3 normal, float ior) {
  vec3 ray = refract(normalize(position), normal, 1.0 / ior);
  vec4 clip = projectionMatrix * vec4(position + ray * uGlassThickness, 1.0);
  return glassPage(clip.xy / clip.w * 0.5 + 0.5);
}
`

// Stands in for three's transmission, which renders the scene into a buffer every frame:
// the page behind the glass is known, so it is sampled directly, once per channel. A tinted
// body covers it more where rays cross the slab at a slant, as in thicker glass.
const TRANSMISSION = /* glsl */ `
vec3 glassFresnel = EnvironmentBRDF(normal, geometryViewDir, material.specularColorBlended,
  material.specularF90, material.roughness);
vec3 glassPosition = -vViewPosition;
vec3 glassLight = vec3(
  glassBehind(glassPosition, normal, uGlassIor.r).r,
  glassBehind(glassPosition, normal, uGlassIor.g).g,
  glassBehind(glassPosition, normal, uGlassIor.b).b
);
float glassSlant = 1.0 - saturate(dot(normal, geometryViewDir));
glassLight = mix(glassLight, uGlassBody, saturate(uGlassBodyDensity * (1.0 + glassSlant)));
totalDiffuse = (1.0 - glassFresnel) * glassLight * material.diffuseColor;
`

/**
 * Single-pass glass for a mark over a known page: soft physical reflections from three,
 * refraction read from the words' atlas or a backdrop texture instead of a transmission
 * render of the scene.
 */
export function createGlassMaterial({
  tint,
  background,
  thickness,
  ior,
  backdrop = false,
  body,
}: GlassOptions) {
  const uniforms: GlassUniforms = {
    uGlassBackdrop: { value: null },
    uGlassWords: { value: null },
    uGlassWordRect: {
      value: Array.from({ length: MAX_GLASS_WORDS }, () => EMPTY_WORD_RECT.clone()),
    },
    uGlassWordAtlas: {
      value: Array.from({ length: MAX_GLASS_WORDS }, () => new Vector4()),
    },
    uGlassBackground: { value: background },
    uGlassText: { value: background.clone() },
    uGlassBody: { value: body?.color ?? background.clone() },
    uGlassBodyDensity: { value: body?.density ?? 0 },
    uGlassThickness: { value: thickness },
    uGlassIor: { value: ior },
  }
  const material = new MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness: 0.02,
    ior: ior.x,
    clearcoat: CLEARCOAT,
    clearcoatRoughness: 0.06,
    envMapIntensity: ENV_MAP_INTENSITY,
  })
  if (backdrop) material.defines = { GLASS_BACKDROP: '' }
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `${PARS}\nvoid main() {`)
      .replace('#include <transmission_fragment>', TRANSMISSION)
  }
  material.customProgramCacheKey = () => `aetherys-glass-${backdrop ? 'backdrop' : 'words'}`
  return { material, uniforms }
}

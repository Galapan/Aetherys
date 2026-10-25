import type { Shape } from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { heroMark } from '@/content/hero'

let shapes: Shape[] | null = null

/** The traced logo path as three shapes, parsed once for every scene that extrudes it. */
export function getMarkShapes(): Shape[] {
  shapes ??= new SVGLoader()
    .parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${heroMark.path}" /></svg>`)
    .paths.flatMap((path) => path.toShapes())
  return shapes
}

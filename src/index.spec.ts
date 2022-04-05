import { describe, expect, test } from '@jest/globals'
import { Polygon, decomp, isSimple, quickDecomp, removeDuplicatePoints, makeCCW } from './index'

const concave: Polygon = [
  [-1, 1],
  [-1, 0],
  [1, 0],
  [1, 1],
  [0.5, 0.5],
]

const circle: Polygon = []
const N = 10
for (let i = 0; i < N; i++) {
  const angle = ((2 * Math.PI) / N) * i
  circle.push([Math.cos(angle), Math.sin(angle)])
}

describe('poly-decomp-es', () => {
  test('decomp', () => {
    const circleConvexes = decomp(circle)
    expect(circleConvexes).toHaveLength(1)

    const concaveConvexes = decomp(concave)
    expect(concaveConvexes).toHaveLength(2)
  })

  test('isSimple', () => {
    const notSimple: Polygon = [
      [-1, -1],
      [0, 0],
      [1, 1],
      [0, 2],
      [-1, 1],
      [0, 0],
      [1, -1],
    ]

    expect(isSimple(concave)).toBeTruthy()
    expect(isSimple(circle)).toBeTruthy()
    expect(isSimple(notSimple)).toBeFalsy()
  })

  test('quickDecomp', () => {
    const result = quickDecomp(circle)
    expect(result).toHaveLength(1)

    const convexResult = quickDecomp(concave)
    expect(convexResult).toHaveLength(2)
  })

  test('removeDuplicatePoints', () => {
    const data: Polygon = [
      [0, 0],
      [1, 1],
      [2, 2],
      [0, 0],
    ]
    removeDuplicatePoints(data)
    expect(data).toHaveLength(3)

    const data2: Polygon = [
      [0, 0],
      [1, 1],
      [2, 2],
      [1, 1],
      [0, 0],
      [2, 2],
    ]
    removeDuplicatePoints(data2)
    expect(data2).toHaveLength(3)
  })

  test('quickDecompExtraVisibilityTestFix', () => {
    // This test checks that this bug is fixed: https://github.com/schteppe/poly-decomp.js/issues/8
    let path: Polygon = [
      [0, -134],
      [50, -139],
      [60, -215],
      [70, -6],
      [80, -236],
      [110, -120],
      [110, 0],
      [0, 0],
    ].map((point) => [2 * point[0] + 100, 1 * point[1] + 500])

    makeCCW(path)
    let polys = quickDecomp(path)
    expect(polys).toHaveLength(3)

    path = [
      [0, -134],
      [50, -139],
      [60, -215],
      [70, -6],
      [80, -236],
      [110, -120],
      [110, 0],
      [0, 0],
    ].map((point) => [3 * point[0] + 100, 1 * point[1] + 500])

    makeCCW(path)
    polys = quickDecomp(path)
    expect(polys).toHaveLength(3)

    path = [
      [0, -134],
      [50, -139],
      [60, -215],
      [70, -6],
      [80, -236],
      [110, -120],
      [110, 0],
      [0, 0],
    ].map((point) => [-3 * point[0], -point[1]])
    makeCCW(path)
    polys = quickDecomp(path)
    expect(polys).toHaveLength(3)

    path = [
      [331, 384],
      [285, 361],
      [238, 386],
      [283, 408],
      [191, 469],
      [213, 372],
      [298, 314],
      [342, 340],
    ]
    makeCCW(path)
    polys = quickDecomp(path)
    expect(polys).toHaveLength(3)
  })
})

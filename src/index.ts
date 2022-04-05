export type Point = [number, number]
export type Polygon = Array<Point>

/**
 * Compute the intersection between two lines.
 * @param l1 Line vector 1
 * @param l2 Line vector 2
 * @param precision Precision to use when checking if the lines are parallel
 * @return The intersection point.
 */
function lineInt(l1: Polygon, l2: Polygon, precision = 0): Point {
  precision = precision || 0
  const i: Point = [0, 0] // point
  let a1, b1, c1, a2, b2, c2, det // scalars
  a1 = l1[1][1] - l1[0][1]
  b1 = l1[0][0] - l1[1][0]
  c1 = a1 * l1[0][0] + b1 * l1[0][1]
  a2 = l2[1][1] - l2[0][1]
  b2 = l2[0][0] - l2[1][0]
  c2 = a2 * l2[0][0] + b2 * l2[0][1]
  det = a1 * b2 - a2 * b1
  if (!scalarsEqual(det, 0, precision)) {
    // lines are not parallel
    i[0] = (b2 * c1 - b1 * c2) / det
    i[1] = (a1 * c2 - a2 * c1) / det
  }
  return i
}

/**
 * Checks if two line segments intersects.
 * @param p1 The start vertex of the first line segment.
 * @param p2 The end vertex of the first line segment.
 * @param q1 The start vertex of the second line segment.
 * @param q2 The end vertex of the second line segment.
 * @return True if the two line segments intersect
 */
function lineSegmentsIntersect(p1: number[], p2: number[], q1: number[], q2: number[]): boolean {
  const dx = p2[0] - p1[0]
  const dy = p2[1] - p1[1]
  const da = q2[0] - q1[0]
  const db = q2[1] - q1[1]

  // segments are parallel
  if (da * dy - db * dx === 0) {
    return false
  }

  const s = (dx * (q1[1] - p1[1]) + dy * (p1[0] - q1[0])) / (da * dy - db * dx)
  const t = (da * (p1[1] - q1[1]) + db * (q1[0] - p1[0])) / (db * dx - da * dy)

  return s >= 0 && s <= 1 && t >= 0 && t <= 1
}

/**
 * Get the area of a triangle spanned by the three given points. Note that the area will be negative if the points are not given in counter-clockwise order.
 * @param a point a
 * @param b point b
 * @param c point c
 * @return the area of a triangle spanned by the three given points
 */
function triangleArea(a: Point, b: Point, c: Point): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])
}

function isLeft(a: Point, b: Point, c: Point): boolean {
  return triangleArea(a, b, c) > 0
}

function isLeftOn(a: Point, b: Point, c: Point): boolean {
  return triangleArea(a, b, c) >= 0
}

function isRight(a: Point, b: Point, c: Point): boolean {
  return triangleArea(a, b, c) < 0
}

function isRightOn(a: Point, b: Point, c: Point): boolean {
  return triangleArea(a, b, c) <= 0
}

let tmpPoint1: Point = [0, 0]
let tmpPoint2: Point = [0, 0]

/**
 * Check if three points are collinear
 * @param a point a
 * @param b point b
 * @param c point c
 * @param thresholdAngle angle to use when comparing the vectors. The function will return true if the angle between the resulting vectors is less than this value. Use zero for max precision.
 * @return whether the points are collinear
 */
function collinear(a: Point, b: Point, c: Point, thresholdAngle = 0): boolean {
  if (!thresholdAngle) {
    return triangleArea(a, b, c) === 0
  } else {
    const ab = tmpPoint1
    const bc = tmpPoint2

    ab[0] = b[0] - a[0]
    ab[1] = b[1] - a[1]
    bc[0] = c[0] - b[0]
    bc[1] = c[1] - b[1]

    const dot = ab[0] * bc[0] + ab[1] * bc[1]
    const magA = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1])
    const magB = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1])
    const angle = Math.acos(dot / (magA * magB))
    return angle < thresholdAngle
  }
}

function sqdist(a: Point, b: Point): number {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  return dx * dx + dy * dy
}

/**
 * Get a vertex at position i. It does not matter if i is out of bounds, this function will just cycle.
 * @param i
 * @return vertex at position i
 */
function polygonAt(polygon: Polygon, i: number): Point {
  const s = polygon.length
  return polygon[i < 0 ? (i % s) + s : i % s]
}

/**
 * Clear the polygon data
 */
function polygonClear(polygon: Polygon): void {
  polygon.length = 0
}

/**
 * Append points "from" to "to"-1 from an other polygon "poly" onto this one.
 * @param polygon the polygon to append to
 * @param poly The polygon to get points from.
 * @param from The vertex index in "poly".
 * @param to The end vertex index in "poly". Note that this vertex is NOT included when appending.
 */
function polygonAppend(polygon: Polygon, poly: Polygon, from: number, to: number): void {
  for (let i = from; i < to; i++) {
    polygon.push(poly[i])
  }
}

/**
 * Make sure that the polygon vertices are ordered counter-clockwise.
 */
export function makeCCW(polygon: Polygon): boolean {
  let br = 0
  const v = polygon

  // find bottom right point
  for (let i = 1; i < polygon.length; ++i) {
    if (v[i][1] < v[br][1] || (v[i][1] === v[br][1] && v[i][0] > v[br][0])) {
      br = i
    }
  }

  // reverse poly if clockwise
  if (!isLeft(polygonAt(polygon, br - 1), polygonAt(polygon, br), polygonAt(polygon, br + 1))) {
    polygonReverse(polygon)
    return true
  } else {
    return false
  }
}

/**
 * Reverse the vertices in the polygon
 */
function polygonReverse(polygon: Polygon) {
  const tmp = []
  const N = polygon.length
  for (let i = 0; i !== N; i++) {
    tmp.push(polygon.pop())
  }
  for (let i = 0; i !== N; i++) {
    polygon[i] = tmp[i] as Point
  }
}

/**
 * Check if a point in the polygon is a reflex point
 * @param i the point in the polygon to check
 * @return whether the given point in the polygon is a reflex point
 */
function polygonIsReflex(polygon: Polygon, i: number): boolean {
  return isRight(polygonAt(polygon, i - 1), polygonAt(polygon, i), polygonAt(polygon, i + 1))
}

let tmpLine1: [Point, Point] = [[0, 0], [0, 0]]
let tmpLine2: [Point, Point] = [[0, 0], [0, 0]]

/**
 * Check if two vertices in the polygon can see each other
 * @param a Vertex index 1
 * @param b Vertex index 2
 * @return whether two vertices in the polygon can see each other
 */
function polygonCanSee(polygon: Polygon, a: number, b: number) {
  let p: Point
  let dist: number
  const l1 = tmpLine1
  const l2 = tmpLine2

  if (
    isLeftOn(polygonAt(polygon, a + 1), polygonAt(polygon, a), polygonAt(polygon, b)) &&
    isRightOn(polygonAt(polygon, a - 1), polygonAt(polygon, a), polygonAt(polygon, b))
  ) {
    return false
  }
  dist = sqdist(polygonAt(polygon, a), polygonAt(polygon, b))
  for (let i = 0; i !== polygon.length; ++i) {
    // for each edge
    if ((i + 1) % polygon.length === a || i === a) {
      // ignore incident edges
      continue
    }
    if (
      isLeftOn(polygonAt(polygon, a), polygonAt(polygon, b), polygonAt(polygon, i + 1)) &&
      isRightOn(polygonAt(polygon, a), polygonAt(polygon, b), polygonAt(polygon, i))
    ) {
      // if diag intersects an edge
      l1[0] = polygonAt(polygon, a)
      l1[1] = polygonAt(polygon, b)
      l2[0] = polygonAt(polygon, i)
      l2[1] = polygonAt(polygon, i + 1)
      p = lineInt(l1, l2)
      if (sqdist(polygonAt(polygon, a), p) < dist) {
        // if edge is blocking visibility to b
        return false
      }
    }
  }

  return true
}

/**
 * Check if two vertices in the polygon can see each other
 * @param a vertex index 1
 * @param b vertex index 2
 * @return if two vertices in the polygon can see each other
 */
function polygonCanSee2(polygon: Polygon, a: number, b: number): boolean {
  // for each edge
  for (let i = 0; i !== polygon.length; ++i) {
    // ignore incident edges
    if (i === a || i === b || (i + 1) % polygon.length === a || (i + 1) % polygon.length === b) {
      continue
    }
    if (
      lineSegmentsIntersect(
        polygonAt(polygon, a),
        polygonAt(polygon, b),
        polygonAt(polygon, i),
        polygonAt(polygon, i + 1)
      )
    ) {
      return false
    }
  }
  return true
}

/**
 * Copy the polygon from vertex i to vertex j.
 * @param i
 * @param j
 * @param targetPoly pptional target polygon to save in.
 * @return the resulting copy.
 */
function polygonCopy(polygon: Polygon, i: number, j: number, targetPoly: Polygon = []): Polygon {
  polygonClear(targetPoly)
  if (i < j) {
    // Insert all vertices from i to j
    for (let k = i; k <= j; k++) {
      targetPoly.push(polygon[k])
    }
  } else {
    // Insert vertices 0 to j
    for (let k = 0; k <= j; k++) {
      targetPoly.push(polygon[k])
    }

    // Insert vertices i to end
    for (let k = i; k < polygon.length; k++) {
      targetPoly.push(polygon[k])
    }
  }

  return targetPoly
}

/**
 * Decomposes the polygon into convex pieces. Returns a list of edges [[p1,p2],[p2,p3],...] that cuts the polygon.
 * Note that this algorithm has complexity O(N^4) and will be very slow for polygons with many vertices.
 * @return a list of edges that cuts the polygon
 */
function getCutEdges(polygon: Polygon): [Point, Point][] {
  let min: [Point, Point][] = []
  let tmp1: [Point, Point][]
  let tmp2: [Point, Point][]
  let tmpPoly: Polygon = []
  let nDiags = Number.MAX_VALUE

  for (let i = 0; i < polygon.length; ++i) {
    if (polygonIsReflex(polygon, i)) {
      for (let j = 0; j < polygon.length; ++j) {
        if (polygonCanSee(polygon, i, j)) {
          tmp1 = getCutEdges(polygonCopy(polygon, i, j, tmpPoly))
          tmp2 = getCutEdges(polygonCopy(polygon, j, i, tmpPoly))

          for (let k = 0; k < tmp2.length; k++) {
            tmp1.push(tmp2[k])
          }

          if (tmp1.length < nDiags) {
            min = tmp1
            nDiags = tmp1.length
            min.push([polygonAt(polygon, i), polygonAt(polygon, j)])
          }
        }
      }
    }
  }

  return min
}

/**
 * Decomposes the polygon into one or more convex sub-Polygons.
 * @return An array or Polygon objects.
 */
export function decomp(polygon: Polygon) {
  const edges = getCutEdges(polygon)
  if (edges.length > 0) {
    return slicePolygon(polygon, edges)
  } else {
    return [polygon]
  }
}

/**
 * Slices the polygon given one or more cut edges. If given one, this function will return two polygons (false on failure). If many, an array of polygons.
 * @param cutEdges A list of edges, as returned by .getCutEdges()
 * @return the sliced polygons, or false if the operation was unsuccessful
 */
function slicePolygon(polygon: Polygon, cutEdges: [Point, Point][] | [Point, Point]): Polygon[] | false {
  if (cutEdges.length === 0) {
    return [polygon]
  }

  // if given multiple edges
  if (
    cutEdges instanceof Array &&
    cutEdges.length &&
    cutEdges[0] instanceof Array &&
    cutEdges[0].length === 2 &&
    cutEdges[0][0] instanceof Array
  ) {
    const polys = [polygon]

    for (let i = 0; i < cutEdges.length; i++) {
      const cutEdge: [Point, Point] = cutEdges[i] as [Point, Point]
      // Cut all polys
      for (let j = 0; j < polys.length; j++) {
        const poly = polys[j]
        const result = slicePolygon(poly, cutEdge)
        if (result) {
          // Found poly! Cut and quit
          polys.splice(j, 1)
          polys.push(result[0], result[1])
          break
        }
      }
    }

    return polys
  } else {
    // Was given one edge
    const cutEdge = cutEdges as [Point, Point]
    const i = polygon.indexOf(cutEdge[0])
    const j = polygon.indexOf(cutEdge[1])

    if (i !== -1 && j !== -1) {
      return [polygonCopy(polygon, i, j), polygonCopy(polygon, j, i)]
    } else {
      return false
    }
  }
}

/**
 * Checks that the line segments of this polygon do not intersect each other.
 * @param polygon An array of vertices e.g. [[0,0],[0,1],...]
 * @return whether line segments of this polygon do not intersect each other.
 * @todo Should it check all segments with all others?
 */
export function isSimple(polygon: Polygon): boolean {
  const path = polygon
  let i: number

  // Check
  for (i = 0; i < path.length - 1; i++) {
    for (let j = 0; j < i - 1; j++) {
      if (lineSegmentsIntersect(path[i], path[i + 1], path[j], path[j + 1])) {
        return false
      }
    }
  }

  // Check the segment between the last and the first point to all others
  for (i = 1; i < path.length - 2; i++) {
    if (lineSegmentsIntersect(path[0], path[path.length - 1], path[i], path[i + 1])) {
      return false
    }
  }

  return true
}

function getIntersectionPoint(p1: Point, p2: Point, q1: Point, q2: Point, delta = 0): Point {
  const a1 = p2[1] - p1[1]
  const b1 = p1[0] - p2[0]
  const c1 = a1 * p1[0] + b1 * p1[1]
  const a2 = q2[1] - q1[1]
  const b2 = q1[0] - q2[0]
  const c2 = a2 * q1[0] + b2 * q1[1]
  const det = a1 * b2 - a2 * b1

  if (!scalarsEqual(det, 0, delta)) {
    return [(b2 * c1 - b1 * c2) / det, (a1 * c2 - a2 * c1) / det]
  } else {
    return [0, 0]
  }
}

/**
 * Quickly decompose the Polygon into convex sub-polygons.
 * @param polygon the polygon to decompose
 * @param result
 * @param reflexVertices
 * @param steinerPoints
 * @param delta
 * @param maxlevel
 * @param level
 * @return
 */
export function quickDecomp(
  polygon: Polygon,
  result: Polygon[] = [],
  reflexVertices: Point[] = [],
  steinerPoints: Point[] = [],
  delta: number = 25,
  maxlevel: number = 100,
  level: number = 0
): Polygon[] {
  // Points
  let upperInt: Point = [0, 0]
  let lowerInt: Point = [0, 0]
  let p: Point = [0, 0]

  // scalars
  let upperDist = 0
  let lowerDist = 0
  let d = 0
  let closestDist = 0

  // Integers
  let upperIndex = 0
  let lowerIndex = 0
  let closestIndex = 0

  // polygons
  let lowerPoly: Polygon = []
  let upperPoly: Polygon = []

  let poly = polygon
  let v = polygon

  if (v.length < 3) {
    return result
  }

  level++
  if (level > maxlevel) {
    console.warn('quickDecomp: max level (' + maxlevel + ') reached.')
    return result
  }

  for (let i = 0; i < polygon.length; ++i) {
    if (polygonIsReflex(poly, i)) {
      reflexVertices.push(poly[i])
      upperDist = lowerDist = Number.MAX_VALUE

      for (let j = 0; j < polygon.length; ++j) {
        if (
          isLeft(polygonAt(poly, i - 1), polygonAt(poly, i), polygonAt(poly, j)) &&
          isRightOn(polygonAt(poly, i - 1), polygonAt(poly, i), polygonAt(poly, j - 1))
        ) {
          // if line intersects with an edge
          p = getIntersectionPoint(
            polygonAt(poly, i - 1),
            polygonAt(poly, i),
            polygonAt(poly, j),
            polygonAt(poly, j - 1)
          ) // find the point of intersection
          if (isRight(polygonAt(poly, i + 1), polygonAt(poly, i), p)) {
            // make sure it's inside the poly
            d = sqdist(poly[i], p)
            if (d < lowerDist) {
              // keep only the closest intersection
              lowerDist = d
              lowerInt = p
              lowerIndex = j
            }
          }
        }
        if (
          isLeft(polygonAt(poly, i + 1), polygonAt(poly, i), polygonAt(poly, j + 1)) &&
          isRightOn(polygonAt(poly, i + 1), polygonAt(poly, i), polygonAt(poly, j))
        ) {
          p = getIntersectionPoint(
            polygonAt(poly, i + 1),
            polygonAt(poly, i),
            polygonAt(poly, j),
            polygonAt(poly, j + 1)
          )
          if (isLeft(polygonAt(poly, i - 1), polygonAt(poly, i), p)) {
            d = sqdist(poly[i], p)
            if (d < upperDist) {
              upperDist = d
              upperInt = p
              upperIndex = j
            }
          }
        }
      }

      // if there are no vertices to connect to, choose a point in the middle
      if (lowerIndex === (upperIndex + 1) % polygon.length) {
        p[0] = (lowerInt[0] + upperInt[0]) / 2
        p[1] = (lowerInt[1] + upperInt[1]) / 2
        steinerPoints.push(p)

        if (i < upperIndex) {
          polygonAppend(lowerPoly, poly, i, upperIndex + 1)
          lowerPoly.push(p)
          upperPoly.push(p)
          if (lowerIndex !== 0) {
            polygonAppend(upperPoly, poly, lowerIndex, poly.length)
          }
          polygonAppend(upperPoly, poly, 0, i + 1)
        } else {
          if (i !== 0) {
            polygonAppend(lowerPoly, poly, i, poly.length)
          }
          polygonAppend(lowerPoly, poly, 0, upperIndex + 1)
          lowerPoly.push(p)
          upperPoly.push(p)
          polygonAppend(upperPoly, poly, lowerIndex, i + 1)
        }
      } else {
        // connect to the closest point within the triangle
        if (lowerIndex > upperIndex) {
          upperIndex += polygon.length
        }
        closestDist = Number.MAX_VALUE

        if (upperIndex < lowerIndex) {
          return result
        }

        for (let j = lowerIndex; j <= upperIndex; ++j) {
          if (
            isLeftOn(polygonAt(poly, i - 1), polygonAt(poly, i), polygonAt(poly, j)) &&
            isRightOn(polygonAt(poly, i + 1), polygonAt(poly, i), polygonAt(poly, j))
          ) {
            d = sqdist(polygonAt(poly, i), polygonAt(poly, j))
            if (d < closestDist && polygonCanSee2(poly, i, j)) {
              closestDist = d
              closestIndex = j % polygon.length
            }
          }
        }

        if (i < closestIndex) {
          polygonAppend(lowerPoly, poly, i, closestIndex + 1)
          if (closestIndex !== 0) {
            polygonAppend(upperPoly, poly, closestIndex, v.length)
          }
          polygonAppend(upperPoly, poly, 0, i + 1)
        } else {
          if (i !== 0) {
            polygonAppend(lowerPoly, poly, i, v.length)
          }
          polygonAppend(lowerPoly, poly, 0, closestIndex + 1)
          polygonAppend(upperPoly, poly, closestIndex, i + 1)
        }
      }

      // solve smallest poly first
      if (lowerPoly.length < upperPoly.length) {
        quickDecomp(lowerPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level)
        quickDecomp(upperPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level)
      } else {
        quickDecomp(upperPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level)
        quickDecomp(lowerPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level)
      }

      return result
    }
  }
  result.push(polygon)

  return result
}

/**
 * Remove collinear points in the polygon.
 * @param precision The threshold angle to use when determining whether two edges are collinear. Use zero for finest precision.
 * @return The number of points removed
 */
export function removeCollinearPoints(polygon: Polygon, precision: number): number {
  let num = 0
  for (let i = polygon.length - 1; polygon.length > 3 && i >= 0; --i) {
    if (collinear(polygonAt(polygon, i - 1), polygonAt(polygon, i), polygonAt(polygon, i + 1), precision)) {
      // Remove the middle point
      polygon.splice(i % polygon.length, 1)
      num++
    }
  }
  return num
}

/**
 * Remove duplicate points in the polygon.
 * @param precision The threshold to use when determining whether two points are the same. Use zero for best precision.
 */
export function removeDuplicatePoints(polygon: Polygon, precision: number = 0): void {
  for (let i = polygon.length - 1; i >= 1; --i) {
    const pi = polygon[i]
    for (let j = i - 1; j >= 0; --j) {
      if (pointsEqual(pi, polygon[j], precision)) {
        polygon.splice(i, 1)
        continue
      }
    }
  }
}

/**
 * Check if two scalars are equal
 * @param a scalar a
 * @param b scalar b
 * @param [precision] the precision for the equality check
 * @return whether the two scalars are equal with the given precision
 */
function scalarsEqual(a: number, b: number, precision: number = 0): boolean {
  precision = precision || 0
  return Math.abs(a - b) <= precision
}

/**
 * Check if two points are equal
 * @param a point a
 * @param b point b
 * @param precision the precision for the equality check
 * @return if the two points are equal
 */
function pointsEqual(a: Point, b: Point, precision: number = 0): boolean {
  return scalarsEqual(a[0], b[0], precision) && scalarsEqual(a[1], b[1], precision)
}

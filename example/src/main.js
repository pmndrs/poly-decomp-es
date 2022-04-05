import * as decomp from 'poly-decomp-es'
import dat from 'dat.gui'

import './style.css'

const demoPolygons = [
  {
    name: 'BayazitCase1',
    data: [
      [192, 40],
      [32, 48],
      [78, 154],
      [118, 108],
      [160, 150],
    ],
  },
  {
    name: 'BayazitCase2',
    data: [
      [125, 52],
      [161, 104],
      [202, 52],
      [268, 90],
      [260, 188],
      [202, 228],
      [165, 188],
      [122, 231],
      [64, 192],
      [52, 102],
    ],
  },
  {
    name: 'BayazitCase3',
    data: [
      [160, 56],
      [177, 84],
      [196, 61],
      [214, 105],
      [316, 56],
      [318, 257],
      [219, 255],
      [202, 231],
      [184, 253],
      [166, 200],
      [53, 252],
      [56, 78],
    ],
  },
  {
    name: 'BayazitCase4',
    data: [
      [186, 56],
      [211, 110],
      [230, 55],
      [263, 53],
      [275, 84],
      [323, 98],
      [319, 246],
      [275, 245],
      [240, 213],
      [202, 243],
      [169, 218],
      [119, 248],
      [54, 246],
      [53, 81],
    ],
  },
  {
    name: 'BayazitCase5',
    data: [
      [174, 160],
      [131, 112],
      [201, 270],
      [128, 240],
      [52, 270],
      [100, 52],
    ],
  },
  {
    name: 'Simple',
    data: [
      [100, 180],
      [100, 80],
      [300, 80],
      [300, 180],
      [250, 130],
    ],
  },
  {
    name: 'Peaks',
    data: [
      [50, 220.55491449129886],
      [60, 200.9165010426762],
      [70, 171.70035249020682],
      [80, 114.90970199382247],
      [90, 165.9804978067106],
      [100, 160.4772842673997],
      [110, 84.41974678190957],
      [120, 293.8773909405506],
      [130, 63.92280957183573],
      [140, 73.75740089300058],
      [150, 61.19584194167069],
      [160, 159.87092544067778],
      [170, 247.10194630714335],
      [180, 183.8388841500984],
      [190, 117.18720369155437],
      [200, 242.94006022134025],
      [210, 206.9854959619504],
      [220, 65.33570549558465],
      [230, 263.57031109249294],
      [240, 136.10471065015298],
      [250, 300],
      [50, 300],
    ],
  },
  {
    name: 'Bayazit1',
    data: [
      [154, 124],
      [201, 475],
      [351, 359],
      [274, 505],
      [568, 485],
      [481, 342],
      [611, 453],
      [571, 130],
      [463, 240],
      [557, 86],
      [227, 98],
      [321, 265],
    ],
  },
  {
    name: 'Bayazit3',
    data: [
      [339, 279],
      [344, 142],
      [419, 316],
      [599, 112],
      [532, 351],
      [778, 290],
      [564, 422],
      [728, 615],
      [449, 513],
      [519, 720],
      [404, 594],
      [327, 717],
      [350, 495],
      [76, 580],
      [305, 436],
      [98, 338],
      [320, 370],
      [212, 217],
    ],
  },
  {
    name: 'Bayazit4',
    data: [
      [201, 291],
      [304, 477],
      [420, 274],
      [494, 464],
      [617, 259],
      [758, 458],
      [635, 66],
      [513, 324],
      [410, 97],
      [320, 327],
      [180, 119],
      [83, 369],
    ],
  },
]

let path = []
let polys = []
let reflexVertices = []
let steinerPoints = []
let mousedown = false
let colors = ['#f99', '#9f9', '#99f', '#ff9']

const canvas = document.createElement('canvas')
const pixelRatio = window.devicePixelRatio || 1
canvas.width = window.innerWidth * pixelRatio
canvas.height = window.innerHeight * pixelRatio
document.body.append(canvas)

function render() {
  const c = canvas.getContext('2d')

  // clear
  c.clearRect(0, 0, canvas.width, canvas.height)

  c.fillStyle = 'red'
  c.strokeStyle = 'black'

  if (mousedown) {
    c.beginPath()
    for (let i = 0; i < path.length - 1; i++) {
      const p = path[i]
      c.moveTo(p[0], p[1])
      c.arc(p[0], p[1], 3 * pixelRatio, 0, 2 * Math.PI)
    }
    c.fill()
  }

  // Draw convex polygons
  for (let i = 0; i < polys.length; i++) {
    c.fillStyle = colors[i % colors.length]
    const poly = polys[i]
    c.beginPath()
    let p = poly[0]
    c.moveTo(p[0], p[1])
    for (let j = 0; j < poly.length; j++) {
      p = poly[j]
      c.lineTo(p[0], p[1])
    }
    c.closePath()
    c.fill()
    c.stroke()
  }

  // Draw points
  c.fillStyle = 'black'
  for (let i = 0; i < polys.length; i++) {
    const poly = polys[i]
    c.beginPath()
    for (let j = 0; j < poly.length; j++) {
      const p = poly[j]
      c.moveTo(p[0], p[1])
      c.arc(p[0], p[1], 2 * pixelRatio, 0, 2 * Math.PI)
    }
    c.fill()
  }

  // draw the current path
  c.strokeStyle = decomp.isSimple(path) ? 'black' : 'red'
  c.lineWidth = 2 * pixelRatio
  c.beginPath()
  for (let i = 0; i < path.length; i++) {
    c.moveTo(path[i][0], path[i][1])
    c.lineTo(path[(i + 1) % path.length][0], path[(i + 1) % path.length][1])
  }
  c.fill()
  c.stroke()
  c.lineWidth = 0.5 * pixelRatio

  if (!mousedown) {
    // Draw reflex vertices
    c.fillStyle = 'blue'
    c.beginPath()
    for (let j = 0; j < reflexVertices.length; j++) {
      const p = reflexVertices[j]
      c.moveTo(p[0], p[1])
      c.arc(p[0], p[1], 4 * pixelRatio, 0, 2 * Math.PI)
    }
    c.fill()

    // Draw steiner points
    c.fillStyle = 'red'
    c.beginPath()
    for (let j = 0; j < steinerPoints.length; j++) {
      const p = steinerPoints[j]
      c.moveTo(p[0], p[1])
      c.arc(p[0], p[1], 4 * pixelRatio, 0, 2 * Math.PI)
    }
    c.fill()

    // draw point indices
    c.font = Math.floor(10 * pixelRatio) + 'px Arial'
    c.fillStyle = 'black'
    for (let i = 0; i < path.length; i++) {
      const p = path[i]
      c.fillText(i, p[0] + 3 * pixelRatio, p[1] + 3 * pixelRatio)
    }
  }
}
render()

// Setup GUI
const settings = {
  minEdgeLength: 50,
  quickDecomp: true,
  removeCollinear: true,
  collinearThreshold: 0.001,
}
const gui = new dat.GUI()

const settingsFolder = gui.addFolder('Settings')
settingsFolder.open()
settingsFolder.add(settings, 'minEdgeLength', 1, 100)
settingsFolder.add(settings, 'quickDecomp')
settingsFolder.add(settings, 'removeCollinear')
settingsFolder.add(settings, 'collinearThreshold', 0, Math.PI / 4)

const pixelRatioScale = function (p) {
  return [p[0] * pixelRatio, p[1] * pixelRatio]
}
let currentDemoPolygon = 0
const polygonsFolder = gui.addFolder('Polygons')
polygonsFolder.open()
for (let i = 0; i < demoPolygons.length; i++) {
  const demoPoly = demoPolygons[i]
  settings[demoPoly.name] = (function (p) {
    return function () {
      setPath(p.data.map(pixelRatioScale))
    }
  })(demoPoly)
  polygonsFolder.add(settings, demoPoly.name)
}
let fallback = true
const prefix = '#path='
if (window.location.hash.indexOf(prefix) === 0) {
  try {
    setPath(
      window.location.hash
        .substr(prefix.length)
        .split('/')
        .map(function (p) {
          return p.split(',').map(function (strNum) {
            return parseFloat(strNum)
          })
        })
    )
    fallback = false
  } catch (err) {}
}
if (fallback) {
  setPath(demoPolygons[0].data.map(pixelRatioScale))
}
settings.next = function () {
  currentDemoPolygon = (currentDemoPolygon + 1) % demoPolygons.length
  setPath(demoPolygons[currentDemoPolygon].data.map(pixelRatioScale))
}
polygonsFolder.add(settings, 'next')
function getMousePos(e) {
  const offset = e.target.getBoundingClientRect()
  return [e.clientX * pixelRatio - offset.left * pixelRatio, e.clientY * pixelRatio - offset.top * pixelRatio]
}

function sqdist(a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  return dx * dx + dy * dy
}

canvas.addEventListener('mousedown', function (e) {
  path.length = 0
  polys.length = 0
  reflexVertices.length = steinerPoints.length = 0
  path.push(getMousePos(e))
  mousedown = true
  render()
})
canvas.addEventListener('mousemove', function (e) {
  if (mousedown) {
    const point = getMousePos(e)
    const lengthSquared = sqdist(point, path[path.length - 1])
    const minLengthSquared = settings.minEdgeLength * settings.minEdgeLength
    if (lengthSquared > minLengthSquared) {
      path.push(point)
      render()
    }
  }
})

function copyPath(p) {
  return JSON.parse(JSON.stringify(p))
}

function setPath(p) {
  mousedown = false
  polys.length = reflexVertices.length = steinerPoints.length = 0
  path = copyPath(p)
  if (p.length > 3) {
    if (decomp.isSimple(path)) {
      if (decomp.makeCCW(path)) {
        console.log('The polygon is not counter-clockwise. Reversing it...')
      }

      if (settings.removeCollinear) {
        console.log(
          'Removing collinear points... ' +
            decomp.removeCollinearPoints(path, settings.collinearThreshold) +
            ' points removed.'
        )
      }
      console.log(
        'setPath([' +
          path
            .map(function (point, i) {
              return '[' + point.toString() + '/*' + i + '*/]'
            })
            .join(',') +
          '])'
      )

      console.log('Decomposing polygon of size ' + path.length + '...')
      if (settings.quickDecomp) {
        decomp.quickDecomp(path, polys, reflexVertices, steinerPoints, 25, 100, 0, path)
      } else polys = decomp.decomp(path)
      console.log('Got ' + polys.length + ' convex polygons. Done.')
    } else {
      console.log('The polygon was not simple. Aborting...')
    }
  }
  render()

  if (history.pushState) {
    const pathString = path
      .map(function (p) {
        return p[0] + ',' + p[1]
      })
      .join('/')
    history.pushState(null, null, '#path=' + pathString)
  }
}

canvas.addEventListener('mouseup', function (e) {
  setPath(path)
})

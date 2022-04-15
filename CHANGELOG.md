### Changelog

##### 0.4.1

- Fix typescript declaration output

##### 0.4.0

- Use rollup to output cjs and esm bundles
- Convert to typescript

##### 0.3.0

- Added `removeDuplicatePoints`.
- `makeCCW` now returns true if the polygon was changed.
- Fixed case 5 mentioned [here](https://mpen.ca/406/bayazit) and discussed [here](https://github.com/schteppe/poly-decomp.js/issues/8).

##### 0.2.1

- Fixed bug in the collinear point removal, after this fix the algorithm is more agressive and more correct.

##### 0.2.0

- Rewrote the class based API to a minimal array-based one. See docs.

##### 0.1

- Added method `Polygon.prototype.removeCollinearPoints`.
- Added optional parameter `thresholdAngle` to `Point.collinear(a,b,c,thresholdAngle)`.

export type Vector3D = { x: number; y: number; z: number };
export type MotionVector = { pos: Vector3D; vel: Vector3D };
export interface PlanetaryCalculationResult { longitude: number; speed: number }

/** Fixed-axis projection. Inputs must use the same Cartesian reference frame.
 * Velocity units must be distance/day for output speed in degrees/day.
 * Calibration vectors below are supplied by the caller, not historically validated here.
 */
export class InvariantVectorEngine {
  private readonly xAxis: Vector3D;
  private readonly yAxis: Vector3D;
  public readonly offsetDegrees: number;
  constructor(planeNormal: Vector3D, referenceDirection: Vector3D, aldebaranAtCalibration: Vector3D) {
    const normal = this.unit(planeNormal);
    const project = (v: Vector3D) => this.subtract(v, this.scale(normal, this.dot(v, normal)));
    this.xAxis = this.unit(project(referenceDirection));
    this.yAxis = this.unit(this.cross(normal, this.xAxis));
    const star = this.unit(project(aldebaranAtCalibration));
    const starLongitude = Math.atan2(this.dot(star, this.yAxis), this.dot(star, this.xAxis)) * 180 / Math.PI;
    this.offsetDegrees = this.normalize360(45 - starLongitude);
  }
  computeLongitude(pos: Vector3D): number {
    const p = this.unit(pos);
    const x = this.dot(p, this.xAxis), y = this.dot(p, this.yAxis);
    if (Math.hypot(x, y) < 1e-12) throw new Error("Position projects to zero in reference plane");
    return this.normalize360(Math.atan2(y, x) * 180 / Math.PI + this.offsetDegrees);
  }
  computePlanetaryState(motion: MotionVector): PlanetaryCalculationResult {
    const longitude = this.computeLongitude(motion.pos);
    const x = this.dot(motion.pos, this.xAxis), y = this.dot(motion.pos, this.yAxis);
    const vx = this.dot(motion.vel, this.xAxis), vy = this.dot(motion.vel, this.yAxis);
    const r2 = x * x + y * y;
    if (!Number.isFinite(r2) || r2 < 1e-24) throw new Error("Degenerate projected position");
    if (![vx, vy].every(Number.isFinite)) throw new Error("Non-finite velocity");
    return { longitude, speed: ((x * vy - y * vx) / r2) * 180 / Math.PI };
  }
  equalHouses(ascendant: number): number[] {
    if (!Number.isFinite(ascendant)) throw new Error("Invalid ascendant");
    return Array.from({ length: 12 }, (_, i) => this.normalize360(ascendant + i * 30));
  }
  private dot(a: Vector3D, b: Vector3D) { return a.x*b.x+a.y*b.y+a.z*b.z; }
  private scale(v: Vector3D, s: number): Vector3D { return {x:v.x*s,y:v.y*s,z:v.z*s}; }
  private subtract(a: Vector3D,b: Vector3D): Vector3D { return {x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}; }
  private cross(a: Vector3D,b: Vector3D): Vector3D { return {x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}; }
  private unit(v: Vector3D): Vector3D {
    const n=Math.hypot(v.x,v.y,v.z);
    if (!Number.isFinite(n)||n<1e-12) throw new Error("Degenerate spatial vector");
    return this.scale(v,1/n);
  }
  private normalize360(d: number) { return ((d%360)+360)%360; }
}

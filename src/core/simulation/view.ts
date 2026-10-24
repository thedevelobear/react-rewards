import type { Particle } from '@/core/define-effect';
import type { Pool } from '@/core/pool';

/**
 * A `Particle` backed by the pool's arrays at `index`. One view is reused for
 * every particle, so stepping allocates nothing per particle or per frame.
 */
export class ParticleView implements Particle {
  index = 0;
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  get x(): number {
    return this.pool.fields.x[this.index] ?? 0;
  }

  set x(value: number) {
    this.pool.fields.x[this.index] = value;
  }

  get y(): number {
    return this.pool.fields.y[this.index] ?? 0;
  }

  set y(value: number) {
    this.pool.fields.y[this.index] = value;
  }

  get vx(): number {
    return this.pool.fields.vx[this.index] ?? 0;
  }

  set vx(value: number) {
    this.pool.fields.vx[this.index] = value;
  }

  get vy(): number {
    return this.pool.fields.vy[this.index] ?? 0;
  }

  set vy(value: number) {
    this.pool.fields.vy[this.index] = value;
  }

  get rotation(): number {
    return this.pool.fields.rotation[this.index] ?? 0;
  }

  set rotation(value: number) {
    this.pool.fields.rotation[this.index] = value;
  }

  get scale(): number {
    return this.pool.fields.scale[this.index] ?? 0;
  }

  set scale(value: number) {
    this.pool.fields.scale[this.index] = value;
  }

  get scaleX(): number {
    return this.pool.fields.scaleX[this.index] ?? 0;
  }

  set scaleX(value: number) {
    this.pool.fields.scaleX[this.index] = value;
  }

  get scaleY(): number {
    return this.pool.fields.scaleY[this.index] ?? 0;
  }

  set scaleY(value: number) {
    this.pool.fields.scaleY[this.index] = value;
  }

  get alpha(): number {
    return this.pool.fields.alpha[this.index] ?? 0;
  }

  set alpha(value: number) {
    this.pool.fields.alpha[this.index] = value;
  }

  get sprite(): number {
    return this.pool.fields.sprite[this.index] ?? 0;
  }

  set sprite(value: number) {
    this.pool.fields.sprite[this.index] = value;
  }

  get age(): number {
    return this.pool.fields.age[this.index] ?? 0;
  }

  get life(): number {
    return this.pool.fields.life[this.index] ?? 0;
  }

  set life(value: number) {
    this.pool.fields.life[this.index] = value;
  }

  get s0(): number {
    return this.pool.fields.s0[this.index] ?? 0;
  }

  set s0(value: number) {
    this.pool.fields.s0[this.index] = value;
  }

  get s1(): number {
    return this.pool.fields.s1[this.index] ?? 0;
  }

  set s1(value: number) {
    this.pool.fields.s1[this.index] = value;
  }

  get s2(): number {
    return this.pool.fields.s2[this.index] ?? 0;
  }

  set s2(value: number) {
    this.pool.fields.s2[this.index] = value;
  }

  get s3(): number {
    return this.pool.fields.s3[this.index] ?? 0;
  }

  set s3(value: number) {
    this.pool.fields.s3[this.index] = value;
  }
}

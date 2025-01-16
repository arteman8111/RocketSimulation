import { rad2deg } from "../utils/helper.js";
import * as math from 'mathjs'

export class Aerodynamics {

  constructor(M, V, q, wx, wy, wz, alpha, beta, deltav, deltan, deltae, Ix, Iy, Iz, m, d, length) {
    this.M = M;
    this.V = V;
    this.q = q;
    this.wx = wx;
    this.wy = wy;
    this.wz = wz;
    this.alpha = alpha;
    this.beta = beta;
    this.deltav = deltav;
    this.deltan = deltan;
    this.deltae = deltae;
    this.Ix = Ix;
    this.Iy = Iy;
    this.Iz = Iz;
    this.m = m;
    this.dm = d;
    this.l = length;
    this.s = math.pi * this.dm ** 2 / 4;
  }

  Cx(M) {
    return 1 / (73.211 / math.exp(M) - 47.483 / M + 16.878);
  }

  Cy_alfa(M) {
    const Ds = 11.554 / math.exp(M) - 2.5191e-3 * M * M - 5.024 / M + 52.836e-3 * M + 4.112;
    return Ds >= 0 ? math.sqrt(Ds) : 1.039;
  }

  Cy_deltav(M, alfa_) {
    alfa_ = math.abs(rad2deg(this.alpha));
    const p1 = 1 / (243.84e-3 / math.exp(alfa_) + 74.309e-3);
    const p2 = math.log(1.9773 * alfa_ * alfa_ - 25.587 * alfa_ + 83.354);
    const p3 = 18.985 * alfa_ * alfa_ - 375.76 * alfa_ + 1471;
    const p4 = -51.164e-3 * alfa_ * alfa_ + 805.52e-3 * alfa_ + 1.8929;
    return (-p1 * 1e-6 * M * M + p2 * 1e-12 * math.exp(M) - p3 * 1e-6 * M - p4 * 1e-3) * 2;
  }

  Cz_beta(M, beta_) {
    return -this.Cy_alfa(M, beta_);
  }

  Cz_deltan(M, beta_) {
    return -this.Cy_deltav(M, beta_);
  }

  mx_wx() {
    return -0.005;
  }

  mz_wz(M) {
    return (146.79e-6 * M * M - 158.98e-3 / M - 7.6396e-3 * M - 68.195e-3);
  }

  mz_alfa(M) {
    return (-766.79e-3 / math.exp(M) + 438.74e-3 / M + 5.8822e-3 * M - 158.34e-3);
  }

  mz_deltav(M, alfa_) {
    alfa_ = math.abs(rad2deg(this.alpha));
    const k1 = math.exp(-19.488e-3 * alfa_ * alfa_ - 378.62e-3 * alfa_ + 6.7518);
    const k2 = math.exp(-21.234e-3 * alfa_ * alfa_ - 635.84e-6 * math.exp(alfa_) - 98.296e-3 * alfa_ + 2.5938);
    return math.sqrt(k1 * 1e-9 * M * M + k2 * 1e-6);
  }

  my_wy(M, alfa_) {
    return this.mz_wz(M, alfa_);
  }

  my_beta(M, beta_) {
    return this.mz_alfa(M, beta_);
  }

  my_deltan(M, beta_) {
    return this.mz_deltav(M, beta_);
  }

  m_stab() {
    if (math.abs(this.wx) >= 1e-3){
      return 1e4
    }
    return 0
  }

  calculateForcesAndMoments() {
    // Aerodynamic coefficients
    const cx = this.Cx(this.M, this.alpha);
    const cy = this.Cy_alfa(this.M, this.alpha) * this.alpha + this.Cy_deltav(this.M, this.alpha) * this.deltav;
    const cz = this.Cz_beta(this.M, this.beta) * this.beta + this.Cz_deltan(this.M, this.beta) * this.deltan;
    // Forces
    const X = cx * this.q * this.s;
    const Y = cy * this.q * this.s;
    const Z = cz * this.q * this.s;

    // Aerodynamic moment coefficients
    const mx = this.mx_wx(this.M, this.alpha) * this.wx * this.l / this.V;
    const my = this.my_wy(this.M, this.alpha) * this.wy * this.l / this.V + this.my_beta(this.M, this.beta) * this.beta + this.my_deltan(this.M, this.beta) * this.deltan;
    const mz = this.mz_wz(this.M, this.alpha) * this.wz * this.l / this.V + this.mz_alfa(this.M, this.alpha) * this.alpha + this.mz_deltav(this.M, this.alpha) * this.deltav;

    // Moments
    const Mx = mx * this.q * this.s * this.l + this.m_stab() * this.deltae;
    const My = my * this.q * this.s * this.l
    const Mz = mz * this.q * this.s * this.l

    return { X, Y, Z, Mx, My, Mz };
  }

}
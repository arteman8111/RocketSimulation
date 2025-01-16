import { Atmosphere4401 } from "../model/atmosphere.js";
import { Aerodynamics } from "../model/aerodynamic.js";
import { MathModel } from "../model/mathmodel.js";
import { modulOfValue, toFixedUpdate, setLimit, arrayRadToDeg, copyList } from "../utils/helper.js";
import * as math from 'mathjs'

export class FlySpace extends MathModel {
    #eps = 1e-4;

    constructor(V0, x0, y0, z0, wx0, wy0, wz0, pitch0, yaw0, roll0, alpha0, betta0, Ix, Iy, Iz, mass, d, length, targetX, targetY, targetZ, step, Kfi, Khi, Kthet, Kpsi, Kgamma, Kgammat) {
        super(Ix, Iy, Iz, mass, targetX, targetY, targetZ);

        this.V0 = V0;
        this.x0 = x0;
        this.y0 = y0;
        this.z0 = z0;
        this.wx0 = wx0;
        this.wy0 = wy0;
        this.wz0 = wz0;
        this.pitch0 = pitch0;
        this.yaw0 = yaw0;
        this.roll0 = roll0;
        this.alpha0 = alpha0;
        this.betta0 = betta0;
        this.Ix = Ix;
        this.Iy = Iy;
        this.Iz = Iz;
        this.mass = mass;
        this.d = d;
        this.length = length;
        this.targetX = targetX;
        this.targetY = targetY;
        this.targetZ = targetZ;
        this.step = step;

        this.Kfi = Kfi;
        this.Khi = Khi;
        this.Kthet = Kthet;
        this.Kpsi = Kpsi;
        this.Kgamma = Kgamma;
        this.Kgammat = Kgammat;

        this.THETc = this.pitch0;
        this.dt = this.step;
        this.deltav0 = 0;
        this.deltan0 = 0;
        this.deltae0 = 0;

        this.R0 = this.R_bkc(this.x0, this.y0, this.z0);
        this.hi0 = this.hif(this.z0, this.x0);
        this.fi0 = this.fif(y0, this.R0);

        this.t0 = 0;

        this.stage = [
            this.t0,                                        // [0] this.t, 
            this.x0,                                  // [1] this.Xg, 
            this.y0,                                  // [2] this.Yg, 
            this.z0,                                  // [3] this.Zg, 
            this.pitch0,                              // [4] this.thet, 
            this.yaw0,                                // [5] this.psi, 
            this.roll0,                               // [6] this.gama, 
            this.alpha0,                              // [7] this.alpha, 
            this.betta0,                              // [8] this.betta, 
            this.V0 * math.cos(this.THETc),           // [9] this.Vxg, 
            this.V0 * math.sin(this.THETc),           // [10] this.Vyg, 
            this.V0 * 0,                              // [11] this.Vzg, 
            this.deltav0,                             // [12] this.deltavf, 
            this.deltan0,                             // [13] this.deltanf, 
            this.deltae0,                             // [14] this.deltaef, 
            this.wx0,                                 // [15] this.wx, 
            this.wy0,                                 // [16] this.wy, 
            this.wz0,                                 // [17] this.wz, 
            this.initRorg(0, this.pitch0, 0),         // [18] this.rhoRG, 
            this.initLarg(0, this.pitch0, 0),         // [19] this.lyRG, 
            this.initMurg(0, this.pitch0, 0),         // [20] this.muRG, 
            this.initNurg(0, this.pitch0, 0),         // [21] this.nuRG
            this.fi0,                                 // [22] this.fi
            this.hi0,                                 // [23] this.hi
            this.R0                                  // [24] this.R
        ];

        this.stageRender = this.stage.map((v, k) => [arrayRadToDeg(v, k)]);
        this.getFly();

    }

    getNewAdh(stage) {
        let [h, Vxg, Vyg, Vzg, wx, wy, wz, alpha, beta, deltav, deltan, deltae] = [stage[2], stage[9], stage[10], stage[11], stage[15], stage[16], stage[17], stage[7], stage[8], stage[12], stage[13], stage[14]];

        const V = modulOfValue(Vxg, Vyg, Vzg);
        // debugger
        const atm = new Atmosphere4401(h);
        const M = V / atm.a;
        const q = atm.rho * V ** 2 / 2;
        const adh = new Aerodynamics(M, V, q, wx, wy, wz, alpha, beta, deltav, deltan, deltae, this.Ix, this.Iy, this.Iz, this.mass, this.d, this.length);
        const forc = adh.calculateForcesAndMoments();

        return [forc.X, forc.Y, forc.Z, forc.Mx, forc.My, forc.Mz];
    }

    getForceInNzsk(stage, X, Y, Z) {
        let [rho, ly, mu, nu] = [stage[18], stage[19], stage[20], stage[21]];

        const Fssk = [[-X], [Y], [Z]];
        const Anzsk_ssk = this.nzsk_ssk(rho, ly, mu, nu);
        const Fnzsk = math.multiply(math.inv(Anzsk_ssk), Fssk);

        return [Fnzsk[0][0], Fnzsk[1][0], Fnzsk[2][0]]
    }

    updateRgParam(stage) {
        let [rho, ly, mu, nu] = [stage[18], stage[19], stage[20], stage[21]];
        const rgNorm = modulOfValue(rho, ly, mu, nu)
        rho /= rgNorm;
        ly /= rgNorm;
        mu /= rgNorm;
        nu /= rgNorm;
        [stage[18], stage[19], stage[20], stage[21]] = [rho, ly, mu, nu];
    }

    getVssk(stage) {
        let [Vxg, Vyg, Vzg] = [stage[9], stage[10], stage[11]];
        let [rho, ly, mu, nu] = [stage[18], stage[19], stage[20], stage[21]];

        const Vnzsk = [[Vxg], [Vyg], [Vzg]];
        const Anzsk_sskRG = this.nzsk_ssk(rho, ly, mu, nu);
        const Vssk = math.multiply(Anzsk_sskRG, Vnzsk);

        return Vssk
    }

    updateAngularValues(stage, Vssk) {
        let [thet, psi, gamma, alpha, betta, Xg, Yg, Zg, fi, hi, R] = [stage[4], stage[5], stage[6], stage[7], stage[8], stage[1], stage[2], stage[3], stage[22], stage[23], stage[24]];
        let [rho, ly, mu, nu] = [stage[18], stage[19], stage[20], stage[21]];

        thet = this.thetf(rho, ly, mu, nu);
        psi = this.psif(rho, ly, mu, nu);
        gamma = this.gammaf(rho, ly, mu, nu);
        alpha = this.alphaf(Vssk[1][0], Vssk[0][0]);
        betta = this.bettaf(Vssk[2][0], modulOfValue(Vssk[0][0], Vssk[1][0], Vssk[2][0]));
        fi = this.fif(Yg, R);
        hi = this.hif(Zg, Xg);

        [stage[4], stage[5], stage[6], stage[7], stage[8], stage[22], stage[23]] = [thet, psi, gamma, alpha, betta, fi, hi];
    }

    updateRadiusR(stage) {
        let [Xg, Yg, Zg, R] = [stage[1], stage[2], stage[3], stage[24]];
        R = this.R_bkc(Xg, Yg, Zg);
        stage[24] = R;
    }

    updateDeltaValues(stage, stage_prev, dt) {
        const [thet, psi, gamma, fi, hi, Yg, R] = [stage[4], stage[5], stage[6], stage[22], stage[23], stage[2], stage[24]];
        const [thet_prev, psi_prev, gamma_prev, fi_prev, hi_prev] = [stage_prev[4], stage_prev[5], stage_prev[6], stage_prev[22], stage_prev[23]];
        let [dv, dn, de] = [stage[12], stage[13], stage[14]]; 

        const dthet = (thet - thet_prev) / dt;
        const dpsi = (psi - psi_prev) / dt;
        const dgamma = (gamma - gamma_prev) / dt;
        const dfi = (fi - fi_prev) / dt;
        const dhi = (hi - hi_prev) / dt;

        // фиксируем при 500м углы поворота рулей, а не зануляем
        let delta_prev = [dv, dn, de];

        if (Yg <= 500) {
            dv = delta_prev[0];
            dn = delta_prev[1];
            de = delta_prev[2];
        } else {
            dv = this.deltaBarrier(this.Kfi * dfi - this.Kthet * dthet);
            dn = this.deltaBarrier(this.Khi * dhi - this.Kpsi * dpsi);
            de = this.deltaBarrier(- this.Kgammat * dgamma - this.Kgamma * gamma);
        }

        [stage[12], stage[13], stage[14]] = [dv, dn, de];
    }

    clearTrashVal(stage, part, level) {
        return toFixedUpdate(stage, part, level) || setLimit(stage, this.#eps)
    }

    filterValues(part = 3, level = 25) {
        if (this.clearTrashVal(this.stage, part, level))
            this.stageRender.forEach((v, k) => v.push(arrayRadToDeg(this.stage[k], k)))
    }

    getFly() {
        while (this.stage[2] >= this.#eps) {
            const stage_prev = copyList(this.stage);
            const [X, Y, Z, Mx, My, Mz] = this.getNewAdh(this.stage);
            const [Fxg, Fyg, Fzg] = this.getForceInNzsk(this.stage, X, Y, Z);

            this.euler(this.stage, Fxg, Fyg, Fzg, Mx, My, Mz, this.dt);
            this.updateRgParam(this.stage);
            this.updateRadiusR(this.stage);
            this.updateAngularValues(this.stage, this.getVssk(this.stage));
            this.updateDeltaValues(this.stage, stage_prev, this.dt);
            this.stage[0] += this.dt;

            if (this.stage[2] < 0) {
                this.stage = copyList(stage_prev);
                this.dt /= 10;
                continue;
            }

            this.filterValues(4, 5000);
        }
    }
}
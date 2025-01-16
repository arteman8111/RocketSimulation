import { deg2rad } from "../utils/helper.js";
import * as math from 'mathjs'
// const math = require('mathjs')

export class MathModel {
    #g = 9.80665; // м/c^2

    constructor(Ix, Iy, Iz, mass, targetX, targetY, targetZ) {
        this.Ix = Ix;
        this.Iy = Iy;
        this.Iz = Iz;
        this.m = mass;
        this.targetX = targetX;
        this.targetY = targetY;
        this.targetZ = targetZ;
    }

    initRorg(psi, thet, gamma) {
        return math.cos(psi / 2) * math.cos(thet / 2) * math.cos(gamma / 2) - math.sin(psi / 2) * math.sin(thet / 2) * math.sin(gamma / 2);
    }
    initLarg(psi, thet, gamma) {
        return math.sin(psi / 2) * math.sin(thet / 2) * math.cos(gamma / 2) + math.cos(psi / 2) * math.cos(thet / 2) * math.sin(gamma / 2);
    }
    initMurg(psi, thet, gamma) {
        return math.sin(psi / 2) * math.cos(thet / 2) * math.cos(gamma / 2) + math.cos(psi / 2) * math.sin(thet / 2) * math.sin(gamma / 2);
    }
    initNurg(psi, thet, gamma) {
        return math.cos(psi / 2) * math.sin(thet / 2) * math.cos(gamma / 2) - math.sin(psi / 2) * math.cos(thet / 2) * math.sin(gamma / 2);
    }

    dvxg(Fxg) {
        return Fxg / this.m;
    }

    dvyg(Fyg) {
        return Fyg / this.m - this.#g;
    }

    dvzg(Fzg) {
        return Fzg / this.m;
    }

    dxg(vxg) {
        return vxg;
    }

    dyg(vyg) {
        return vyg;
    }

    dzg(vzg) {
        return vzg;
    }

    dwx(Mx, wy, wz) {
        return Mx / this.Ix - (this.Iz - this.Iy) * wy * wz / this.Ix;
    }

    dwy(My, wx, wz) {
        return My / this.Iy - (this.Ix - this.Iz) * wx * wz / this.Iy;
    }

    dwz(Mz, wx, wy) {
        return Mz / this.Iz - (this.Iy - this.Ix) * wx * wy / this.Iz;
    }

    drhoRG(rorg, larg, murg, nurg, wx, wy, wz) {
        return -(wx * larg + wy * murg + wz * nurg) / 2;
    }

    dlyRG(rorg, larg, murg, nurg, wx, wy, wz) {
        return (wx * rorg - wy * nurg + wz * murg) / 2;
    }

    dmuRG(rorg, larg, murg, nurg, wx, wy, wz) {
        return (wx * nurg + wy * rorg - wz * larg) / 2;
    }

    dnuRG(rorg, larg, murg, nurg, wx, wy, wz) {
        return (-wx * murg + wy * larg + wz * rorg) / 2;
    }

    thetf(rho, ly, mu, nu) {
        return math.asin(2 * (rho * nu + ly * mu));
    }

    psif(rho, ly, mu, nu) {
        return math.atan2(2 * (rho * mu - ly * nu), rho ** 2 + ly ** 2 - mu ** 2 - nu ** 2);
    }

    gammaf(rho, ly, mu, nu) {
        return math.atan2(2 * (rho * ly - mu * nu), rho ** 2 - ly ** 2 + mu ** 2 - nu ** 2);
    }

    alphaf(vy, vx) {
        return -math.atan2(vy, vx);
    }

    bettaf(vz, V) {
        return math.asin(vz / V);
    }

    nzsk_ssk(rho, ly, mu, nu) {
        const A = [
            [rho ** 2 + ly ** 2 - mu ** 2 - nu ** 2, 2 * (rho * nu + ly * mu), 2 * (-rho * mu + ly * nu)],
            [2 * (-rho * nu + ly * mu), rho ** 2 - ly ** 2 + mu ** 2 - nu ** 2, 2 * (rho * ly + nu * mu)],
            [2 * (rho * mu + ly * nu), 2 * (-rho * ly + mu * nu), rho ** 2 - ly ** 2 - mu ** 2 + nu ** 2]
        ];
        return A;
    }

    euler(stage, Fxg, Fyg, Fzg, Mx, My, Mz, dt) {
        let [vxg, vyg, vzg, wx, wy, wz, rhoRG, lyRG, muRG, nuRG] = [stage[9], stage[10], stage[11], stage[15], stage[16], stage[17], stage[18], stage[19], stage[20], stage[21]]

        stage[9] += this.dvxg(Fxg) * dt;
        stage[10] += this.dvyg(Fyg) * dt;
        stage[11] += this.dvzg(Fzg) * dt;
        stage[1] += this.dxg(vxg) * dt;
        stage[2] += this.dyg(vyg) * dt;
        stage[3] += this.dzg(vzg) * dt;
        stage[15] += this.dwx(Mx, wy, wz) * dt;
        stage[16] += this.dwy(My, wx, wz) * dt;
        stage[17] += this.dwz(Mz, wx, wy) * dt;
        stage[18] += this.drhoRG(rhoRG, lyRG, muRG, nuRG, wx, wy, wz) * dt;
        stage[19] += this.dlyRG(rhoRG, lyRG, muRG, nuRG, wx, wy, wz) * dt;
        stage[20] += this.dmuRG(rhoRG, lyRG, muRG, nuRG, wx, wy, wz) * dt;
        stage[21] += this.dnuRG(rhoRG, lyRG, muRG, nuRG, wx, wy, wz) * dt;
    }

    // СН
    nzsk_bkc(fi, hi) {
        const B = [
            [math.cos(fi) * math.cos(hi), -math.sin(fi) * math.cos(hi), math.sin(hi)],
            [math.sin(fi), math.cos(fi), 0],
            [math.cos(fi) * math.sin(hi), math.sin(fi) * math.sin(hi), math.cos(hi)]
        ]
        return B;
    }

    fif(Yg, R) {
        return math.asin((this.targetY - Yg) / R);
    }

    hif(Zg, Xg) {
        return -math.atan2((this.targetZ - Zg), (this.targetX - Xg));
    }

    R_bkc(Xg, Yg, Zg) {
        const b = ((this.targetX - Xg) ** 2 + (this.targetY - Yg) ** 2 + (this.targetZ - Zg) ** 2) ** 0.5; 
        return b;
    }

    // Ограничения по углам, угловым скоростям, углам поворота
    deltaBarrier(delta) {
        const maxDelta = deg2rad(15); //deg
        const minDelta = deg2rad(-15); //deg
        if (delta > maxDelta) delta = maxDelta;
        if (delta < minDelta) delta = minDelta;
        return delta
    }

    eulierAngularBarrier(angular) {
        const maxAngular = deg2rad(20); //deg
        const minAngular = deg2rad(-20); //deg
        if (angular > maxAngular) angular = maxAngular;
        if (angular < minAngular) angular = minAngular;
        return angular
    }

    angularVelocityBarrier(angVelocity) {
        const maxAngVelocity = 10; //rad/c
        const minAngVelocity = -10; //rad/c
        if (angVelocity > maxAngVelocity) angVelocity = maxAngVelocity;
        if (angVelocity < minAngVelocity) angVelocity = minAngVelocity;
        return angVelocity
    }
}

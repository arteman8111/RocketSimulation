import { FlySpace } from "./presenter/presenter.js";
import { View } from "./view/view.js";

class InitFlySpace {
    constructor(V0, x0, y0, z0, wx0, wy0, wz0, pitch0, yaw0, roll0, alpha0, betta0, Ix, Iy, Iz, mass, d, length, targetX, targetY, targetZ, step, Kfi, Khi, Kthet, Kpsi, Kgamma, Kgammat) {
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
    }

    getFly() {
        const initFly = new FlySpace(this.V0, this.x0, this.y0,
            this.z0, this.wx0, this.wy0,
            this.wz0, this.pitch0, this.yaw0,
            this.roll0, this.alpha0, this.betta0,
            this.Ix, this.Iy, this.Iz,
            this.mass, this.d, this.length,
            this.targetX, this.targetY, this.targetZ,
            this.step, this.Kfi, this.Khi, this.Kthet,
            this.Kpsi, this.Kgamma, this.Kgammat);

        new View(initFly.stageRender).getFileTech()
    }
}

new InitFlySpace(5400, 0, 37400, 0, 0.5, 0.5, 0.5,
    -0.73, 0, 0, 0, 0, 180, 700, 700, 1200, 1.4,
    3.7, 42029, 0, -488, 0.0001, 350, 400, 25, 25, 1, 1).getFly();


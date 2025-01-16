import * as math from 'mathjs'

export class Atmosphere4401 {
    #r = 6356767;
    #gc = 9.80665;
    #x = 1.4;
    #R = 287.05287;

    constructor(h) {
        this.h = h;
        this.H = this.#r * h / (this.#r + h);
        [this.bm, this.Tm, this.Hm, this.pm] = this.#getHeightParam();
        this.T = this.Tm + this.bm * (this.H - this.Hm);
        this.p = this.bm ? 
            this.pm * math.exp(-this.#gc * math.log(this.T / this.Tm) / (this.bm * this.#R)) : 
            this.pm * math.exp(-this.#gc * (this.H - this.Hm) / (this.#R * this.T));
        this.rho = this.p / (this.#R * this.T);
        this.a = math.sqrt(this.#x * this.#R * this.T);
        this.g = this.#gc * math.pow(this.#r / (this.#r + this.h), 2);
    }

    #getHeightParam() {
        const params = [
            { maxH: -2000, bm: 0, Tm: 0, Hm: 0, pm: 0 },
            { maxH: 0, bm: -0.0065, Tm: 301.15, Hm: -2000, pm: 127774 },
            { maxH: 11000, bm: -0.0065, Tm: 288.15, Hm: 0, pm: 101325 },
            { maxH: 20000, bm: 0, Tm: 216.65, Hm: 11000, pm: 22632 },
            { maxH: 32000, bm: 0.001, Tm: 216.65, Hm: 20000, pm: 5474.87 },
            { maxH: 47000, bm: 0.0028, Tm: 228.65, Hm: 32000, pm: 868.014 },
            { maxH: 51000, bm: 0, Tm: 270.65, Hm: 47000, pm: 110.906 },
            { maxH: 71000, bm: -0.0028, Tm: 270.65, Hm: 51000, pm: 66.9384 },
            { maxH: 85000, bm: -0.002, Tm: 214.65, Hm: 71000, pm: 3.95639 }
        ];
    
        for (const param of params) {
            if (this.h < param.maxH) {
                return [param.bm, param.Tm, param.Hm, param.pm];
            }
        }
    }
}
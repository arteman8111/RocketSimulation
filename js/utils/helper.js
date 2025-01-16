import { INDEX_OF_ANGULAR } from "../const.js";
import * as math from 'mathjs'

export const rad2deg = radian => radian * 180 / math.pi;
export const deg2rad = degree => degree * math.pi / 180;
export const modulOfValue = (...values) => math.sqrt(values.reduce((acc, value) => acc + value ** 2, 0));
export const toFixedUpdate = (stage, part, multiple) => stage[0].toFixed(part) * 10 ** part % multiple === 0;
export const setLimit = (stage, eps) => eps >= stage[2] > 0;
export const arrayRadToDeg = (angul, angul_key) => {
    if (INDEX_OF_ANGULAR.includes(angul_key))
        return rad2deg(angul);
    return angul;
}
export const copyList = arr => [...arr];
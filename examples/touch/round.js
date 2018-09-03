/**
 * Round to 1 digit
 * @param float
 * @param [digits]
 * @returns {number}
 */
export default (float, digits = 1) => {
    if (!digits || digits === 1) {
        return Math.round(float);
    }
    const round = 10 * digits;
    return Math.round(float * round) / round;
};

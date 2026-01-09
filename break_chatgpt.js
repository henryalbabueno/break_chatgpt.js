// break_chatgpt.js

class BreakChatGPT {
    constructor(value, type = "int") {
        if (typeof value === "number") {
            this.type = "int";
            this.value = value;
        } else if (typeof value === "bigint") {
            this.type = "int";
            this.value = value;
        } else if (typeof value === "string") {
            const num = Number(value);
            if (!isNaN(num)) {
                this.type = "int";
                this.value = num;
            } else {
                throw new Error("String must represent a number");
            }
        } else if (typeof value === "object") {
            if (type === "exp") {
                this.type = "exp";
                this.value = { base: value.base, exponent: value.exponent };
            } else if (type === "up") {
                this.type = "up";
                this.value = {
                    base: value.base,
                    height: value.height,
                    arrows: value.arrows,
                    multiplier: value.multiplier || 1
                };
            } else if (type === "sum" || type === "product" || type === "diff" || type === "quot") {
                this.type = type;
                this.value = value; // { a, b }
            } else {
                throw new Error("Object must have type 'exp', 'up', 'sum', 'product', 'diff', or 'quot'");
            }
        } else {
            throw new TypeError("Unsupported type for BreakChatGPT");
        }
    }

    // ----------------- Approximate / Symbolic -----------------
    approximate() {
        const MAX_NUM = 9.999e+9007199254740991; // numeric cutoff

        if (this.type === "int") return this.value;

        if (this.type === "exp") {
            const result = Math.pow(this.value.base, this.value.exponent);
            return result <= MAX_NUM ? result : this; // symbolic if too big
        }

        if (this.type === "up") {
            const { base, height, arrows } = this.value;

            // 1 arrow = normal exponent
            if (arrows === 1) {
                const result = Math.pow(base, height);
                return result <= MAX_NUM ? result : this;
            }

            // 2 arrows = tetration
            if (arrows === 2) {
                let result = base;
                for (let i = 1; i < height; i++) {
                    // log10 trick to prevent overflow
                    const power = Math.log10(base) * result;
                    const mantissa = Math.pow(10, power % 1);
                    const exponent = Math.floor(power);
                    result = mantissa * Math.pow(10, exponent);

                    if (result > MAX_NUM) return this; // symbolic fallback
                }
                return result;
            }

            // 3+ arrows = symbolic
            return this;
        }

        // sums, products, quotients remain symbolic
        if (["sum", "product", "diff", "quot"].includes(this.type)) return this;

        return NaN; // fallback
    }

    // ----------------- Arithmetic -----------------
    add(other) {
        const a = this.approximate();
        const b = other.approximate();

        // Numeric addition
        if (typeof a === "number" && typeof b === "number") return new BreakChatGPT(a + b);
        if (typeof a === "bigint" && typeof b === "bigint") return new BreakChatGPT(a + b);

        // Symbolic sum
        return new BreakChatGPT({ a, b }, "sum");
    }

    subtract(other) {
        const a = this.approximate();
        const b = other.approximate();

        if (typeof a === "number" && typeof b === "number") return new BreakChatGPT(a - b);
        if (typeof a === "bigint" && typeof b === "bigint") return new BreakChatGPT(a - b);

        return new BreakChatGPT({ a, b }, "diff");
    }

    multiply(other) {
        const a = this.approximate();
        const b = other.approximate();

        if (typeof a === "number" && typeof b === "number") return new BreakChatGPT(a * b);
        if (typeof a === "bigint" && typeof b === "bigint") return new BreakChatGPT(a * b);

        return new BreakChatGPT({ a, b }, "product");
    }

    divide(other) {
        const a = this.approximate();
        const b = other.approximate();

        if ((typeof a === "number" || typeof a === "bigint") &&
            (typeof b === "number" || typeof b === "bigint")) {
            return new BreakChatGPT(a / b);
        }

        return new BreakChatGPT({ a, b }, "quot");
    }

    power(other) {
        const a = this.approximate();
        const b = other.approximate();

        if ((typeof a === "number" || typeof a === "bigint") &&
            (typeof b === "number" || typeof b === "bigint")) {
            const val = Math.pow(a, b);
            return val <= 9.999e+9007199254740991 ? new BreakChatGPT(val) : new BreakChatGPT({ base: a, exponent: b }, "exp");
        }

        return new BreakChatGPT({ base: a, exponent: b }, "exp");
    }

    exp(exponent) {
        if (this.type === "int") return new BreakChatGPT({ base: this.value, exponent }, "exp");
        if (this.type === "exp") return new BreakChatGPT({ base: this.value.base, exponent: this.value.exponent * exponent }, "exp");
        if (this.type === "up") return new BreakChatGPT({
            base: this.value.base,
            height: this.value.height * exponent,
            arrows: this.value.arrows,
            multiplier: this.value.multiplier
        }, "up");
    }

    upArrow(height, arrows = 2) {
        if (this.type === "int") return new BreakChatGPT({ base: this.value, height, arrows }, "up");
        if (this.type === "up") {
            const { base, height: oldH, arrows: oldA, multiplier } = this.value;
            if (oldA === arrows) return new BreakChatGPT({ base, height: oldH + height, arrows, multiplier }, "up");
            return new BreakChatGPT({ base: this, height, arrows }, "up");
        }
        if (this.type === "exp") return new BreakChatGPT({ base: this.value.base, height: this.value.exponent, arrows }, "up");
    }

    // ----------------- Comparisons -----------------
    eq(other) { return this.approximate() === other.approximate(); }
    lt(other) { return this.approximate() < other.approximate(); }
    lte(other) { return this.lt(other) || this.eq(other); }
    gt(other) { return !this.lte(other); }
    gte(other) { return !this.lt(other); }
}

module.exports = { BreakChatGPT };

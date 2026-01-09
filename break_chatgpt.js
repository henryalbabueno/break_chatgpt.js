// break_chatgpt.js

class BreakChatGPT {
    constructor(value, type = "int") {
        if (typeof value === "number" || typeof value === "bigint") {
            this.type = "int";
            this.value = value;
        } else if (typeof value === "string") {
            const num = Number(value);
            if (!isNaN(num)) this.value = num, this.type = "int";
            else throw new Error("String must represent a number");
        } else if (typeof value === "object") {
            if (type === "exp") this.type = "exp", this.value = { base: value.base, exponent: value.exponent };
            else if (type === "up") this.type = "up", this.value = {
                base: value.base,
                height: value.height,
                arrows: value.arrows,
                multiplier: value.multiplier || 1
            };
            else if (["sum", "product", "diff", "quot"].includes(type)) this.type = type, this.value = value;
            else throw new Error("Invalid object type for BreakChatGPT");
        } else throw new TypeError("Unsupported type for BreakChatGPT");
    }

    // ----------------- Approximate / Symbolic -----------------
    approximate() {
        const MAX_NUM = 9.999e+9007199254740991; // numeric cutoff

        if (this.type === "int") return this.value;

        if (this.type === "exp") {
            const val = Math.pow(this.value.base, this.value.exponent);
            return val <= MAX_NUM ? val : this; // symbolic if too big
        }

        if (this.type === "up") {
            const { base, height, arrows } = this.value;

            // Recursive function to compute up-arrow numerically
            const computeUp = (b, h, a) => {
                if (a === 1) return Math.pow(b, h);
                if (h === 1) return b;
                let result = b;
                for (let i = 1; i < h; i++) {
                    result = computeUp(b, result, a - 1);
                    if (result > MAX_NUM) return null; // symbolic fallback
                }
                return result;
            };

            const numericResult = computeUp(base, height, arrows);
            return numericResult !== null ? numericResult : this;
        }

        // sums, products, quotients remain symbolic
        if (["sum", "product", "diff", "quot"].includes(this.type)) return this;

        return NaN;
    }

    // ----------------- Arithmetic -----------------
    add(other) {
        const a = this.approximate(), b = other.approximate();
        if (typeof a === "number" && typeof b === "number") return new BreakChatGPT(a + b);
        return new BreakChatGPT({ a, b }, "sum");
    }

    subtract(other) {
        const a = this.approximate(), b = other.approximate();
        if (typeof a === "number" && typeof b === "number") return new BreakChatGPT(a - b);
        return new BreakChatGPT({ a, b }, "diff");
    }

    multiply(other) {
        const a = this.approximate(), b = other.approximate();
        if (typeof a === "number" && typeof b === "number") return new BreakChatGPT(a * b);
        return new BreakChatGPT({ a, b }, "product");
    }

    divide(other) {
        const a = this.approximate(), b = other.approximate();
        if (typeof a === "number" && typeof b === "number") return new BreakChatGPT(a / b);
        return new BreakChatGPT({ a, b }, "quot");
    }

    power(other) {
        const a = this.approximate(), b = other.approximate();
        if (typeof a === "number" && typeof b === "number") {
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

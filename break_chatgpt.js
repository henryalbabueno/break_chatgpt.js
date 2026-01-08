// This is so memory efficient it doesn't need a min version

// break_chatgpt.js

class BreakChatGPT {
    constructor(value, type="int"){
        if(typeof value==="number"||typeof value==="bigint"){this.type="int";this.value=value;}
        else if(typeof value==="string"){const n=Number(value);if(!isNaN(n))this.type="int",this.value=n;else throw Error("String must represent number");}
        else if(typeof value==="object"){
            if(type==="exp")this.type="exp",this.value={base:value.base,exponent:value.exponent};
            else if(type==="up")this.type="up",this.value={base:value.base,height:value.height,arrows:value.arrows,multiplier:value.multiplier||1};
            else if(["sum","product","diff","quot"].includes(type))this.type=type,this.value=value;
            else throw Error("Object must have type 'exp','up','sum','product','diff','quot'");
        } else throw TypeError("Unsupported type for BreakChatGPT");
    }

    approximate(){
        if(this.type==="int")return this.value;
        if(this.type==="exp"){try{return BigInt(this.value.base)**BigInt(this.value.exponent);}catch{return this;}}
        if(this.type==="up"){const{base,height,arrows}=this.value;if(arrows===1){try{return BigInt(base)**BigInt(height);}catch{return this;}}
            if(arrows===2){let r=BigInt(base);for(let i=1;i<height;i++){try{r=BigInt(base)**r}catch{return this;}}return r;}return this;}
        if(["sum","product","diff","quot"].includes(this.type))return this;return NaN;
    }

    toSymbol(){
        if(this.type==="int")return this.value.toString();
        if(this.type==="exp")return`${this.value.base}^${this.value.exponent}`;
        if(this.type==="up"){const m=this.value.multiplier!==1?this.value.multiplier+"*":"";return`${m}${this.value.base}${"↑".repeat(this.value.arrows)}${this.value.height}`;}
        if(this.type==="sum")return`(${this.value.a.toSymbol()} + ${this.value.b.toSymbol()})`;
        if(this.type==="diff")return`(${this.value.a.toSymbol()} - ${this.value.b.toSymbol()})`;
        if(this.type==="product")return`(${this.value.a.toSymbol()} * ${this.value.b.toSymbol()})`;
        if(this.type==="quot")return`(${this.value.a.toSymbol()} / ${this.value.b.toSymbol()})`;
        return "unknown";
    }

    add(other){const a=this.approximate(),b=other.approximate();
        if(typeof a==="bigint"&&typeof b==="bigint")return new BreakChatGPT(a+b);
        if(typeof a==="number"&&typeof b==="number")return new BreakChatGPT(a+b);
        if(a instanceof BreakChatGPT&&b instanceof BreakChatGPT&&a.type==="up"&&b.type==="up"&&a.value.base===b.value.base&&a.value.height===b.value.height&&a.value.arrows===b.value.arrows)
            return new BreakChatGPT({base:a.value.base,height:a.value.height,arrows:a.value.arrows,multiplier:a.value.multiplier+b.value.multiplier},"up");
        return new BreakChatGPT({a,b},"sum");
    }

    subtract(other){const a=this.approximate(),b=other.approximate();
        if(typeof a==="bigint"&&typeof b==="bigint")return new BreakChatGPT(a-b);
        if(typeof a==="number"&&typeof b==="number")return new BreakChatGPT(a-b);
        return new BreakChatGPT({a,b},"diff");
    }

    multiply(other){const a=this.approximate(),b=other.approximate();
        if(typeof a==="bigint"&&typeof b==="bigint")return new BreakChatGPT(a*b);
        if(typeof a==="number"&&typeof b==="number")return new BreakChatGPT(a*b);
        if(a instanceof BreakChatGPT&&b instanceof BreakChatGPT&&a.type==="up"&&b.type==="up"&&a.value.base===b.value.base&&a.value.height===b.value.height&&a.value.arrows===b.value.arrows)
            return new BreakChatGPT({base:a.value.base,height:a.value.height,arrows:a.value.arrows,multiplier:a.value.multiplier*b.value.multiplier},"up");
        return new BreakChatGPT({a,b},"product");
    }

    divide(other){const a=this.approximate(),b=other.approximate();
        if((typeof a==="bigint"||typeof a==="number")&&(typeof b==="bigint"||typeof b==="number"))return new BreakChatGPT(a/b);
        return new BreakChatGPT({a,b},"quot");
    }

    power(other){const a=this.approximate(),b=other.approximate();
        if((typeof a==="bigint"||typeof a==="number")&&(typeof b==="bigint"||typeof b==="number")){try{return new BreakChatGPT(BigInt(a)**BigInt(b));}catch{return new BreakChatGPT({base:a,exponent:b},"exp");}}
        return new BreakChatGPT({base:a,exponent:b},"exp");
    }

    exp(exponent){if(this.type==="int")return new BreakChatGPT({base:this.value,exponent},"exp");
        if(this.type==="exp")return new BreakChatGPT({base:this.value.base,exponent:this.value.exponent*exponent},"exp");
        if(this.type==="up")return new BreakChatGPT({base:this.value.base,height:this.value.height*exponent,arrows:this.value.arrows,multiplier:this.value.multiplier},"up");
    }

    upArrow(height,arrows=2){if(this.type==="int")return new BreakChatGPT({base:this.value,height,arrows},"up");
        if(this.type==="up"){const{base,height:oldH,arrows:oldA,multiplier}=this.value;if(oldA===arrows)return new BreakChatGPT({base,height:oldH+height,arrows,multiplier},"up");return new BreakChatGPT({base:this,height,arrows},"up");}
        if(this.type==="exp")return new BreakChatGPT({base:this.value.base,height:this.value.exponent,arrows},"up");
    }

    eq(other){const a=this.approximate(),b=other.approximate();
        if(typeof a==="bigint"&&typeof b==="bigint")return a===b;
        if(typeof a==="number"&&typeof b==="number")return a===b;
        if(this.type==="up"&&other.type==="up"&&this.value.base===other.value.base&&this.value.arrows===other.value.arrows)return this.value.height===other.value.height;
        return undefined;
    }

    lt(other){const a=this.approximate(),b=other.approximate();
        if(typeof a==="bigint"&&typeof b==="bigint")return a<b;
        if(typeof a==="number"&&typeof b==="number")return a<b;
        if(this.type==="up"&&other.type==="up"&&this.value.base===other.value.base&&this.value.arrows===other.value.arrows)return this.value.height<other.value.height;
        return undefined;
    }

    lte(other){const lt=this.lt(other);if(lt!==undefined)return lt||this.eq(other);return undefined;}
    gt(other){const lt=this.lt(other);return lt!==undefined?!lt&&!this.eq(other)?true:false:undefined;}
    gte(other){const lte=this.lte(other);return lte!==undefined?!lte?true:false:undefined;}
}

if(typeof module!=="undefined")module.exports={BreakChatGPT};

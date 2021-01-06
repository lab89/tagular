import keypunch from '../keypunch/keypunch'
import {uuidv4} from '../util/util'

class TAG {    
    public punchingText: string[];    
    public punchingHole: Array<any> = [];  
    public tagText: string[];
    public id: string = "";

    private idx: number = 0;    
    private inserted: number = 0;

    public fragment: DocumentFragment;
    public parent: TAG;
    constructor(strings: string[], ...expr: any[]){    
        this.punchingText = strings //.map((d)=> d.trim());
        this.punchingHole = [...expr];         
        this.id = uuidv4();
        this.fillHole();
        this.createFragment();

        const newPunchingHole: any[] = [];
        this.dfs(this.fragment.childNodes[0], newPunchingHole)
        this.punchingHole = newPunchingHole

        this.punchingHole.forEach((d: any)=>{
            if(d.value instanceof TAG) d.parent = this;
            else if(d.value instanceof Array){
                d.value.forEach((f: any)=>{
                    if(f instanceof TAG)
                        f.parent = this;
                })
            }
        })
    }
    private isTagArray(array: Array<any>){
        let flat = false;
        array.forEach((d: any)=> {
            if(d instanceof TAG) flat = true;
        })
        return flat;
    }
    private fillHole(){        
        const expr = [...this.punchingHole]
        const txt = [...this.punchingText];        
            
        while(expr.length){            
            const e = expr.shift();           
            
            if(e instanceof Array){
                let flag = this.isTagArray(e)
                if(flag){
                    txt.splice(this.idx + 1 + this.inserted,0, "<!--T" + this.id + "-->")    
                }
                else{
                    txt.splice(this.idx + 1 + this.inserted,0, "<!--" + this.id + "-->")
                }
            }else if(e instanceof TAG){
                txt.splice(this.idx + 1 + this.inserted,0, "<!--T" + this.id + "-->")
            }else{
                txt.splice(this.idx + 1 + this.inserted,0, "<!--" + this.id + "-->")
            }
            this.inserted++;
            this.idx++;
        }        
        this.tagText = txt;        
    }
    private createFragment(){
        this.fragment = document.createDocumentFragment();
        const root = document.createElement("div");
        this.fragment.appendChild(root);
        root.innerHTML = this.tagText.join("");
    }
    private dfs(root: any, expr: Array<any>){
        const list: Array<any> = [root];
        while(list.length){
            const curr = list.shift();        
            if(curr.hasChildNodes())
                list.unshift(...curr.childNodes)
            
            if(curr.attributes && curr.attributes.length){
                const attr = curr.attributes        
                for(let i = 0; i < curr.attributes.length; i++){
                    const currentAttr = attr[i]
                    if(currentAttr.value === "<!--" + this.id + "-->"){
                        const expression = this.punchingHole.shift();
                        if(currentAttr.name.includes("@")){
                            curr.addEventListener(currentAttr.name.slice(1, currentAttr.name.length), expression);  
                            currentAttr.nodeValue = expression
                        }else if(expression instanceof Object){
                            Object.assign(curr.style, expression);
                                               
                        }else{                        
                            curr.setAttribute(currentAttr.name, expression);
                        }                               
                        expr.push({
                            type: "attribute",
                            name: currentAttr.name,
                            value : expression,
                            target : currentAttr
                        })                    
                    }else if(currentAttr.value.includes("<!--")){                                                            
                        console.error("invalid attribute")
                        return;
                        // const l = (currentAttr.value.match(new RegExp("<!--" + this.id + "-->", "g")) || []).length                                        
                        // let st = currentAttr.value             
                        // let splited;                                         
                        // splited = currentAttr.value.split(";").map((d: string)=> d.split(":")[0].trim())                        
                        // for(let i = 0 ; i < l; i++){ 
                        //     const v = this.punchingHole.shift();
                        //     st = st.replace("<!--" + this.id + "-->", v)   
                        //     expr.push({
                        //         type: "attribute",
                        //         name: currentAttr.name + "." + splited[i],
                        //         value : v,
                        //         target : currentAttr
                        //     })                       
                        // }                    
                        // currentAttr.value = st;
                    }
                }       
            }        
            if(curr instanceof Comment){     
                if(curr.textContent === this.id){
                    const v = this.punchingHole.shift()
                    if(v !== undefined) {
                        if(v instanceof Array){
                            v.forEach((d: any)=>{
                                const node = document.createTextNode(d)                    
                                curr.parentNode.insertBefore(node, curr.nextSibling)
                                expr.push({
                                    type: "text",
                                    value : v,
                                    target : node,
                                    targetComment : curr
                                })       
                            })
                        }else{
                            const node = document.createTextNode(v)                    
                            curr.parentNode.insertBefore(node, curr.nextSibling)
                            expr.push({
                                type: "text",
                                value : v,
                                target : node,
                                targetComment : curr
                            })   
                        }
                    }else{
                        expr.push({
                            type: "undefined",
                            value : v,
                            target : undefined,
                            targetComment : curr
                        })  
                    }
                    
                }else if(curr.textContent === "T" + this.id){
                    const v = this.punchingHole.shift()
                    if(v !== undefined){
                        expr.push({
                            type: "hasChild",
                            value : v,
                            target : undefined,
                            targetComment : curr
                        })   
                    }else{
                        expr.push({
                            type: "undefined",
                            value : v,
                            target : undefined,
                            targetComment : curr
                        })   
                    }
                }            
            }
            
        }
    }
}
function tag(strings: string[], ...expr: any[]): TAG{
    return new TAG(strings, ...expr)
}    

export {tag, TAG}
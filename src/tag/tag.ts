import {uuidv4} from '../util/util'

class TAG {    
    public punchingText: string[];    
    public punchingHole: Array<any> = [];  
    public tagText: string[];
    public id: string = "";

    private idx: number = 0;    
    private inserted: number = 0;

    public fragment: DocumentFragment;
    constructor(strings: string[], ...expr: any[]){  
        // https://stackoverflow.com/questions/19127384/what-is-a-regex-to-match-only-an-empty-string  
        this.punchingText = strings.map((d: any)=> d.replace(/\s+/g, ' ').trim())
               
        this.punchingHole = [...expr];       
        this.id = uuidv4();
        this.fillHole();

        this.createFragment();
        
        const newPunchingHole: any[] = [];        
        if(this.fragment instanceof DocumentFragment)
            this.dfs(this.fragment.childNodes[0], newPunchingHole)
        else    
            this.dfs(this.fragment, newPunchingHole);
        this.punchingHole = newPunchingHole

    }
    public clone(){
        return new TAG(this.punchingText, ...this.punchingHole.map((d: any)=> d.value))
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
        const testText = this.punchingText.join("").trim();
        
        if(!testText.includes("<table") && !testText.includes("<tr") && testText.includes("<td")){
            const root = document.createElement("tr");
            this.fragment.appendChild(root);  
            root.innerHTML = this.tagText.join("");
        }else if(!testText.includes("<table") && testText.includes("<tr") && !testText.includes("<td")){
            const root = document.createElement("table");
            root.innerHTML = this.tagText.join(""); 
            this.fragment.appendChild(root.childNodes[0]);  
        }else if(!testText.includes("<table") && testText.includes("<tr") && testText.includes("<td")){
            const root = document.createElement("table");
            root.innerHTML = this.tagText.join(""); 
            this.fragment.appendChild(root.childNodes[0]); 
        }else if(testText.length === 0){
            const root = document.createElement("div");
            this.fragment.appendChild(root);
            root.innerHTML = this.tagText.join("");       
        }else{
            const root = document.createElement("div");
            this.fragment.appendChild(root);
            root.innerHTML = this.tagText.join("");       
        }       

        // if(testText.length){
        // }else{
        //         const root = document.createElement("div");
        //         this.fragment.appendChild(root);
        //         root.innerHTML = this.tagText.join("");       
        //         // console.log(root.innerHTML.toString())
        // }
        
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
                        console.log(v);
                        if(v !== undefined) {
                            if(v instanceof Array){
                                const info = {
                                    type : "text",
                                    value : [] as Array<any>,
                                    target : [] as Array<any>,
                                    targetComment : curr
                                }                                                        
                                v.forEach((d: any)=>{
                                    const node = document.createTextNode(d)                    
                                    curr.parentNode.insertBefore(node, curr)
                                    info.value.push(d)
                                    info.target.push(node);
                                })
                                expr.push(info)
                            }else{
                                const info = {
                                    type : "text",
                                    value : [] as Array<any>,
                                    target : [] as Array<any>,
                                    targetComment : curr
                                }
                                const node = document.createTextNode(v)                    
                                curr.parentNode.insertBefore(node, curr)
                                info.value.push(v);
                                info.target.push(node);
                                expr.push(info)   
                                
                            }
                        }else{
                            expr.push({
                                type: "undefined",
                                value : [v],
                                target : [],
                                targetComment : curr
                            })  
                        }
                        
                    }else if(curr.textContent === "T" + this.id){
                        const v = this.punchingHole.shift()                    
                        if(v !== undefined){                        
                            if(v instanceof Array){
                                const info = {
                                    type : "hasChild",
                                    value : [] as Array<any>,
                                    target : [] as Array<any>,
                                    targetComment : curr
                                }
                                v.forEach((d: any)=>{         
                                    info.value.push(d);  
                                })
                                expr.push(info)
                            }else{                            
                                expr.push({
                                    type : "hasChild",
                                    value : [v] as Array<any>,
                                    target : [] as Array<any>,
                                    targetComment : curr
                                })
                            }
                            
                        }else{
                            expr.push({
                                type: "undefined",
                                value : undefined,
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
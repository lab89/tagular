import { TAG } from "../tag/tag";
import keypunch from "../keypunch/keypunch"
// https://stackoverflow.com/questions/6027830/is-it-possible-to-get-reference-to-comment-element-block-by-javascript
function getComments (root: HTMLElement) {
    var treeWalker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_COMMENT,
        {
            "acceptNode": function acceptNode (node) {
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );    
    var currentNode = treeWalker.nextNode();
    var nodeList = [];
    while (currentNode) {
        nodeList.push(currentNode);
        currentNode = treeWalker.nextNode();
    }
    return nodeList;
}

function bfs(root: TAG){    
    const queue = [root];    
    
    while(queue.length){
        const curr = queue.shift();  
        
        if(!curr.hasOwnProperty("punchingHole")) continue;       

        curr.punchingHole.forEach((d: any)=>{
            if(d instanceof Array){
                queue.push(...d)              
            }else if(d instanceof TAG){
                queue.push(...d.punchingHole)
            }else {
                queue.push(d)
            }
        })    
        curr.reset();
    }
}

function dfs(root: any, expr: Array<any>, oldExpr: Array<any>, id: string){
    const list: Array<any> = [root];
    let idx = 0;
    while(list.length){
        const curr = list.shift();
        if(curr.hasChildNodes())
            list.unshift(...curr.childNodes)
        
        if(curr.attributes && curr.attributes.length){
            const attr = curr.attributes        
            for(let i = 0; i < curr.attributes.length; i++){
                const currentAttr = attr[i]
                if(currentAttr.value === "<!--" + id + "-->"){
                    const expression = oldExpr.shift().value;
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
                        value : expression,
                        target : currentAttr
                    })                    
                }else if(currentAttr.value.includes("<!--")){                                                            
                    const l = (currentAttr.value.match(new RegExp("<!--" + id + "-->", "g")) || []).length                                        
                    let st = currentAttr.value                    
                    for(let i = 0 ; i < l; i++){ 
                        const v = oldExpr.shift().value;
                        st = st.replace("<!--" + id + "-->", v)   
                        expr.push({
                            type: "attribute",
                            value : v,
                            target : currentAttr
                        })                       
                    }                    
                    currentAttr.value = st;
                }
            }       
        }        
        if(curr instanceof Comment){     
            if(curr.textContent === id){
                const v = oldExpr.shift().value;
                expr.push({
                    type: "text",
                    value : v,
                    target : curr.parentElement
                })   
            }            
        }
        
    }

}
function merge(data: TAG, stringArr: Array<any>){    
    data.punchingText.forEach((d: any)=>{                
        if(d instanceof Object){
            if(d.value instanceof TAG) merge(d.value, stringArr)
            else if(d.value instanceof Array){
                d.value.forEach((f: any)=>{
                    merge(f, stringArr);
                })
            }else{                
                stringArr.push(d)    
            }
        }
        else {
            if(data.punchingHole.length === 0){                
                stringArr.push(d)    
            }else{
                stringArr.push(d)
            }
            
        }
    })
    return;
}
function reader(name: string){   
    let flatten: Array<any> = [];
    let expressions: Array<any> = [];
    let punchingText: string = "";
    let newExpressions: Array<any> = [];
    return function(renderTarget: HTMLElement, data: TAG){                
        bfs(data);       
        
        merge(data, flatten);
        
        expressions = flatten.map((d: any, index: number)=> ({
            index : index,
            value : d.value
        })).filter((d: any)=>d.value !== undefined)
        
        punchingText = flatten.map((d: any)=>{
            if(d instanceof Object) return "<!--" + data.id + "-->";
            else return d;
        }).join("")

        const fragment = document.createDocumentFragment();
        const root = document.createElement("div");
        fragment.appendChild(root);
        root.innerHTML = punchingText;   
        
        while(root.childNodes.length){
            fragment.appendChild(Array.from(root.childNodes).shift())
        }
        fragment.childNodes[0].remove();            
        
        dfs(fragment, newExpressions, expressions, data.id)

        renderTarget.appendChild(fragment);
        
        console.log(newExpressions)
    }
}


export default reader;
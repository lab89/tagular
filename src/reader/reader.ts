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
        if(curr === undefined) continue; 

        if(!curr.hasOwnProperty("punchingHole")) continue;       

        curr.punchingHole.forEach((d: any)=>{
            if(d instanceof Array){
                queue.push(...d)              
            }else if(d instanceof TAG){
                queue.push(d)
            }else {
                queue.push(d)
            }
        })    
        curr.reset();
    }
}

function dfs(root: any, expr: Array<any>, oldExpr: Array<any>, id: string){
    const list: Array<any> = [root];
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
                const v = oldExpr.shift()
                if(v === undefined) return;
                expr.push({
                    type: "text",
                    value : v.value,
                    target : curr.parentElement
                })   
            }            
        }
        
    }

}
function merge(data: TAG, stringArr: Array<any>){   
    if(data === undefined) return; 
    data.punchingText.forEach((d: any)=>{                
        if(d instanceof Object){
            if(d.value === undefined) return; 
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
function reader2(name: string){   
    let flatten: Array<any> = [];
    let expressions: Array<any> = [];
    let punchingText: string = "";
    let newExpressions: Array<any> = [];
    return function(renderTarget: HTMLElement, data: TAG){           
        console.log(data);     
        bfs(data);      
        
        merge(data, flatten);
        
        expressions = flatten.map((d: any, index: number)=> ({
            index : index,
            value : d.value
        })).filter((d: any)=>d.value !== undefined)
        
        console.log(flatten);
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

/**
 * 
 * const curr = list.shift();
        if(curr.value instanceof TAG){
            list.push(...curr.value.punchingHole
                .filter((f: any)=> f.type === "hasChild"))
        
            // curr.target.parentElement.insertBefore(curr.value.fragment, curr.nextSibling)   
            curr.target.parentElement.insertBefore(curr.value.fragment, curr.nextSibling)         
        }            
        else if(curr.value instanceof Array){
            const mapped = curr.value.filter((d: any)=> d instanceof TAG).map((d: any)=> d.punchingHole.filter((f: any)=> f.type === "hasChild")).flat()            
            // curr.value.filter((d: any)=> d instanceof TAG)
            console.log(mapped)
            list.push(...mapped)
            // curr.value.forEach((d: any)=>{
            //     curr.target.parentElement.insertBefore(d.fragment, curr.nextSibling)
            // })
        }
        
        
        console.log(curr)    
 * 
 */
function DFSPunchingHole(root: any, test: Array<any>){
    const list: Array<any> = [root];
    const target: Array<any> = [];
    while(list.length){
        const curr = list.shift();
        curr.punchingHole.filter((d: any)=> d.type === "hasChild").forEach((d: any)=>{
            if(d.value instanceof TAG){
                list.unshift(d.value)
                target.unshift(d.target);                
            }            
            else if(d.value instanceof Array){
                // const mapped = curr.value.filter((d: any)=> d instanceof TAG).map((d: any)=> d.punchingHole.filter((f: any)=> f.type === "hasChild")).flat()                        
                list.unshift(...d.value)
                target.unshift(...d.value.map((f: any)=> d.target));
            }
        })  
        const currTarget = target.shift();

        if(currTarget){           
            while(curr.fragment.childNodes[0].childNodes.length){
                curr.fragment.appendChild(Array.from(curr.fragment.childNodes[0].childNodes).shift())
            }
            curr.fragment.childNodes[0].remove(); 
            //console.log(curr)
            
            
            // curr.parent.fragment.insertBefore(curr.fragment, curr.parent.fragment.nextSibling)
            test.unshift({ tag: curr, target: currTarget});
            //         

        }
        

    }
}
function recursive(root: TAG, target: HTMLElement = null){    
    root.punchingHole.forEach((d: any)=>{
        if(d.value instanceof TAG){     
            recursive(d.value, d.target)
        }else if(d.value instanceof Array){
            d.value.forEach((f: any)=>{
                recursive(f, d.target)
            })
        }
    })    
    // console.log(parent);
    // console.log(root);
    if(parent && target){    
        // console.log(root)
        // console.log(target)      
        // console.log(parent);
        // console.log(target.parentElement)  
        // console.log(getComments(parent as unknown as HTMLElement))

        // Array.from(parent.childNodes).forEach((d: any)=>{
        //     if(d === target) console.log(d);
        // })
        while(root.fragment.children[0].childNodes.length){
            root.fragment.appendChild(Array.from(root.fragment.children[0].childNodes).shift())
        }
        root.fragment.children[0].remove();  
        target.parentElement.insertBefore(root.fragment, target)
        
        // const t = document.createElement("div")
        // t.innerHTML = "<p> HTTSADGFSDF </p>"
        // target.appendChild(t)
        // // parent.appendChild(root.fragment)        
    //    parent.replaceChild(root.fragment, target)
    }
    
}
function reader(name: string){       
    return function(renderTarget: HTMLElement, data: TAG){           
        recursive(data);
        renderTarget.appendChild(data.fragment);   
    }
}
export default reader;
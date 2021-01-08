import { TAG } from "../tag/tag";

function recursive(tag: TAG, targetComment: Comment = null){

    tag.punchingHole.forEach((d: any)=>{
        if(d.value instanceof Array){
            d.value.forEach((f: any)=>{
                if(f instanceof TAG){
                    recursive(f, d.targetComment);
                }
            })
        }
    })
    if(targetComment){

        while(tag.fragment.children[0].childNodes.length){
            const t = Array.from(tag.fragment.children[0].childNodes).shift()
            tag.fragment.appendChild(t)
        }
        tag.fragment.children[0].remove(); 
        targetComment.parentNode.insertBefore(tag.fragment, targetComment)        
    }
}

function textDiff(oph: any, nph: any){
    const ophValues = [...oph.value];
    const nphValues = [...nph.value];
    const ophTargets = [...oph.target];               
    let idx = 0;
    while(ophValues.length && nphValues.length){
        let ophValue = ophValues.shift();
        const nphValue = nphValues.shift();
        const ophTarget = ophTargets.shift();
        if(ophValue !== nphValue){                            
            ophTarget.textContent = nphValue;
            oph.value.splice(idx, 1, nphValue);
        }                        
        idx++;
    }    
}
function diff(oldTag: TAG, newTag: TAG, OPH: any = null, NPH: any = null){
    // punching text 비교
    const oldTagString = oldTag.punchingText.map((d: any)=> d.trim()).join("")
    const newTagString = newTag.punchingText.map((d: any)=> d.trim()).join("")

    if((oldTagString.length === newTagString.length)){
        const oldPunchingHole = [...oldTag.punchingHole];
        const newPunchingHole = [...newTag.punchingHole];
        

        while(oldPunchingHole.length && newPunchingHole.length){
            let oph = oldPunchingHole.shift();
            let nph = newPunchingHole.shift();                      
            if((oph.type === "text") && (nph.type === "text")){
                if(oph.value.length === nph.value.length){     
                    textDiff(oph, nph);             
                }else if(oph.value.length > nph.value.length){                    
                    oph.target.pop().remove();
                    oph.value.pop();
                    textDiff(oph, nph);
                }else if(oph.value.length < nph.value.length){
                    const lengthDiff = nph.value.length - oph.value.length;
                    for(let i = 0; i < lengthDiff; i++){
                        const node = document.createTextNode(nph.value[(nph.value.length - 1) - i])                    
                        oph.targetComment.parentNode.insertBefore(node, oph.targetComment)
                        oph.value.push(nph.value[(nph.value.length - 1) - i])
                        oph.target.push(node);
                    }                       
                    textDiff(oph, nph);
                }                   
            }else if((oph.type === "undefined") && (nph.type === "text")){
                oph.type = "text"
                nph.value.forEach((d: any)=>{
                    const node = document.createTextNode(nph.value)
                    oph.targetComment.parentElement.insertBefore(node, oph.targetComment)
                    oph.target.push(node);
                    oph.value.push(d);
                })              
            }else if((oph.type === "text") && (nph.type === "undefined")){                  
                oph.target.forEach((t: any)=>t.remove())
                oph.type = "undefined";                
                oph.target = [];
                oph.value = [];   
            }else if((oph.type === "text") && (nph.type === "hasChild")){
                oph.target.forEach((d: any)=>{
                    d.remove();                    
                })
                oph.type = "hasChild";
                oph.target = [];
                nph.value.forEach((d: any)=>{                    
                    recursive(d);
                    while(d.fragment.children[0].childNodes.length){
                        const t = Array.from(d.fragment.children[0].childNodes).shift()
                        
                        if(t instanceof Text){
                            if((/^(?!.)/s.test(t.textContent.trim()))){
                                t.remove()
                                continue;
                            }
                        }
                        if(!(t instanceof Comment)){
                            oph.target.push(t);
                        }
                        d.fragment.appendChild(t)

                    }
                    d.fragment.children[0].remove(); 
          
                    oph.targetComment.parentElement.insertBefore(d.fragment, oph.targetComment)  
                })                     
                oph.value = [...nph.value];         
                
            }else if((oph.type === "attribute") && (nph.type === "attribute")){
                // attribute setting..
                // check same value                
                if(typeof nph.value === "function"){
                    // oph.target.ownerElement.removeEventListener(oph.name.slice(1, oph.name.length), oph.value);  
                    // oph.target.ownerElement.addEventListener(oph.name.slice(1, oph.name.length), nph.value); 
                    // oph.target.ownerElement.nodeValue = nph.value; 
                }else{                    
                    if(oph.value === nph.value) continue;
                    oph.target.value = nph.value;
                    oph.value = nph.value;
                }
            }else if((oph.type === "hasChild") && (nph.type === "hasChild")){
                // diff..        
                                
                if(oph.value.length === nph.value.length){
                    const ophValues = [...oph.value];
                    const nphValues = [...nph.value];
                    while(ophValues.length && nphValues.length){
                        const ophValue = ophValues.shift();
                        const nphValue = nphValues.shift();
                        diff(ophValue, nphValue, oph, nph)
                    }
                }
                else if(oph.value.length > nph.value.length){    
                    const lengthDiff = oph.value.length  - nph.value.length;
                    for(let i = 0 ; i < lengthDiff ; i++){
                        oph.value.pop().punchingHole.forEach((d: any)=>{
                            oph.target.pop().remove()
                        })
                    }                
                    
                    const ophValues = [...oph.value];
                    const nphValues = [...nph.value];
                    while(ophValues.length && nphValues.length){
                        const ophValue = ophValues.shift();
                        const nphValue = nphValues.shift();
                        diff(ophValue, nphValue, oph, nph)
                    }
                }
                else if(oph.value.length < nph.value.length){
                    const lengthDiff = nph.value.length - oph.value.length;
                    for(let i = 0; i < lengthDiff; i++){         
                        const newT = oph.value[(oph.value.length - 1) - i].clone();                                                               
                        recursive(newT);  
                        while(newT.fragment.children[0].childNodes.length){
                            const t = Array.from(newT.fragment.children[0].childNodes).shift()
                            
                            if(t instanceof Text){
                                if((/^(?!.)/s.test(t.textContent.trim()))){
                                    t.remove()
                                    continue;
                                }
                            }
                            if(!(t instanceof Comment)){
                                oph.target.push(t);
                            }
                            newT.fragment.appendChild(t)
                        }
                        newT.fragment.children[0].remove(); 
                        oph.targetComment.parentElement.insertBefore(newT.fragment, oph.targetComment)
                        oph.value.push(newT);
                    }    
                       
                    
                    const ophValues = [...oph.value];
                    const nphValues = [...nph.value];
                    while(ophValues.length && nphValues.length){
                        const ophValue = ophValues.shift();
                        const nphValue = nphValues.shift();
                        diff(ophValue, nphValue, oph, nph)
                    }          
                }
                  
            }else if((oph.type === "hasChild") &&(nph.type === "undefined")){                
                oph.target.forEach((d: any)=>{
                    d.remove();                    
                })
                oph.type = "undefined";
                oph.target = [];
                oph.value = [];
            }else if((oph.type === "undefined") && (nph.type === "hasChild")){   
                oph.type = "hasChild";
                oph.target = [];
                nph.value.forEach((d: any)=>{                    
                    recursive(d);
                    while(d.fragment.children[0].childNodes.length){
                        const t = Array.from(d.fragment.children[0].childNodes).shift()
                        
                        if(t instanceof Text){
                            if((/^(?!.)/s.test(t.textContent.trim()))){
                                t.remove()
                                continue;
                            }
                        }
                        if(!(t instanceof Comment)){
                            oph.target.push(t);
                        }
                        d.fragment.appendChild(t)

                    }
                    d.fragment.children[0].remove(); 
          
                    oph.targetComment.parentElement.insertBefore(d.fragment, oph.targetComment)  
                })                     
                oph.value = [...nph.value];                 
            }else if((oph.type === "hasChild") && (nph.type === "text")){
                oph.target.forEach((d: any)=> d.remove())
                const text = document.createTextNode(nph.value)
                oph.targetComment.parentElement.insertBefore(text, oph.targetComment)
                oph.type = "text"
                oph.target = text;
                oph.value = nph.value;
            }                      
        }

        
    }else{
        oldTag.punchingHole.forEach((d: any)=>{
            OPH.target.shift().remove();
        })
        OPH.value.shift();            

        recursive(newTag);     
        while(newTag.fragment.children[0].childNodes.length){
            const t = Array.from(newTag.fragment.children[0].childNodes).shift()
            
            if(t instanceof Text){
                if((/^(?!.)/s.test(t.textContent.trim()))){
                    t.remove()
                    continue;
                }
            }
            if(!(t instanceof Comment)){
                OPH.target.push(t);
            }
            newTag.fragment.appendChild(t)
        }
        newTag.fragment.children[0].remove(); 
        OPH.targetComment.parentElement.insertBefore(newTag.fragment, OPH.targetComment)
        OPH.value.push(newTag)        
    }        
}
function reader(name: string){       
    let oldData: TAG = null;
    return function(renderTarget: HTMLElement, data: TAG){  
        console.log(data);           
        if(!oldData){   
            recursive(data);                   
            renderTarget.appendChild(data.fragment);   
            oldData = data;
        }else{
            diff(oldData, data);
        }
    }
}
export default reader;
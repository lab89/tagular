import { TAG } from "../tag/tag";
import { hole } from "../types/types";

function recursive(tag: TAG, targetComment: Comment = null){

    tag.punchingHole.forEach((d: hole)=>{
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

function textDiff(oph: hole, nph: hole){
    const ophValues = [...oph.value];
    const nphValues = [...nph.value];
    const ophTargets = [...oph.target];               
    let idx = 0;
    while(ophValues.length && nphValues.length){
        let ophValue = ophValues.shift();
        const nphValue = nphValues.shift();
        const ophTarget = ophTargets.shift();
        if(ophValue !== nphValue){                            
            ophTarget.textContent = nphValue as string;
            oph.value.splice(idx, 1, nphValue);
        }                        
        idx++;
    }    
}
function diff(oldTag: TAG, newTag: TAG, OPH: hole = null, NPH: hole = null){
    // punching text 비교
    const oldTagString = oldTag.punchingText.map((d: string)=> d.trim()).join("")
    const newTagString = newTag.punchingText.map((d: string)=> d.trim()).join("")

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
                nph.value.forEach((d: string | number)=>{
                    const node = document.createTextNode(nph.value)
                    oph.targetComment.parentElement.insertBefore(node, oph.targetComment)
                    oph.target.push(node);
                    oph.value.push(d);
                })              
            }else if((oph.type === "text") && (nph.type === "undefined")){                  
                oph.target.forEach((t: HTMLElement)=>t.remove())
                oph.type = "undefined";                
                oph.target = [];
                oph.value = [];   
            }else if((oph.type === "text") && (nph.type === "hasChild")){
                oph.target.forEach((d: HTMLElement)=>{
                    d.remove();                    
                })
                oph.type = "hasChild";
                oph.target = [];
                nph.value.forEach((d: TAG)=>{                    
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
                    oph.target.ownerElement["on"+oph.name.slice(1, oph.name.length)] = nph.value;
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
                        oph.value.pop().punchingHole.forEach((d: hole)=>{
                            if(d.type !== "attribute")
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
                        const newT = nph.value[(nph.value.length - 1) - i].clone();                                                               
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
                oph.target.forEach((d: HTMLElement)=>{
                    d.remove();                    
                })
                oph.type = "undefined";
                oph.target = [];
                oph.value = [];
            }else if((oph.type === "undefined") && (nph.type === "hasChild")){   
                oph.type = "hasChild";
                oph.target = [];
                nph.value.forEach((d: TAG)=>{                    
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
                oph.target.forEach((d: HTMLElement)=> d.remove())
                const text = document.createTextNode(nph.value)
                oph.targetComment.parentElement.insertBefore(text, oph.targetComment)
                oph.type = "text"
                oph.target = text;
                oph.value = nph.value;
            }                      
        }

        
    }else{
        oldTag.punchingHole.forEach((d: HTMLElement)=>{
            OPH.target.shift().remove();
        })
        OPH.value.shift();            

        recursive(newTag);     
        while(newTag.fragment.children[0].childNodes.length){
            const t = Array.from(newTag.fragment.children[0].childNodes).shift() as HTMLElement
            
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
function initTarget(oldTag: TAG){
    const oldTagString = oldTag.tagText.map((d: any)=> d.trim()).join("")

    if((oldTagString.length)){
        const oldPunchingHole = [...oldTag.punchingHole];        
        while(oldPunchingHole.length){
            let oph = oldPunchingHole.shift();
            if((oph.type === "hasChild")){
                // diff..        
                                
                if(oph.value.length){
                    const ophValues = [...oph.value];                    
                    while(ophValues.length){
                        const ophValue = ophValues.shift();
                        initTarget(ophValue)
                    }
                }
                oph.value.forEach((d: TAG)=>{                    
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
            }                                   
        }

        
    }        
}
function reader(name: string){       
    let oldData: TAG = null;
    return function(renderTarget: HTMLElement, data: TAG){  
        if(!oldData){               
            initTarget(data);   
            renderTarget.appendChild(data.fragment);   
            oldData = data;
        }else{
            diff(oldData, data);
        }
    }
}
export default reader;
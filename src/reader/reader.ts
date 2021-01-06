import { TAG } from "../tag/tag";

function recursive(root: TAG, target: HTMLElement = null){   
    if(!root.hasOwnProperty("punchingHole")) return
    root.punchingHole.forEach((d: any)=>{
        if(d.value instanceof TAG){     
            recursive(d.value, d.target)
        }else if(d.value instanceof Array){
            d.value.forEach((f: any)=>{
                recursive(f, d.target)
            })
        }
    })   
    while(root.fragment.children[0].childNodes.length){
        root.fragment.appendChild(Array.from(root.fragment.children[0].childNodes).shift())
    }
    root.fragment.children[0].remove();  
    if(target){        
        target.parentElement.insertBefore(root.fragment, target)        
    }
    return;
}

function diff(oldTag: TAG, newTag: TAG){
    // punching text 비교
    const oldTagString = oldTag.punchingText.join("")
    const newTagString = newTag.punchingText.join("")
    // && (oldTag.punchingHole.length === newTag.punchingHole.length)
    if((oldTagString === newTagString)){
        const oldPunchingHole = [...oldTag.punchingHole];
        const newPunchingHole = [...newTag.punchingHole];

        let index = 0;
        while(oldPunchingHole.length && newPunchingHole.length){
            let oph = oldPunchingHole.shift();
            let nph = newPunchingHole.shift();          
            if((oph.type === "text") && (nph.type === "text")){
                oph.target.textContent = nph.value;
                oldTag.punchingHole[index].value = nph.value;                
            }else if((oph.type === "undefined") && (nph.type === "text")){

            }else if((oph.type === "text") && (nph.type === "undefined")){
                oph.target.remove();
            }else if((oph.type === "text") && (nph.type === "hasChild")){
                // recursive(nph.value)
                // oph.target.parentElement.insertBefore(nph.value.fragment, oph.target)
                // oph.target.remove();                
            }else if((oph.type === "attribute") && (nph.type === "attribute")){

            }else if((oph.type === "hasChild") && (nph.type === "hasChild")){
                
            }else if((oph.type === "hasChild") &&(nph.type === "undeinfed")){
                
            }else if((oph.type === "undefined") && (nph.type === "hasChild")){
                // recursive(nph.value)
                // oph.target.parentElement.insertBefore(nph.value.fragment, oph.target)
                // oph.target.remove();                
            }else if((oph.type === "hasChild") && (nph.type === "text")){
                
            }                      
            index++;
        }

        
    }else{
        // rendertarget에 있는거 떼어 낸다.
    }        
}
function reader(name: string){       
    let oldData: TAG = null;
    return function(renderTarget: HTMLElement, data: TAG){             
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
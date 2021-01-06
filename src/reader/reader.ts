import { TAG } from "../tag/tag";

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
    
    if(target){
        while(root.fragment.children[0].childNodes.length){
            root.fragment.appendChild(Array.from(root.fragment.children[0].childNodes).shift())
        }
        root.fragment.children[0].remove();  
        target.parentElement.insertBefore(root.fragment, target)        
    }
    
}
function reader(name: string){       
    return function(renderTarget: HTMLElement, data: TAG){           
        recursive(data);
        renderTarget.appendChild(data.fragment);   
    }
}
export default reader;
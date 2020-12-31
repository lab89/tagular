import puncher from '../puncher/puncher'
import {uuidv4} from '../util/util'
class TAG {
    private holes: Array<any> = [];
    public id: string = "";
    private fragment: DocumentFragment;    
    private punched: string;
    private expressions: Array<any> = [];
    
    constructor(strings: TemplateStringsArray, ...expr: any[]){
        this.id = uuidv4();
        
        this.punched = puncher(this.id, strings, expr);
        this.fragment = document.createDocumentFragment();
        const root = document.createElement("div");
        this.fragment.appendChild(root);
        root.innerHTML = this.punched;        
        
        this.expressions.push(...expr)
        this.recursive(this.fragment.childNodes[0] as HTMLElement);
        
        while(root.childNodes.length){
            this.fragment.appendChild(Array.from(root.childNodes).shift())
        }
        this.fragment.childNodes[0].remove();
    }    

    public update(){
        // difference check
        // holes와 expressions를 서로 비교        
            // attr은 그냥 바꿔주면 되고 
            // element가 같으면 값만 교체
            // element가 다르면 기존꺼 제거 하고 새로 갈아치우기
    }

    private recursive(tag: HTMLElement){
        if(tag.attributes && tag.attributes.length){            
            const attr = tag.attributes
            const length = tag.attributes.length;     
            let i = 0;                          
            while(i < tag.attributes.length){
                const currentAttr = attr[i]
                if(currentAttr.value === this.id){
                    const expression = this.expressions.shift();
                    if(currentAttr.name.includes("@")){
                        tag.addEventListener(currentAttr.name.slice(1, currentAttr.name.length), expression);  
                        currentAttr.nodeValue = expression                        
                    }else if(expression instanceof Object){
                        Object.assign(tag.style, expression);
                    }else{
                        tag.setAttribute(currentAttr.name, expression);
                    }                   
                    this.holes.push(currentAttr)
                }
                i++;
            }
        }        
        
        if(tag instanceof Comment) {                        
                            
            if(tag.nodeValue === this.id){
                const content = this.expressions.shift();
                if( typeof content === 'string' || typeof content === 'number'){
                    const textNode = document.createTextNode(content.toString());                    
                    tag.parentElement.insertBefore(textNode, tag.nextSibling)
                    this.holes.push(textNode)
                }else if(content instanceof TAG){
                    tag.parentElement.appendChild(content.fragment);                    
                    this.holes.push(content)
                }else if(content instanceof Array){
                    content.forEach((d: TAG)=> {                        
                        tag.parentElement.appendChild(d.fragment)                        
                    })
                    this.holes.push(content)
                }                
            }    
            return;
        };  
        
        if(tag instanceof HTMLScriptElement){    
            console.warn("script tag is not executable!")        
            // var s = document.createElement( 'script' );
            // const ct = document.createTextNode(tag.text)    
            // if(tag.src) s.setAttribute("src", tag.src);
            // if(tag.type) s.setAttribute("type", tag.type);
            // if(tag.async) s.setAttribute("async", tag.async.toString());                        
            // s.appendChild(ct);       
            // tag.parentNode.insertBefore(s, tag);
            // this.holes.push(s)
            // tag.remove();            
            return;            
        }
        
        if(tag.hasChildNodes()) {
            tag.childNodes.forEach((c: HTMLElement)=>{  
                this.recursive(c);
            })
        }else{            
            return;
        }
    }
}
function tag(strings: TemplateStringsArray, ...expr: any[]): TAG{    
    return new TAG(strings, ...expr);    
}

export default tag;
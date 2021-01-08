# tagular
## template literal html render library
![grab-landing-page](https://github.com/lab89/tagular/blob/main/images/main.gif?raw=true) 

- html, css, javascript 만으로 양방향 바인딩 같은 화면을 구성할 수 있습니다!
- 전체 html을 업데이트 하는 것이 아닌 값이나 태그가 바뀐 것만 업데이트 합니다.
- 이벤트 콜백 및 스타일 및 클래스 등 Attribute에도 적용 가능 합니다. 
  - 이벤트 콜백은 단 한번 초기에 셋팅됩니다. 
- script태그는 적용되지 않습니다!
- 순수하게 렌더만 하기 때문에 나머지는 여러분들이 조합하기 나름 입니다!
> ## dependencies
```
 none
```
> ## install
```
npm i tagular
```
   
## usage
- 두 가지 함수밖에 없습니다(tag, render)
  - tag에 포함된 html tag string은 html로 변환 됩니다. 
  - tag에 포함되지 않는 모든것은 text node로 변환 됩니다.
  - reader는 tag를 rendertarget에 붙이는 역할만 합니다.
```
import {tag, reader} from 'tagular'
const mainReader = reader('main') // 의미는 없습니다... 버전 업그레이드 시 활용처가 생길 것 같습니다.

let a = 0;
let s = "border : 1px solid red; width : 500px; height : 500px";

const renderFunction = () => {
  return tag`
    <div class="${className}" style="${s}">
        <div style="width: 500px; height: 500px" @click="${click.bind(this, ["hi"])}" data-test="${d}">
            TEXT : ${a}
            ${
                (()=>{
                    if(a > 0 && a <= 2)
                        return undefined;
                    else if(a > 2 && a <= 4)
                        return [1, 2, 3].map((d: number)=> 
                            tag`
                                <div>${d}</div>
                                ${`<div>Hello  !</div>`}`
                            )    
                    else if(a > 4 && a <= 6)
                        return [4, 5, 6].map((d: number)=> 
                            tag`
                                <div>${d} </div>
                                ${`<div>World  !</div>`}                                
                                `                                
                        )  
                    else if(a > 6 && a <= 8)
                        return [6, 7, 8].map((d: number)=> 
                            tag`
                                <div>${d} </div>
                                ${`<div>Hello World  !</div>`}                                
                                `                                
                        ) 
                    else if(a > 8 && a <= 10)
                        return [1, 2, 3].map((d: any)=>{
                            return tag`                                
                                ${[4, 5, 6].map((f: any)=>{
                                    return tag`                                        
                                        ${[6, 7, 8].map((g: any)=>{
                                            return tag`<div>${d}, ${f}, ${g}</div>`
                                        })}
                                    `
                                })}
                            `
                        })
                })()
            }
        </div>    
    </div>
}

function click(data: any){
    a++;    
    s = "border : 1px solid red; width : "+ b +"px; height : "+ b + "px"
    mainReader(document.body, renderFunction())
}
```

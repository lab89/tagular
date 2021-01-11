# tagular
## template literal html render library
![grab-landing-page](https://github.com/lab89/tagular/blob/main/images/main2.gif?raw=true) 
https://lab89.github.io/sample/tagular-input
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
  
## Example : Todo List
![grab-landing-page](https://github.com/lab89/tagular/blob/main/images/todolist.gif?raw=true) 
https://lab89.github.io/sample/tagular-todo

## Example : Table row Increasing
https://lab89.github.io/sample/tagular-table




import './App.css';
import TaskList from './Components/TaskList';
import CompletedTask from './Components/CompletedTask';
// import StateComp from './Components/Practice';
import { useState } from 'react';
// function hai 
function App() {
//  first state li h humne taki hum input le skte
  let [valueInput, setvalueInput] = useState('')
// second state li hai task list ke lia 
  let [update, setUpdate] = useState([])
//  third state li hai completeTask ke lia
  let[completeTask, setcompleteTask] = useState([])
  // let Array =["cleaning","dustbin","task"]
  // console.log(target.value)
// let [inputChange, setInputValue]
let [edit, setEdit] = useState ( )
let [storeValue, setStoreValue ] = useState('')


// console.log(inputChange)
  // function btnclicked(){
  // // alert("clicked")
  // console.log(valueInput)

  //  }
  //( filter ke element hai),(i jo hai index hai). first me hamesha element aata hai second me index ki value hoti hai or wo humee filter krke dete hai
  const deletebtn = (id, listtype) => {
// window.confirm is used for delete the input one by one
if(listtype === "tasklist"){
    if (window.confirm("Do you really want to leave?")) {
      const newList = update.filter((ele, index) => {
        return id !== index

      })
      setUpdate(newList)
    }
}
  else{
   if  (window.confirm("Do you really want to leave?")) {
      const newList = completeTask.filter((ele, index) => {
        return id !== index

      })
      setcompleteTask(newList)
    }
   }

 }

  function handChange(event) {
    setvalueInput(event.target.value)
  }
// second step button click pe jo bhi input pe likha hai wo show krega ek button click pe
  function btnclicked() {
    setUpdate([...update, valueInput]);
    // console.log(update)
    // console.log(value)

    setvalueInput(" ")
  // ..............for alert use alert(varialeadd)
  }
  // function handleRemoveItem(){
  //   setUpdate((update) => update.filter((_, index=> index !==0)));
 // console.log(index)
 // }
// third step button removebtn pe 
// newlist yani new variable .... for checkbox
const removebtn = (id) => {

const newList = update.filter((ele,index) => {
return id !==index
})
setUpdate(newList)


const dltList = update.filter((ele,index) =>{
return id === index
})
setcompleteTask([...completeTask,...dltList])
}


// undo function
const undofunction = (id) => {
var backitem = completeTask.filter((ele,index) => {
console.log (ele)
return id !== index
})
setcompleteTask(backitem)
console.log(backitem)

// undo function 
var  undoitem = completeTask.filter((ele,index) => {
console.log (ele)
return id === index
} )
setUpdate([...update, ...undoitem])
console.log(update)
}

  // const newValueget = (event) =>{
  // setStoreValue (event.target.value)
  //  }


const editTask = (id) => {
console.log(id)
setEdit(id)
}
// it is used for store input value
const tick = (id) => {
console.log(id)
var newArr = [...update]
newArr[id] = storeValue
setUpdate(newArr)
setEdit('')

}
// it is used for store input value
const newInput = (event) => {
console.log(event)
setStoreValue(event.target.value)
console.log(event)
}


  return (
    <div className="App">
      <h1 className="app-header">Welcome to your To-do-List</h1>
       <div className="container">
        <div className="add-task">
          <input type="text" placeholder="Add a new task" value={valueInput} onChange={handChange} />
          <button onClick={btnclicked}>Add</button>

        </div>
        <div className="task-row">
          {/* <TaskList  task1 ={task} task2 = "cleaning" task3 = "Dustbin"/> */}
          <TaskList task={update} callback={deletebtn} checkbox={removebtn} tick={tick} editTask={editTask} edit={edit} newInput={newInput} />
          <CompletedTask checkbox = {completeTask} undo = {undofunction} callback={deletebtn} />
          {/* <StateComp /> */}
        </div>
      </div>
    </div>
  );
}

export default App;


function TaskList(props) {
  // console.log(props)
  // function for check box

// const [edit, setEdit] = useState(false)
// function clickBox(){
// setEdit(false)
// }

  // function checkbox() {
  //   // alert is used for function  is working or not
  //   // alert("abc")
  // setEdit(true)
  // }

  return (

    <div className="task-list">
      <h3 className="task-list-header">Task List</h3>
      {props.task.map((taskName, index) => {
        return (

    <div className="task-list-item" key={index}>
            {/* onclick for check box checkbox is function name  */}
            <input type="checkbox"className="checkbox" onClick={() => props.checkbox(index)} />
         {props.edit === index ?
          <div>
              <input type = "text" defaultValue={taskName} onChange={props.newInput}/>
              <img src="https://github.com/Shital-bh/Todo/blob/main/public/assets/pencil.png?raw=true"  alt="check" onClick={() => props.tick(index)} /></div>
          :
          <div> 
              <p className="task-name">{taskName}</p>
              <img src="https://github.com/Shital-bh/Todo/blob/main/public/assets/pencil.png?raw=true" alt="pencil" className="pencil" onClick={() => props.editTask(index)}/></div>
          }
          <img src="https://raw.githubusercontent.com/Shital-bh/Todo/refs/heads/main/public/assets/delete.png" alt="delete" className="delete" onClick={() => props.callback(index,"tasklist")} />
            {/* <img src="assets/delete.png" onClick={handleRemoveItem}/> */}
    </div>

          // function child(props){
          // let name = "abc";
          // return(
          // <button onClick={()=>props.PrintName(name)}
          // )}



          // {/* <div className="task-list-item">
          //      <input type="checkbox" />
          //      <p className="task-name">{props.task2}</p>
          //         <img src="/assets/pencil.png" />
          //         <img src="assets/delete.png" />

          //       </div>
          // <div className="task-list-item">
          //      <input type="checkbox"/>
          //      <p className="tast-name">{props.task3}</p>
          //         <img src="/assets/pencil.png" />
          //         <img src="assets/delete.png" />

          //       </div> */}
        )
      })
      }
    </div>);
}
export default TaskList;
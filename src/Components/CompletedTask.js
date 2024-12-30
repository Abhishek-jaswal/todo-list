function CompletedTask(props) {
    return (
  
      <div className="complete-task">
        <h3 className="task-list-header"> Completed Task </h3>
        {props.checkbox.map((completed, index) => {
          return (
            <div className="task-list-item" key={index}>
              <img src="https://github.com/Shital-bh/Todo/blob/main/public/undo.png?raw=true"  alt="undo" onClick={() => props.undo(index)} />
              <p className="task-name">{completed}</p>
              <img src="https://raw.githubusercontent.com/Shital-bh/Todo/refs/heads/main/public/assets/delete.png" alt="delete" onClick={() => props.callback(index, "completetask")} />
  
  
            </div>)
        }
        )
        }
      </div>
  
    );
  }
  
  export default CompletedTask;
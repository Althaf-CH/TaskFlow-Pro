const API_URL =
"https://taskflow-pro-production-b789.up.railway.app";

const userId =
localStorage.getItem("userId");

let currentFilter = "All"; //task filter

document.getElementById("welcomeText")
.textContent =
`Welcome, ${localStorage.getItem("name")}`;

document.getElementById("logoutBtn")
.addEventListener("click", () => {

    localStorage.clear();

    window.location = "login.html";

});

function setFilter(filter){

    currentFilter = filter;

    loadTasks();

}

async function loadTasks(){

    const response =
    await fetch(
        `${API_URL}/tasks/${userId}`
    );

    const tasks =
await response.json();

tasks.sort((a,b) => {

    if(
        a.status === "Pending" &&
        b.status === "Completed"
    ){
        return -1;
    }

    if(
        a.status === "Completed" &&
        b.status === "Pending"
    ){
        return 1;
    }

    if(
        a.priority === "High" &&
        b.priority !== "High"
    ){
        return -1;
    }

    if(
        a.priority !== "High" &&
        b.priority === "High"
    ){
        return 1;
    }

    return 0;

});
    const searchText = document.getElementById("searchTask")?.value.toLowerCase() || "";

    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";
    let visibleTasks = 0;
    let highPriority = 0;
    let pending = 0;
    let completed = 0;

    tasks.forEach(task => {

    if(
        !task.title.toLowerCase().includes(searchText) &&
        !task.description.toLowerCase().includes(searchText)
    ){
        return;
    }
      if(currentFilter !== "All" &&
      task.status !== currentFilter)
      {
      return;
     }
        if(task.status === "Pending"){
            pending++;
        }

        if(task.status === "Completed"){
            completed++;
        }

      if(task.priority === "High"){
       highPriority++;
      }
      const dueDate =new Date(task.due_date);

     const today =new Date();

     const difference =Math.ceil((dueDate - today) /(1000*60*60*24));

     const dueSoon = difference <= 2 && difference >= 0;

     visibleTasks++;

     taskList.innerHTML += `
<div class="task-card ${task.status === "Completed" ? "completed" : ""} ${dueSoon ? "due-soon" : ""}">
    <h3>${task.title}</h3>

    <p>${task.description}</p>

    <p>
        Priority:
        <span class="${task.priority.toLowerCase()}">
            ${task.priority}
        </span>
    </p>

    <p>
        Due:
        ${task.due_date}
    </p>

    <p>
        Status:
        ${task.status}
    </p>

    <div class="task-actions">

     <button
class="edit-btn"
onclick="editTask(
    ${task.id},
    '${task.title}',
    '${task.description}',
    '${task.priority}',
    '${task.due_date}'
)"
>
Edit
</button>

     <button
class="complete-btn"
${task.status === "Completed" ? "disabled" : ""}
onclick="completeTask(${task.id})"
>
${task.status === "Completed"
? "✓ Completed"
: "Complete"}
</button>

     <button
     class="delete-btn"
     onclick="deleteTask(${task.id})"> 
     Delete
     </button>

    </div>



</div>
`;

    });
    if(visibleTasks === 0){

    taskList.innerHTML = `
        <div class="empty-state">

            <h2>No Tasks Found</h2>

            <p>
                Create your first task!
            </p>

        </div>
    `;
}

    document.getElementById("totalTasks").textContent = tasks.length;

    document.getElementById("pendingTasks").textContent = pending;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("highPriorityTasks").textContent = highPriority;

    const percentage =
   tasks.length === 0? 0: Math.round((completed / tasks.length) * 100);

 document.getElementById("progressFill").style.width =`${percentage}%`;

 document.getElementById("progressText").textContent =`${percentage}% Completed`;

}
//add task
document
.getElementById("addTaskBtn")
.addEventListener(
    "click",
    async () => {

        const title =
        document.getElementById("taskTitle").value;

        const description =
        document.getElementById("taskDescription").value;

        const priority =
        document.getElementById("taskPriority").value;

        const due_date =
        document.getElementById("taskDueDate").value;

        if(title.trim() === ""){
    alert("Title cannot be empty");
    return;
}

if(description.trim() === ""){
    alert("Description cannot be empty");
    return;
}

if(due_date === ""){
    alert("Please select a due date");
    return;
}

        await fetch(
            `${API_URL}/tasks`,
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                    title,
                    description,
                    priority,
                    due_date,
                    user_id:userId
                })
            }
        );

        loadTasks();
        document.getElementById("taskTitle").value = "";
        document.getElementById("taskDescription").value = "";
        document.getElementById("taskPriority").value = "Low";
        document.getElementById("taskDueDate").value = "";

    }
);
// delete task with confirmation
async function deleteTask(id){

    const confirmDelete =
    confirm(
        "Are you sure you want to delete this task?"
    );

    if(!confirmDelete){
        return;
    }

    await fetch(
        `${API_URL}/tasks/${id}`,
        {
            method:"DELETE"
        }
    );

    loadTasks();

}
//complete task
async function completeTask(id){

    await fetch(
        `${API_URL}/tasks/${id}`,
        {
            method:"PUT"
        }
    );

    loadTasks();

}
//edit task
async function editTask(
    id,
    oldTitle,
    oldDescription,
    oldPriority,
    oldDueDate
){

    const newTitle =
    prompt(
        "Title",
        oldTitle
    );

    if(newTitle === null){
    return;
    }

   if(newTitle.trim() === ""){
     alert("Title cannot be empty");
     return;
    }

    const newDescription =
    prompt(
        "Description",
        oldDescription
    );
    if(newDescription === null){
    return;
    }

   if(newDescription.trim() === ""){
    alert("Description cannot be empty");
    return;
    }

    
    const newPriority =
    prompt(
        "Priority",
        oldPriority
    );
     if(newPriority === null){
    return;
   }

    const validPriorities =["Low","low","Medium","medium","High","high"];

    if(
    !validPriorities.includes(newPriority)
   ){
    alert(
        "Priority must be Low, Medium, or High"
    );

    return;
    }

    const newDueDate =
    prompt(
        "Due Date",
        oldDueDate
    );
    if(newDueDate === null){
    return;
    }

    if(
    !/^\d{4}-\d{2}-\d{2}$/.test(newDueDate)
    ){
    alert(
        "Date must be YYYY-MM-DD"
    );

    return;
    }
    await fetch(
        `${API_URL}/edit-task/${id}`,
        {
            method:"PUT",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                title:newTitle,

                description:newDescription,

                priority:newPriority,

                due_date:newDueDate

            })
        }
    );

    loadTasks();

}
document.getElementById("searchTask")
.addEventListener(
    "input",
    loadTasks
);

loadTasks();
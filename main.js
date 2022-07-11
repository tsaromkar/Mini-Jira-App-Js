let inputField = document.getElementById("inputField")
let addTodoBtn = document.getElementById("addTodoBtn")
let clearAllTodosBtn = document.getElementById("clearAllTodosBtn")
let todosTable = document.getElementById("todosTable")
let inProgressTable = document.getElementById("inProgressTable")
let doneTable = document.getElementById("doneTable")
let todoList = []
let count = 0;
var onDoneItems;


const TodoStatus = {
    Todo: "Todo",
    InProgress: "InProgress",
    Done: "Done"
};
Object.freeze(TodoStatus);

// modal
var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];
var done = document.getElementById("done");

span.onclick = function () {
    closeModal()
}

window.onclick = function (event) {
    if (event.target == modal) {
        closeModal()
    }
}

const closeModal = () => {
    let todoDetails = document.getElementById("todo-details");
    todoDetails.innerHTML = ''
    let selectTodoStatus = document.getElementById("select-todo-status");
    selectTodoStatus.innerHTML = ''
    modal.style.display = "none";
}

// create card
const createTodoCard = (todoItem) => {
    const card = document.createElement('div')
    card.setAttribute('id', todoItem.id)
    card.setAttribute('class', 'pointer')
    card.style.width = '100%';
    const div = document.createElement('div')
    div.innerText = todoItem.todo
    div.style.width = '90%';
    div.style.float = 'left'
    const button = document.createElement('button')
    button.innerText = 'x'
    button.style.float = 'right'
    button.style.width = '10%'
    button.setAttribute('id', 'deleteTodo')
    button.setAttribute('onclick', `deleteTodo(` + todoItem.id + `, "` + todoItem.todoStatus + `", true, event)`)
    card.appendChild(div)
    card.appendChild(button)

    div.addEventListener('click', () => {
        modal.style.display = "block";

        var heading = document.createElement('h3')
        heading.innerText = TodoStatus.Todo
        let modalContentDiv = document.createElement('div')
        modalContentDiv.appendChild(heading)

        let clonedCard = card.cloneNode(true)
        clonedCard.querySelector('#deleteTodo').style.display = 'none'
        modalContentDiv.appendChild(clonedCard)

        let todoDetails = document.getElementById("todo-details");
        todoDetails.appendChild(modalContentDiv)

        selectTodoStatus = document.getElementById("select-todo-status");
        for (let key in TodoStatus) {
            var option = document.createElement('option')
            option.setAttribute('value', TodoStatus[key])
            if (todoItem.todoStatus === TodoStatus[key]) option.setAttribute('selected', true)
            option.innerText = TodoStatus[key]
            selectTodoStatus.appendChild(option)
        }

        selectTodoStatus.addEventListener('change', (event) => {
            //console.log(event.target.value)
            onDoneItems = {
                item: todoItem,
                status: event.target.value,
                prevStatus: todoItem.todoStatus
            }
        })
    })

    return card
}

const deleteTodo = (id, status, isDelete, event) => {
    switch (status) {
        case TodoStatus.Todo:
            var rowToBeDeleted = todosTable.querySelector("tr[id='" + id + "']");
            rowToBeDeleted.parentNode.removeChild(rowToBeDeleted)
            break;
        case TodoStatus.InProgress:
            var rowToBeDeleted = inProgressTable.querySelector("tr[id='" + id + "']");
            rowToBeDeleted.parentNode.removeChild(rowToBeDeleted)
            break;
        case TodoStatus.Done:
            var rowToBeDeleted = doneTable.querySelector("tr[id='" + id + "']");
            rowToBeDeleted.parentNode.removeChild(rowToBeDeleted)
            break;
        default:
    }
    if (isDelete) {
        event.stopPropagation();
        todoList = todoList.filter(item => item.id !== id)
        sessionStorage.setItem('todoList', JSON.stringify(todoList))
        console.log(sessionStorage.getItem('todoList'))
    }
}

// add todo to todo column
const addTodoCell = (table, todoItem, prevStatus) => {
    var row = table.insertRow(-1);
    row.id = todoItem.id
    row.setAttribute('draggable', 'true')
    row.setAttribute('ondragstart', 'drag(event)')
    var cell = row.insertCell(-1)
    cell.appendChild(createTodoCard(todoItem));
    deleteTodo(todoItem.id, prevStatus)
}

// remove data from storage
const removeDataFromSessionStorage = () => {
    sessionStorage.removeItem("count")
    sessionStorage.removeItem("todoList")
}

const addTodoToTables = (item, prevStatus) => {
    switch (item.todoStatus) {
        case TodoStatus.Todo:
            addTodoCell(todosTable, item, prevStatus)
            break;
        case TodoStatus.InProgress:
            addTodoCell(inProgressTable, item, prevStatus)
            break;
        case TodoStatus.Done:
            addTodoCell(doneTable, item, prevStatus)
            break;
        default:
            addTodoCell(todosTable, item, prevStatus)
    }
}



// get data from storge
const getDataFromSessionStorage = (() => {
    // removeDataFromSessionStorage()
    let storedCount = sessionStorage.getItem("count")
    if (storedCount) {
        count = storedCount
    }
    let storedTodoList
    try {
        storedTodoList = JSON.parse(sessionStorage.getItem('todoList'))
    } catch (err) {
        console.log(err.message)
    }
    if (storedTodoList) {
        todoList = storedTodoList
        console.log("stored todo ", todoList)
        todoList.forEach(item => {
            addTodoToTables(item)
        })
    }
})()

done.onclick = function () {
    if (onDoneItems) {
        todoList.map(item => {
            if (item.id === onDoneItems.item.id) {
                item.todoStatus = onDoneItems.status
            }
        })
        sessionStorage.setItem('todoList', JSON.stringify(todoList))
        addTodoToTables(onDoneItems.item, onDoneItems.prevStatus)
    }
    closeModal()
}

// on keypress
inputField.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addTodoBtn.click();
    }
});

// add todos
addTodoBtn.addEventListener('click', function () {
    let value = inputField.value
    if (value === "") {
        alert("Please enter a todo in the input field");
        return;
    }
    createTodoList(value)
    inputField.value = ""
})

clearAllTodosBtn.addEventListener('click', () => {
    removeDataFromSessionStorage()
    location.reload()
})

// create todo list
const createTodoList = (value) => {
    let obj = { id: ++count, todo: value, todoStatus: TodoStatus.Todo }
    todoList.push(obj)
    console.log("add todo ", todoList)
    sessionStorage.setItem("count", count)
    sessionStorage.setItem("todoList", JSON.stringify(todoList))
    addTodoToTables(obj)
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    // console.log(ev.target)
    ev.dataTransfer.setData("dragTodo", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("dragTodo");
    const tr = document.getElementById(id);
    let status
    todoList.map(item => {
        if (item.id === parseInt(id)) {
            switch (ev.target.id) {
                case "todosTable":
                    item.todoStatus = TodoStatus.Todo
                    status = TodoStatus.Todo
                    break
                case "inProgressTable":
                    item.todoStatus = TodoStatus.InProgress
                    status = TodoStatus.InProgress
                    break
                case "doneTable":
                    item.todoStatus = TodoStatus.Done
                    status = TodoStatus.Done
                    break
                default:
                    item.todoStatus = TodoStatus.Todo
                    status = TodoStatus.Todo
            }
        }
    })

    const deleteTodo = tr.querySelector("#deleteTodo");
    deleteTodo.setAttribute('onclick', `deleteTodo(` + id + `, "` + status + `", true, event)`)
    ev.target.appendChild(tr);
    console.log(todoList)
    sessionStorage.setItem('todoList', JSON.stringify(todoList))
}
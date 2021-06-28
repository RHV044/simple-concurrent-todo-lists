const USER_NAME = animals[Math.floor(Math.random() * animals.length)];

$(document).ready(function () {
    $('#user-name').html(USER_NAME);
    updateLists();
    setInterval(() => updateLists(), 10000);
});

function updateLists() {
    console.log("Updating lists");
    askForNode()
        .then((response) => $.ajax({
            url: `http://localhost:${response.port}/lists`,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }))
        .then((response) => response.forEach((todoList) => {
            if ($(`#todo-list-hash-${todoList.id}`).length == 0) {
                addListView(todoList);
            } else if ($(`#todo-list-hash-${todoList.id}`).val() != todoList.hashVersion) { 
                // TODO: test it when hash is implemented (it's working now because "null" != null no it's updating allways :))
                updateListView(todoList);
            }
        }));
}

function addTodoList(id) {
    const title = $('#todo-list-title').val();
    if (!title || title.trim().length == 0) {
        showError("Error al crear la lista", "Por favor complete el titulo de la lista")
        return;
    }
    askForNode()
        .then((response) => $.ajax({
            url: `http://localhost:${response.port}/lists`,
            type: "POST",
            data: JSON.stringify({
                list: {
                    title: title,
                    creator: USER_NAME
                }
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }))
        .then((response) => addListView(response))
        .fail(() => showError("Error al crear la lista", "Hubo un error al intentar la creación de la lista, intentelo nuevamente"));
}

function addTodoListTask(id) {
    const task = $(`#todo-list-input-${id}`).val();
    if (!task || task.trim().length == 0) {
        showError("Error al crear la tarea", "Por favor complete el texto")
        return;
    }
    askForNode()
        .then((response) => $.ajax({
            url: `http://localhost:${response.port}/lists/${id}/items`,
            type: "POST",
            data: JSON.stringify({
                item: {
                    text: task,
                    done: false
                }
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }))
        .then((response) => updateListView(response.list))
        .fail(() => showError("Error al crear la tarea", "Hubo un error al intentar la creación de la tarea, intentelo nuevamente"));
}

function editTask(listId, taskIndex, task) {
    var newTask = prompt(`Modificar la tarea "${task}" a:`);
    if (newTask === null) return; // Cancel button was clicked
    if (!newTask || newTask.trim().length == 0) {
        showError("Error al modificar la tarea", "Por favor complete el texto")
        return;
    }
    askForNode()
        .then((response) => $.ajax({
            url: `http://localhost:${response.port}/lists/${listId}/items/${taskIndex}`,
            type: "PUT",
            data: JSON.stringify({
                text: newTask
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }))
        .then((response) => updateListView(response.list))
        .fail(() => showError("Error al modificar la tarea", "Hubo un error al intentar la creación de la tarea, intentelo nuevamente"));

}

function toggleTaskChecked(listId, taskIndex, actualStatus) {
    askForNode()
        .then((response) => $.ajax({
            url: `http://localhost:${response.port}/lists/${listId}/items/${taskIndex}/done?status=${!actualStatus}`,
            type: "PATCH",
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }))
        .then((response) => updateListView(response.list))
        .fail(() => showError("Error al modificar la tarea", "Hubo un error al intentar la creación de la tarea, intentelo nuevamente"));
}

function addListView(todoList) {
    $('#todo-lists-container').append(TODO_LIST_HTML
        .replaceAll('{todo_list_title}', todoList.title)
        .replaceAll('{todo_list_hash}', todoList.hashVersion)
        .replaceAll('{todo_list_id}', todoList.id));
    if (todoList.list && todoList.list.length > 0) updateListView(todoList);
}

function updateListView(todoList) {
    $(`#todo-list-hash-${todoList.id}`).val(todoList.hashVersion);
    $(`#todo-list-container-${todoList.id} .todo-list`).html(todoList.list.reduce((acc, task, index) => acc + TODO_LIST_TASK_HTML
        .replaceAll('{todo_list_task_completed}', task.done.toString().toLowerCase() == "true" ? 'completed' : '')
        .replaceAll('{todo_list_task_checked}', task.done.toString().toLowerCase() == "true" ? 'checked' : '')
        .replaceAll('{todo_list_task_is_checked}', task.done.toString().toLowerCase() == "true" ? 'true' : 'false')
        .replaceAll('{todo_list_task_index}', index)
        .replaceAll('{todo_list_id}', todoList.id)
        .replaceAll('{todo_list_task}', task.text), ""));
}

function askForNode(action) {
    return $.get('http://localhost:9000/node/any');
}

function showError(title, message) {
    $('#toast-error').toast({ animation: true, delay: 3000 });
    $("#toast-error-title").html(title);
    $("#toast-error-message").html(message);
    $('#toast-error').toast('show');
}

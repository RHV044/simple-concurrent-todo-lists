const USER_NAME = animals[Math.floor(Math.random() * animals.length)];

$(document).ready(function () {
    $('#user-name').html(USER_NAME);
});

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
        .then((response) => {
            $('#todo-lists-container').append(TODO_LIST_HTML
                .replaceAll('{todo_list_title}', response.list.title)
                .replaceAll('{todo_list_id}', response.list.id))
        })
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
        .then((response) => updateList(id, response.list))
        .fail(() => showError("Error al crear la tarea", "Hubo un error al intentar la creación de la tarea, intentelo nuevamente"));
}

function editTask(listId, taskId, task) {
    var newTask = prompt(`Modificar la tarea "${task}" a:`);
    if (!newTask || newTask.trim().length == 0) {
        showError("Error al modificar la tarea", "Por favor complete el texto")
        return;
    }
    askForNode()
        .then((response) => $.ajax({
            url: `http://localhost:${response.port}/lists/${listId}/items/${taskId}`,
            type: "PUT",
            data: JSON.stringify({
                text: newTask
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }))
        .then((response) => updateList(id, response.list))
        .fail(() => showError("Error al modificar la tarea", "Hubo un error al intentar la creación de la tarea, intentelo nuevamente"));

}

function toggleTaskChecked(listId, taskId, actualStatus) {
    askForNode()
        .then((response) => $.ajax({
            url: `http://localhost:${response.port}/lists/${listId}/items/${taskId}/done`,
            type: "PUT",
            data: JSON.stringify({
                status: !actualStatus
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }))
        .then((response) => updateList(id, response.list))
        .fail(() => showError("Error al modificar la tarea", "Hubo un error al intentar la creación de la tarea, intentelo nuevamente"));
}

function updateList(id, list) {
    $(`#todo-list-container-${id} .todo-list`).html(list.list.reduce((acc, task) => acc + TODO_LIST_TASK_HTML
        .replaceAll('{todo_list_task_completed}', task.done ? 'completed' : '')
        .replaceAll('{todo_list_task_checked}', task.done ? 'checked' : '')
        .replaceAll('{todo_list_task_is_checked}', task.done ? 'true' : 'false')
        .replaceAll('{todo_list_task_id}', task.id)
        .replaceAll('{todo_list_id}', id)
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

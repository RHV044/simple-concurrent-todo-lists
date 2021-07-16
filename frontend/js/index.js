const USER_NAME = animals[Math.floor(Math.random() * animals.length)];

$(document).ready(function () {
    $('#user-name').html(USER_NAME);
    updateLists();
    setInterval(() => updateLists(), 2000); // Check the lists every 10 seconds.
});

function updateLists() {
    doBackendApiCall("GET", "lists")
        .then((response) => response.forEach((todoList) => {
            if ($(`#todo-list-hash-${todoList.id}`).length == 0) {
                addListView(todoList);
            } else if (getTodoListHash(todoList.id) != generateListHash(todoList.list)) {
                // TODO: test it when hash is implemented. It's working now because "null" != null so it's updating always :)
                updateListView(todoList);
            }
        }));
}

function addTodoList(id) {
    const title = $('#todo-list-title').val();
    if (!title || title.trim().length == 0) {
        showErrorAndPerformUpdate("Error al crear la lista", "Por favor complete el titulo de la lista")
        return;
    }
    doBackendApiCall("POST", "lists", null,
        {
            list: {
                title: title,
                creator: USER_NAME
            }
        })
        .then((response) => addListView(response))
        .fail(() => showErrorAndPerformUpdate("Error al crear la lista", "Hubo un error al realizar la creación de la lista, intentelo nuevamente"));
}

function addTodoListTask(id) {
    const task = $(`#todo-list-input-${id}`).val();
    if (!task || task.trim().length == 0) {
        showErrorAndPerformUpdate("Error al crear la tarea", "Por favor complete el texto")
        return;
    }
    doBackendApiCall("POST", `lists/${id}/items`, id,
        {
            item: {
                text: task,
                done: false
            }
        })
        .then((response) => updateListView(response.list))
        .fail(() => showErrorAndPerformUpdate("Error al crear la tarea", "Hubo un error al realizar la creación de la tarea, intentelo nuevamente"));
}

function editTask(listId, taskIndex, task) {
    var newTask = prompt(`Modificar la tarea "${task}" a:`);
    if (newTask === null) return; // Cancel button was clicked
    if (!newTask || newTask.trim().length == 0) {
        showErrorAndPerformUpdate("Error al modificar la tarea", "Por favor complete el texto")
        return;
    }
    doBackendApiCall("PUT", `lists/${listId}/items/${taskIndex}`, listId,
        {
            text: newTask
        })
        .then((response) => updateListView(response.list))
        .fail(() => showErrorAndPerformUpdate("Error al modificar la tarea", "Hubo un error al modificar la tarea, intentelo nuevamente"));

}

function toggleTaskChecked(listId, taskIndex, actualStatus) {
    doBackendApiCall("PATCH", `lists/${listId}/items/${taskIndex}/done?status=${!actualStatus}`, listId)
        .then((response) => updateListView(response.list))
        .fail(() => showErrorAndPerformUpdate("Error al modificar la tarea", "Hubo un error al modificar el estado de la tarea, intentelo nuevamente"));
}

function moveTask(listId, taskIndex, plusIndex) {
    doBackendApiCall("PATCH", `lists/${listId}/items/${taskIndex}/position`, listId,
        {
            "new_index": parseInt(taskIndex) + parseInt(plusIndex)
        })
        .then((response) => updateListView(response.list))
        .fail(() => showErrorAndPerformUpdate("Error al modificar la tarea", "Hubo un error al modificar la posición de la tarea, intentelo nuevamente"));
}

function addListView(todoList) {
    $('#todo-lists-container').append(TODO_LIST_HTML
        .replaceAll('{todo_list_title}', todoList.title)
        .replaceAll('{todo_list_hash}', generateListHash(todoList.list))
        .replaceAll('{todo_list_id}', todoList.id));
    if (todoList.list && todoList.list.length > 0) updateListView(todoList);
}

function updateListView(todoList) {
    $(`#todo-list-hash-${todoList.id}`).val(generateListHash(todoList.list));
    $(`#todo-list-container-${todoList.id} .todo-list`).html(todoList.list.filter((task) => task != null).reduce((acc, task, index) => acc + TODO_LIST_TASK_HTML
        .replaceAll('{todo_list_task_completed}', task.done.toString().toLowerCase() == "true" ? 'completed' : '')
        .replaceAll('{todo_list_task_checked}', task.done.toString().toLowerCase() == "true" ? 'checked' : '')
        .replaceAll('{todo_list_task_is_checked}', task.done.toString().toLowerCase() == "true" ? 'true' : 'false')
        .replaceAll('{todo_list_task_index}', index)
        .replaceAll('{todo_list_id}', todoList.id)
        .replaceAll('{todo_list_hash}', generateListHash(todoList.list))
        .replaceAll('{todo_list_task_icon_disabled_up}', index + 1 == todoList.list.length ? "disabled-icon-button" : "")
        .replaceAll('{todo_list_task_icon_disabled_down}', index == 0 ? "disabled-icon-button" : "")
        .replaceAll('{todo_list_task}', task.text), ""));
}

function doBackendApiCall(type, endpoint, listId = null, body = null) {
    const listHash = listId != null ? getTodoListHash(listId) : null;
    const headers = listHash != null ? { 'X-List-Hash': listHash } : null;
    return askForNode()
        .then((response) => $.ajax({
            url: `http://localhost:${response.port}/${endpoint}`,
            type: type,
            headers: headers,
            data: body != null ? JSON.stringify(body) : null,
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }))
}

function getTodoListHash(listId) {
    return $(`#todo-list-hash-${listId}`).val();
}

function askForNode() {
    return $.get('http://localhost:9000/node/any');
}

function showErrorAndPerformUpdate(title, message) {
    $('#toast-error').toast({ animation: true, delay: 3000 });
    $("#toast-error-title").html(title);
    $("#toast-error-message").html(message);
    $('#toast-error').toast('show');
    updateLists(); // Do this here because one of the most probable reasons of the error is that the list is not updated
}



function generateListHash(list) {
    const stringList = JSON.stringify(list);
    var listHash = 0, i, char;

    for (i = 0; i < stringList.length; i++) {
      char = stringList.charCodeAt(i);
      listHash = ((listHash << 5) - listHash) + char;
      listHash |= 0; // Convert to 32bit integer
    }
    return listHash;
}
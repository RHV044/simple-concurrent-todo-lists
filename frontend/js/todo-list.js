const TODO_LIST_HTML = 
'<div id="todo-list-container-{todo_list_id}" class="col-lg-4 col-md-6 col-12">' +
    '<div class="card px-3">' +
        '<div class="card-body">' +
            '<h4 class="card-title">{todo_list_title}</h4>' +
            '<div class="add-items d-flex">' +
                '<input id="todo-list-hash-{todo_list_id}" type="hidden" value="{todo_list_hash}">' +
                '<input id="todo-list-input-{todo_list_id}" type="text" class="form-control todo-list-input" placeholder="Tarea">' +
                '<button onclick="addTodoListTask(\'{todo_list_id}\');" class="add btn btn-primary font-weight-bold todo-list-add-btn">Agregar</button>' +
            '</div>' +
            '<div class="list-wrapper">' +
                '<ul class="d-flex flex-column-reverse todo-list"></ul>' +
            '</div>' +
        '</div>' +
    '</div>' +
'</div>';

const TODO_LIST_TASK_HTML = 
'<li class="{todo_list_task_completed}">' +
    '<div class="form-check">' +
        '<div class="form-check-label">' +
            '<input onclick="toggleTaskChecked(\'{todo_list_id}\', \'{todo_list_task_index}\', {todo_list_task_is_checked})" class="checkbox" type="checkbox" {todo_list_task_checked}>' +
            '<p onclick="editTask(\'{todo_list_id}\', \'{todo_list_task_index}\', \'{todo_list_task}\')">{todo_list_task} <i class="fa fa-pencil"></i></p>' +
        '</div>' +
    '</div>' +
'</li>';
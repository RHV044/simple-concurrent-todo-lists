const TodoListRepository = require('../repositories/todo-list-repository')

const express = require('express');
const router = express.Router()
const todoListRepository = new TodoListRepository(['hello'])

router.get('/', (req, res) => {
    return res.json(todoListRepository.list);
})

router.post('/', (req, res) => {
    console.log('body', req.body)
    let element = req.body.element
    todoListRepository.add(element)
    res.send('ok')
})

module.exports = router;
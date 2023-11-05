// To add a command: create the function, and add the constant, then export them at the bottom of this file, and import them in helper class
const ADD_COMMAND = "add"
const add = (msg) => {
    return 'Add command'
}

const TOTAL_COMMAND = "total"
const total = (msg) => {
    return 'Calc for total'
}

const REMOVE_COMMAND = "remove"
const remove = (msg) => {
    return 'Remove Command'
}

const MOW_COMMAND = "mow"
const mow = (msg) => {
    return 'Mow!'
}

module.exports = {add, total, remove, mow, ADD_COMMAND, TOTAL_COMMAND, REMOVE_COMMAND, MOW_COMMAND};
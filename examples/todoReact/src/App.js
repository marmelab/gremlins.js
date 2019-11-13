import React from 'react';
import './App.css';

let id = 0;
const getTodoElement = value => ({
    value,
    done: false,
    id: id++,
});

const App = () => {
    const [inputTodo, setInputTodo] = React.useState('');
    const [todoList, setTodoList] = React.useState([]);
    const onInputChange = event => setInputTodo(event.target.value);
    const handleAddTodo = event => {
        event.preventDefault();
        if (!inputTodo) {
            return;
        }
        const newTodo = getTodoElement(inputTodo);
        setTodoList([...todoList, newTodo]);
        setInputTodo('');
    };
    const handleDeleteTodo = id =>
        setTodoList(todoList.filter(todo => todo.id !== id));
    const handleDone = id =>
        setTodoList(
            todoList.map(todo =>
                todo.id === id ? { ...todo, done: true } : todo
            )
        );
    const handleUndoDone = id =>
        setTodoList(
            todoList.map(todo =>
                todo.id === id ? { ...todo, done: false } : todo
            )
        );
    const handleEditElement = id => event =>
        setTodoList(
            todoList.map(todo =>
                todo.id === id ? { ...todo, value: event.target.value } : todo
            )
        );
    return (
        <div className="App">
            <header className="App-header">
                <div className="todo-container">
                    <h2>Todo list</h2>
                    <form className="new-todo" onSubmit={handleAddTodo}>
                        <input
                            className="new-todo--input"
                            type="text"
                            value={inputTodo}
                            onChange={onInputChange}
                        ></input>
                        <input
                            type="submit"
                            value="Submit"
                            className="new-todo--button"
                        />
                    </form>
                    <div className="todo-list">
                        {todoList
                            .filter(todo => !todo.done)
                            .map(todo => (
                                <div
                                    className="todo-row"
                                    key={`todo-row-${todo.id}`}
                                >
                                    <button
                                        className="todo-button"
                                        onClick={() => handleDone(todo.id)}
                                    >
                                        &#10004;
                                    </button>
                                    <input
                                        className="todo-element"
                                        value={todo.value}
                                        onChange={handleEditElement(todo.id)}
                                    />
                                    <button
                                        className="todo-button delete-button"
                                        onClick={() =>
                                            handleDeleteTodo(todo.id)
                                        }
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
                <div className="todo-container">
                    <h2>Done List</h2>
                    <div className="todo-list">
                        {todoList
                            .filter(todo => !!todo.done)
                            .map(todo => (
                                <div
                                    className="todo-row"
                                    key={`todo-row-${todo.id}`}
                                >
                                    <button
                                        className="todo-button todo-button-done"
                                        onClick={() => handleUndoDone(todo.id)}
                                    >
                                        &#10004;
                                    </button>
                                    <input
                                        className="todo-element"
                                        value={todo.value}
                                        onChange={handleEditElement(todo.id)}
                                    />
                                    <button
                                        className="todo-button delete-button"
                                        onClick={() =>
                                            handleDeleteTodo(todo.id)
                                        }
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            </header>
        </div>
    );
};

export default App;

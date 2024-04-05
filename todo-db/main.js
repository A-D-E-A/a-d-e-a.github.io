const dbVersion = 2;
const dbName = "todo-db";
const storeName = "tasks";
const storeKeyPath = "taskTitle";

const form = document.forms.item(0);
/** @type {HTMLOutputElement} */
const output = document.getElementById("todo-list");

async function displayTasks() {
    const list = await getAll();
    output.innerHTML = ""; // Quick and dirty remove children;
    for (const task of list) {
        const todoElement = new TodoElement();
        todoElement.setAttribute("title", task.taskTitle);
        todoElement.setAttribute("description", task.description);
        if (task.isDone) todoElement.setAttribute("done", "");
        output.appendChild(todoElement);
    }
}

form.onsubmit = (e) => {
    e.preventDefault();
    const taskTitle = form.elements["title"].value;
    const description = form.elements["description"].value;
    const isDone = form.elements["is-done"].checked;
    addTodo({ taskTitle, description, isDone }).then(() => {
        form.elements["reset"].click();
        displayTasks();
    });
    return false;
}

/** @returns {Promise<IDBDatabase>} */
async function openDB() {
    return await new Promise((resolve, reject) => {
        const req = window.indexedDB.open(dbName, dbVersion);
        req.onupgradeneeded = (ev) => {
            const db = ev.target.result;
            
            if ([...db.objectStoreNames].includes(storeName)) {
                db.deleteObjectStore(storeName);
            }
            const store = db.createObjectStore(storeName, {
                keyPath: storeKeyPath
            });

            store.createIndex("description", "description", { unique: false });
            store.createIndex("isDone", "isDone", { unique: false });
        }
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

/** @param {{ taskTitle: string, description: string, isDone: boolean }} todo */
async function addTodo(todo) {
    const transaction = (await openDB()).transaction([storeName], "readwrite");
    return await new Promise(async (resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = reject;

        const store = transaction.objectStore(storeName);
        const req = store.add(todo);
        req.onsuccess = () => resolve();
        req.onerror = () => transaction.abort();
    });
}

async function getKeys() {
    const transaction = (await openDB()).transaction([storeName], "readonly");
    return await new Promise(async (resolve, reject) => {
        transaction.onerror = reject;

        const store = transaction.objectStore(storeName);
        const req = store.getAllKeys();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => transaction.abort();
    });
}

async function getAll() {
    const transaction = (await openDB()).transaction([storeName], "readonly");
    return await new Promise(async (resolve, reject) => {
        transaction.onerror = reject;

        const store = transaction.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => transaction.abort();
    });
}

async function deleteTask(title) {
    const transaction = (await openDB()).transaction([storeName], "readwrite");

    return await new Promise(async (resolve, reject) => {
        transaction.onerror = (event) => { console.error("Transaction error: ", event.target.error); reject() };
        transaction.oncomplete = resolve;

        const store = transaction.objectStore(storeName);
        const req = store.delete(title);
        req.onerror = (event) => { console.error("Req error: ", event.target.error); reject() };
        req.onsuccess = () => resolve();
    });
}

displayTasks();

class TodoElement extends HTMLElement {
    static get observedAttributes() {
        return ["title", "description", "done"];
    }

    #onDelete = async () => {
        const title = this.getAttribute("title");
        await deleteTask(title);
        this.parentElement.removeChild(this);
    }

    constructor() {
        super();        
        const title = this.getAttribute("title");
        const description = this.getAttribute("description");
        const isDone = !!this.hasAttribute("done") ? "Done" : "Todo";
        this.innerHTML = `
            <div style="border: 1px solid black; margin: 1rem; padding: 1rem; border-radius: 2px;">
                <h2 class="title" style="margin-top: 0">${title}</h2>
                <p class="description">${description}</p>
                <span class="state">${isDone}</span>
                <button class="delete-btn">Delete task</button>
            </div>
        `;
    }

    connectedCallback() {

        this.querySelector(".delete-btn").addEventListener("click", this.#onDelete);
    }

    disconnectedCallback() {
        this.querySelector(".delete-btn").removeEventListener("click", this.#onDelete);
        this.#onDelete = undefined;
    }

    attributeChangedCallback(name, _, newValue) {
        if (name === "title") {
            this.querySelector(".title").textContent = newValue;
            return;
        }
        if (name === "description") {
            this.querySelector(".description").textContent = newValue;
            return;
        }
        if (name === "done") {
            this.querySelector(".state").textContent = this.hasAttribute("done") ? "Done" : "Todo";
            return;
        }
    }
}

customElements.define("todo-task", TodoElement);
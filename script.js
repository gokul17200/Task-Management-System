
// DEVTRACK - TASK MANAGEMENT SYSTEM

// GET HTML ELEMENTS

const taskForm = document.getElementById("task-form");
const taskFormSection = document.getElementById("task-form-section");

const addTaskBtn = document.getElementById("add-task-btn");
const closeFormBtn = document.getElementById("close-form");
const cancelFormBtn = document.getElementById("cancel-form");

const taskName = document.getElementById("task-name");
const taskDescription = document.getElementById("task-description");
const taskPriority = document.getElementById("task-priority");
const taskStatus = document.getElementById("task-status");
const taskDate = document.getElementById("task-date");

const searchTask = document.getElementById("search-task");


// INITIAL TASK DATA

const sampleTasks = [
    {
        id: 101,
        name: "Design Dashboard",
        description: "Create the main dashboard interface.",
        priority: "High",
        status: "Completed",
        date: ""
    },
    {
        id: 102,
        name: "Develop Login Page",
        description: "Create the login page layout.",
        priority: "Medium",
        status: "In Progress",
        date: ""
    },
    {
        id: 103,
        name: "Prepare Project Report",
        description: "Prepare the project documentation.",
        priority: "Low",
        status: "To Do",
        date: ""
    }
];


// LOAD TASKS FROM LOCAL STORAGE

let tasks = JSON.parse(localStorage.getItem("devtrackTasks")) || sampleTasks;

let editingTaskId = null;
let activeSection = "dashboard";


// SAVE TASKS

function saveTasks() {
    localStorage.setItem("devtrackTasks", JSON.stringify(tasks));
}


// GENERATE NEXT TASK ID

function generateTaskId() {
    if (tasks.length === 0) {
        return 101;
    }

    return Math.max(...tasks.map(task => task.id)) + 1;
}


// PREVENT HTML INJECTION IN TASK TEXT

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


// NAVIGATION

const navLinks = document.querySelectorAll(".nav-link");

function showSection(sectionId) {

    activeSection = sectionId;

    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.add("hidden");
    });

    taskFormSection.classList.add("hidden");

    document.getElementById(sectionId).classList.remove("hidden");

    navLinks.forEach(link => {
        link.classList.remove("active");

        if (link.dataset.section === sectionId) {
            link.classList.add("active");
        }
    });

    const titles = {
        dashboard: "Dashboard",
        projects: "Projects",
        board: "Kanban Board",
        reports: "Reports"
    };

    document.getElementById("page-title").textContent =
        titles[sectionId] || "Dashboard";

    renderTasks();
}


navLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        showSection(this.dataset.section);

    });

});


// OPEN TASK FORM

function openTaskForm() {

    editingTaskId = null;

    taskForm.reset();

    document.getElementById("form-heading").textContent =
        "Create New Task";

    taskFormSection.classList.remove("hidden");

    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById("page-title").textContent =
        "Create Task";

    taskName.focus();
}


// CLOSE TASK FORM

function closeTaskForm() {

    taskFormSection.classList.add("hidden");

    showSection(activeSection);

}


addTaskBtn.addEventListener("click", openTaskForm);

closeFormBtn.addEventListener("click", closeTaskForm);

cancelFormBtn.addEventListener("click", closeTaskForm);


// CREATE OR UPDATE TASK

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = taskName.value.trim();

    if (name === "") {
        alert("Please enter a task name.");
        return;
    }

    if (editingTaskId !== null) {

        // UPDATE EXISTING TASK

        const task = tasks.find(task => task.id === editingTaskId);

        if (task) {
            task.name = name;
            task.description = taskDescription.value.trim();
            task.priority = taskPriority.value;
            task.status = taskStatus.value;
            task.date = taskDate.value;
        }

    } else {

        // CREATE NEW TASK

        const newTask = {
            id: generateTaskId(),
            name: name,
            description: taskDescription.value.trim(),
            priority: taskPriority.value,
            status: taskStatus.value,
            date: taskDate.value
        };

        tasks.push(newTask);

    }

    saveTasks();

    taskForm.reset();

    editingTaskId = null;

    closeTaskForm();

    renderTasks();

});


// EDIT TASK

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    editingTaskId = id;

    taskName.value = task.name;
    taskDescription.value = task.description;
    taskPriority.value = task.priority;
    taskStatus.value = task.status;
    taskDate.value = task.date || "";

    document.getElementById("form-heading").textContent =
        "Edit Task";

    taskFormSection.classList.remove("hidden");

    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById("page-title").textContent =
        "Edit Task";

    taskName.focus();
}


// DELETE TASK

function deleteTask(id) {

    const confirmed = confirm("Are you sure you want to delete this task?");

    if (!confirmed) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();

}


// CHANGE TASK STATUS

function updateTaskStatus(id, newStatus) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.status = newStatus;

    saveTasks();

    renderTasks();

}


// DISPLAY TASK CARD

function createTaskCard(task) {

    return `
        <div class="task-card">

            <div class="task-id">DEV-${task.id}</div>

            <h4>${escapeHTML(task.name)}</h4>

            <p>${escapeHTML(task.description || "No description")}</p>

            <div class="task-meta">

                <span class="priority ${task.priority}">
                    ${escapeHTML(task.priority)}
                </span>

            </div>

            <p>Due: ${escapeHTML(task.date || "Not set")}</p>

            <select
                class="status-select"
                data-id="${task.id}"
                aria-label="Change status for ${escapeHTML(task.name)}">

                <option value="To Do"
                    ${task.status === "To Do" ? "selected" : ""}>
                    To Do
                </option>

                <option value="In Progress"
                    ${task.status === "In Progress" ? "selected" : ""}>
                    In Progress
                </option>

                <option value="Completed"
                    ${task.status === "Completed" ? "selected" : ""}>
                    Completed
                </option>

            </select>

            <div class="task-actions">

                <button class="edit-btn" data-id="${task.id}">
                    Edit
                </button>

                <button class="delete-btn" data-id="${task.id}">
                    Delete
                </button>

            </div>

        </div>
    `;
}


// RENDER ALL TASKS

function renderTasks() {

    const searchValue = searchTask.value.toLowerCase().trim();

    const filteredTasks = tasks.filter(task => {

        return (
            task.name.toLowerCase().includes(searchValue) ||
            String(task.id).includes(searchValue) ||
            task.description.toLowerCase().includes(searchValue)
        );

    });


    // KANBAN BOARD

    const todoTasks = filteredTasks.filter(
        task => task.status === "To Do"
    );

    const progressTasks = filteredTasks.filter(
        task => task.status === "In Progress"
    );

    const completedTasks = filteredTasks.filter(
        task => task.status === "Completed"
    );


    document.getElementById("todo-list").innerHTML =
        todoTasks.map(createTaskCard).join("") ||
        '<p class="empty-message">No tasks here.</p>';

    document.getElementById("progress-list").innerHTML =
        progressTasks.map(createTaskCard).join("") ||
        '<p class="empty-message">No tasks here.</p>';

    document.getElementById("done-list").innerHTML =
        completedTasks.map(createTaskCard).join("") ||
        '<p class="empty-message">No tasks here.</p>';


    // DASHBOARD COUNTS

    const total = tasks.length;
    const todo = tasks.filter(task => task.status === "To Do").length;
    const progress = tasks.filter(task => task.status === "In Progress").length;
    const completed = tasks.filter(task => task.status === "Completed").length;

    document.getElementById("total-tasks").textContent = total;
    document.getElementById("todo-tasks").textContent = todo;
    document.getElementById("progress-tasks").textContent = progress;
    document.getElementById("completed-tasks").textContent = completed;


    // BOARD COUNTS

    document.getElementById("todo-count").textContent = todoTasks.length;
    document.getElementById("progress-count").textContent = progressTasks.length;
    document.getElementById("done-count").textContent = completedTasks.length;


    // PROJECT PROGRESS

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("progress-percentage").textContent =
        percentage + "%";

    document.getElementById("progress-fill").style.width =
        percentage + "%";


    // REPORTS

    document.getElementById("report-total").textContent = total;
    document.getElementById("report-pending").textContent = todo;
    document.getElementById("report-progress").textContent = progress;
    document.getElementById("report-completed").textContent = completed;


    // RECENT TASKS

    const recentTasks = [...tasks]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    document.getElementById("recent-task-list").innerHTML =
        recentTasks.map(task => `
            <tr>
                <td>DEV-${task.id}</td>
                <td>${escapeHTML(task.name)}</td>
                <td>${escapeHTML(task.priority)}</td>
                <td>${escapeHTML(task.status)}</td>
            </tr>
        `).join("") ||
        '<tr><td colspan="4">No tasks available.</td></tr>';

}


// HANDLE EDIT, DELETE AND STATUS EVENTS

document.addEventListener("click", function(event) {

    const editButton = event.target.closest(".edit-btn");
    const deleteButton = event.target.closest(".delete-btn");

    if (editButton) {
        editTask(Number(editButton.dataset.id));
    }

    if (deleteButton) {
        deleteTask(Number(deleteButton.dataset.id));
    }

});


// HANDLE STATUS CHANGES

document.addEventListener("change", function(event) {

    if (event.target.classList.contains("status-select")) {

        const id = Number(event.target.dataset.id);

        updateTaskStatus(id, event.target.value);

    }

});


// SEARCH TASKS

searchTask.addEventListener("input", function() {

    renderTasks();

});


// INITIALIZE APPLICATION

saveTasks();

renderTasks();

showSection("dashboard");

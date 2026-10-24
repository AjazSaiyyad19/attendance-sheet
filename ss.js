
const TARGET = 75;

let subjects = [];

try {
    const savedData = JSON.parse(
        localStorage.getItem("attendanceSubjects") || "[]"
    );

    if (Array.isArray(savedData)) {
        subjects = savedData.filter(item =>
            item &&
            typeof item.name === "string" &&
            Number.isInteger(item.total) &&
            Number.isInteger(item.attended) &&
            item.total >= 0 &&
            item.attended >= 0 &&
            item.attended <= item.total
        );
    }
} catch (error) {
    subjects = [];
}

const form = document.getElementById("attendanceForm");
const subjectList = document.getElementById("subjectList");
const emptyMessage = document.getElementById("emptyMessage");
const formMessage = document.getElementById("formMessage");

function saveData() {
    localStorage.setItem(
        "attendanceSubjects",
        JSON.stringify(subjects)
    );
}

function getPercentage(subject) {
    if (subject.total === 0) return 0;

    return (subject.attended / subject.total) * 100;
}

function getPrediction(subject) {
    const { total, attended } = subject;
    const percentage = getPercentage(subject);

    if (percentage >= TARGET) {
        const canMiss = Math.floor(
            attended / (TARGET / 100) - total + 1e-9
        );

        return `You can miss at most ${Math.max(0, canMiss)} more ${
            canMiss === 1 ? "class" : "classes"
        } and remain at or above 75%, assuming every other class is attended.`;
    }

    const needed = Math.ceil(
        (TARGET * total - 100 * attended) / (100 - TARGET) - 1e-9
    );

    return `Attend the next ${Math.max(0, needed)} consecutive classes to reach 75%, assuming no further absences.`;
}

function updateDashboard() {
    const totalSubjects = subjects.length;

    const totalClasses = subjects.reduce(
        (sum, subject) => sum + subject.total, 0
    );

    const classesAttended = subjects.reduce(
        (sum, subject) => sum + subject.attended, 0
    );

    const overall = totalClasses === 0
        ? 0
        : (classesAttended / totalClasses) * 100;

    document.getElementById("totalSubjects").textContent =
        totalSubjects;

    document.getElementById("overallAttendance").textContent =
        overall.toFixed(1) + "%";

    document.getElementById("classesAttended").textContent =
        classesAttended;

    document.getElementById("totalClasses").textContent =
        totalClasses;
}

function renderSubjects() {
    subjectList.innerHTML = "";
    emptyMessage.style.display =
        subjects.length === 0 ? "block" : "none";

    subjects.forEach((subject, index) => {
        const percentage = getPercentage(subject);
        const isGood = percentage >= TARGET;

        const card = document.createElement("article");
        card.className = "subject-card";

        const top = document.createElement("div");
        top.className = "subject-top";

        const title = document.createElement("h3");
        title.textContent = subject.name;

        const percentageText = document.createElement("span");
        percentageText.className =
            "percentage " + (isGood ? "good" : "low");

        percentageText.textContent = percentage.toFixed(1) + "%";

        top.append(title, percentageText);

        const progress = document.createElement("div");
        progress.className = "progress";

        const bar = document.createElement("div");
        bar.className =
            "progress-bar " + (isGood ? "" : "low-bar");

        bar.style.width = Math.min(100, percentage) + "%";
        progress.appendChild(bar);

        const details = document.createElement("p");
        details.className = "subject-details";
        details.textContent =
            `Classes attended: ${subject.attended} / ${subject.total}`;

        const prediction = document.createElement("div");
        prediction.className = "prediction";
        prediction.textContent = getPrediction(subject);

        const actions = document.createElement("div");
        actions.className = "subject-actions";

        const attendedBtn = document.createElement("button");
        attendedBtn.className = "action-btn";
        attendedBtn.textContent = "+ Attended";

        attendedBtn.addEventListener("click", () => {
            subject.attended++;
            subject.total++;
            saveData();
            renderAll();
        });

        const missedBtn = document.createElement("button");
        missedBtn.className = "action-btn";
        missedBtn.textContent = "+ Absent";

        missedBtn.addEventListener("click", () => {
            subject.total++;
            saveData();
            renderAll();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", () => {
            subjects.splice(index, 1);
            saveData();
            renderAll();
        });

        actions.append(attendedBtn, missedBtn, deleteBtn);

        card.append(top, progress, details, prediction, actions);
        subjectList.appendChild(card);
    });
}

function renderAll() {
    updateDashboard();
    renderSubjects();
}

form.addEventListener("submit", function(event) {
    event.preventDefault();
    formMessage.textContent = "";

    const name = document.getElementById("subjectName")
        .value.trim();

    const total = Number(
        document.getElementById("totalInput").value
    );

    const attended = Number(
        document.getElementById("attendedInput").value
    );

    if (!name) {
        formMessage.textContent = "Please enter a subject name.";
        return;
    }

    if (
        !Number.isInteger(total) ||
        !Number.isInteger(attended) ||
        total < 0 ||
        attended < 0 ||
        attended > total
    ) {
        formMessage.textContent =
            "Enter valid class counts. Attended classes cannot exceed total classes.";
        return;
    }

    const duplicate = subjects.some(
        subject => subject.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
        formMessage.textContent =
            "This subject already exists. Please use a different name.";
        return;
    }

    subjects.push({ name, total, attended });
    saveData();
    renderAll();

    form.reset();
    document.getElementById("subjectName").focus();
});

document.getElementById("clearAll").addEventListener(
    "click", function() {
        if (subjects.length === 0) return;

        if (confirm("Delete all attendance records?")) {
            subjects = [];
            saveData();
            renderAll();
            formMessage.textContent = "";
        }
    }
);

renderAll();

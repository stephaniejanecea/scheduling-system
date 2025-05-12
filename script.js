// (START) Constants
const MAX_STUDENTS_PER_SECTION = 40;
const rooms = {
    laboratories: ["IITRm3", "IITRm4", "IITRm5", "IITRm6", "IITRm7"],
    nonLaboratories: ["IITRm11", "IITRm12", "IITRm13", "IITRm14", "IITRm15", "IITRm19", "IITRm20", "IITRm21", "AVR"],
    gym: ["Main Gym"],
    researchRoom: ["Research Room"],
    coveredCourt: ["Covered Court"]
};

const timeSlots = [
    "07:30 - 08:30 AM", "08:30 - 09:30 AM",
    "09:30 - 10:30 AM", "10:30 - 11:30 AM",
    "01:00 - 02:00 PM", "02:00 - 03:00 PM",
    "03:00 - 04:00 PM", "04:00 - 05:00 PM"
];

const days = ["M", "T", "W", "Th", "F"];
const sectionNames = ['A', 'B', 'C', 'D']; 

let yearSubjects = {
    "1st Year": {
        major: [
            { code: "CC1", name: "Intro to Computing", professor: "Elyssa" },
            { code: "CC2", name: "Computer Programming 1", professor: "Arian" }
        ],
        minor: [
            { code: "GE3", name: "Contemporary World", professor: "Kristine" },
            { code: "GE2", name: "Readings in Philippine History", professor: "Jaylon" },
            { code: "GEE1", name: "Peace Studies", professor: "Sophia" },
            { code: "GE1", name: "Understanding the Self", professor: "Clint" }
        ],
        pe: [
            { code: "PATH-FIT1", name: "Physical Education", professor: "Lio" }
        ]
    },
    "2nd Year": {
        major: [
            { code: "CC4", name: "Data Structures and Algorithms", professor: "Alex" },
            { code: "PF1", name: "Object-Oriented Programming", professor: "Vince" },
            { code: "PT1", name: "Platform Technologies", professor: "Stephanie" },
            { code: "IPT1", name: "Integrative Programming and Technologies 1", professor: "Ashley" }
        ],
        minor: [
            { code: "GE6", name: "Art Appreciation", professor: "Mico" },
            { code: "GEE3", name: "Living in the IT Era", professor: "Arian" },
            { code: "ITP1", name: "Open Source", professor: "Jaylon" },
        ],
        pe: [
            { code: "PATHFIT3", name: "Physical Education", professor: "Lio" }
        ]
    },
    "3rd Year": {
        major: [
            { code: "NET2", name: "Networking 2", professor: "Alex" },
            { code: "IM1", name: "Advanced Database Systems", professor: "Elyssa" },
            { code: "IAS1", name: "Information Assurance and Security 1", professor: "Vince" },
            { code: "WS1", name: "Web Systems and Technologies", professor: "Clint" }
        ],
        minor: [
            { code: "GE9", name: "Life and Works of Rizal", professor: "Stephanie" },
            { code: "ITP2", name: "Digital Illustration", professor: "Kristine" },
            { code: "ITP3", name: "Service Management", professor: "Mico" }
        ],
        pe: []
    },
    "4th Year": {
        major: [],
        minor: [],
        capstone: [
            { code: "CAP2", name: "Capstone Project and Research 2", professor: "Sophia" },
            { code: "SA1", name: "Systems Administration and Maintenance", professor: "Stephanie" },
            { code: "ST1", name: "Seminars and Tours", professor: "Ashley" }
        ],
        pe: []
    }
};

let fullSchedule = {};
let studentRecords = JSON.parse(localStorage.getItem('studentRecords')) || {};
let sectionCounts = JSON.parse(localStorage.getItem('sectionCounts')) || {};

// DOM Elements
const nav = document.querySelector("nav");
const lobby = document.getElementById("lobby");
const addPage = document.getElementById("addPage");
const assessmentPage = document.getElementById("assessmentPage");
const viewAllSched = document.getElementById("viewAllSched");
const scheduleOutput = document.getElementById("schedule-output");
const yearLevelSelect = document.getElementById("year-level");
const nameInput = document.getElementById("nameInput");
const idNumInput = document.getElementById("idNumInput");
const yearLvlInput = document.getElementById("yearLvlInput");
const nameError = document.getElementById("nameError");
const idNumError = document.getElementById("idNumError");
const yearLvlError = document.getElementById("yearLvlError");
const displayName = document.getElementById("displayName");
const displayIdNum = document.getElementById("displayIdNum");
const displayYearLvl = document.getElementById("displayYearLvl");
const displaySection = document.getElementById("displaySection");
const assignedSched = document.getElementById("assignedSched");
const logoutBtn = 
document.getElementById("logout");

// UI Navigation Events
document.getElementById("addStudent").addEventListener("click", () => {
    nav.style.display = "block";
    addPage.style.display = "block";
    assessmentPage.style.display = "none";
    viewAllSched.style.display = "none";
    lobby.style.display = "none";
    clearInputErrors();
});

document.getElementById("viewSchedule").addEventListener("click", () => {
    nav.style.display = "none";
    addPage.style.display = "none";
    assessmentPage.style.display = "none";
    lobby.style.display = "none";
    viewAllSched.style.display = "block";
    if (Object.keys(fullSchedule).length === 0) {
        generateAllSchedules();
    }
    displaySchedule(yearLevelSelect.value);
});

document.getElementById("back").addEventListener("click", backToLobby);
document.getElementById("logout").addEventListener("click", backToLobby);

function backToLobby() {
    nav.style.display = "none";
    addPage.style.display = "none";
    assessmentPage.style.display = "none";
    viewAllSched.style.display = "none";
    lobby.style.display = "flex";
    clearInputs();
    clearInputErrors();
    logoutBtn.style.display = "none"; 
    logoutBtn.addEventListener("click", backToLobby);
}

// Input Validation
function validateInputs() {
    let isValid = true;
    
    if (!nameInput.value.trim()) {
        nameError.textContent = "Name is required";
        isValid = false;
    } else {
        nameError.textContent = "";
    }
    
    if (!idNumInput.value) {
        idNumError.textContent = "Student number is required";
        isValid = false;
    } else if (idNumInput.value.length < 8) {
        idNumError.textContent = "Student number must be 8 digits";
        isValid = false;
    } else {
        idNumError.textContent = "";
    }
    
    if (!yearLvlInput.value) {
        yearLvlError.textContent = "Year level is required";
        isValid = false;
    } else if (yearLvlInput.value < 1 || yearLvlInput.value > 4) {
        yearLvlError.textContent = "Year level must be between 1 and 4";
        isValid = false;
    } else {
        yearLvlError.textContent = "";
    }
    
    return isValid;
}

function clearInputErrors() {
    nameError.textContent = "";
    idNumError.textContent = "";
    yearLvlError.textContent = "";
}

function clearInputs() {
    nameInput.value = "";
    idNumInput.value = "";
    yearLvlInput.value = "";
}

document.getElementById("generateSchedule").addEventListener("click", () => {
    if (!validateInputs()) return;

    const studentId = idNumInput.value;
    const yearLevel = getYearLevelText(yearLvlInput.value);

    if (studentRecords[studentId]) {
        showStudentSchedule(studentId);
    } else {
        assignNewStudent(nameInput.value.trim(), studentId, yearLevel);
        alert("Schedule successfully generated!");
    }
});

function getYearLevelText(year) {
    switch(year) {
        case "1": return "1st Year";
        case "2": return "2nd Year";
        case "3": return "3rd Year";
        case "4": return "4th Year";
        default: return "1st Year";
    }
}

// Assignment Logic
function assignNewStudent(name, id, yearLevel) {
    if (!sectionCounts[yearLevel]) {
        sectionCounts[yearLevel] = {};
        sectionNames.forEach(letter => {
            sectionCounts[yearLevel][letter] = 0;
        });
    }

    let assignedSection = null;
    for (const letter of sectionNames) {
        if (sectionCounts[yearLevel][letter] < MAX_STUDENTS_PER_SECTION) {
            assignedSection = letter;
            sectionCounts[yearLevel][letter]++;
            break;
        }
    }

    if (!assignedSection) {
        alert("All sections for this year level are full. Please contact administrator.");
        return;
    }

    const sectionFullName = `${yearLevel} - Section ${assignedSection}`;
    studentRecords[id] = {
        name: name,
        id: id,
        yearLevel: yearLevel,
        section: assignedSection,
        sectionFullName: sectionFullName
    };

    localStorage.setItem('studentRecords', JSON.stringify(studentRecords));
    localStorage.setItem('sectionCounts', JSON.stringify(sectionCounts));

    if (!fullSchedule[sectionFullName]) {
        generateAllSchedules();
    }

    showStudentSchedule(id);
}

function showStudentSchedule(studentId) {
    const student = studentRecords[studentId];

    displayName.textContent = student.name;
    displayIdNum.textContent = student.id;
    displayYearLvl.textContent = student.yearLevel;
    displaySection.textContent = student.section;

    const sectionSchedule = fullSchedule[student.sectionFullName];
    if (sectionSchedule) {
        assignedSched.innerHTML = "";
        let table = `<table>
                        <tr>
                            <th>Day & Time</th>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Professor</th>
                            <th>Room</th>
                        </tr>`;

        sectionSchedule.sort((a, b) => {
            const dayOrder = days.indexOf(a.time.split(" ")[0]) - days.indexOf(b.time.split(" ")[0]);
            if (dayOrder !== 0) return dayOrder;
            const slotA = a.time.split(" ").slice(1).join(" ");
            const slotB = b.time.split(" ").slice(1).join(" ");
            return timeSlots.indexOf(slotA) - timeSlots.indexOf(slotB);
        });

        sectionSchedule.forEach(entry => {
            table += `<tr>
                        <td>${entry.time}</td>
                        <td>${entry.code}</td>
                        <td>${entry.name}</td>
                        <td>${entry.professor}</td>
                        <td>${entry.room}</td>
                    </tr>`;
        });

        table += "</table>";
        assignedSched.innerHTML = table;
    } else {
        assignedSched.innerHTML = "<p>Schedule not available for this section yet.</p>";
    }

    nav.style.display = "block";
    logoutBtn.style.display = "block"; // SHOW logout only here
    addPage.style.display = "none";
    assessmentPage.style.display = "block";
    viewAllSched.style.display = "none";
    lobby.style.display = "none";
}
function generateAllSchedules() {
    fullSchedule = {};

    Object.entries(yearSubjects).forEach(([year, subjects]) => {
        for (let sec = 0; sec < sectionNames.length; sec++) {
            const sectionName = `${year} - Section ${sectionNames[sec]}`;
            fullSchedule[sectionName] = [];

            subjects.major.forEach(subject => {
                assignSubjectToSection(sectionName, subject, "laboratories", subject.professor, 3);
                assignSubjectToSection(sectionName, subject, "nonLaboratories", subject.professor, 2);
            });

            subjects.minor.forEach(subject => {
                assignSubjectToSection(sectionName, subject, "nonLaboratories", subject.professor, 3);
            });

            if (subjects.pe && subjects.pe.length > 0) {
                subjects.pe.forEach(subject => {
                    assignSubjectToSection(sectionName, subject, "gym", subject.professor, 2);
                });
            }

            if (subjects.capstone && subjects.capstone.length > 0) {
                subjects.capstone.forEach(subject => {
                    assignSubjectToSection(sectionName, subject, "researchRoom", subject.professor, 3);
                });
            }
        }
    });
}

function assignSubjectToSection(section, subject, roomType, professor, hours) {
    let assignedHours = 0;
    let attempts = 100;

    while (assignedHours < hours && attempts > 0) {
        attempts--;

        const randomDay = days[Math.floor(Math.random() * days.length)];
        const randomSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const roomList = rooms[roomType];
        const randomRoom = roomList[Math.floor(Math.random() * roomList.length)];
        const key = `${randomDay} ${randomSlot}`;

        if (!fullSchedule[section].some(entry => entry.time === key)) {
            fullSchedule[section].push({
                time: key,
                code: subject.code,
                name: subject.name,
                professor: professor,
                room: randomRoom
            });
            assignedHours++;
        }
    }
}

function displaySchedule(year = "all") {
    scheduleOutput.innerHTML = "";

    if (Object.keys(fullSchedule).length === 0) {
        scheduleOutput.innerHTML = "<p>No schedule generated yet. Click 'Generate All Schedules' to create one.</p>";
        return;
    }

    const scheduleToDisplay = year === "all" ? fullSchedule : filterScheduleByYear(year);

    Object.entries(scheduleToDisplay).forEach(([section, classes]) => {
        classes.sort((a, b) => {
            const dayOrder = days.indexOf(a.time.split(" ")[0]) - days.indexOf(b.time.split(" ")[0]);
            if (dayOrder !== 0) return dayOrder;
            const slotA = a.time.split(" ").slice(1).join(" ");
            const slotB = b.time.split(" ").slice(1).join(" ");
            return timeSlots.indexOf(slotA) - timeSlots.indexOf(slotB);
        });

        let table = `<h3>${section}</h3><table>
                        <tr>
                            <th>Day & Time</th>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Professor</th>
                            <th>Room</th>
                        </tr>`;

        classes.forEach(entry => {
            table += `<tr>
                        <td>${entry.time}</td>
                        <td>${entry.code}</td>
                        <td>${entry.name}</td>
                        <td>${entry.professor}</td>
                        <td>${entry.room}</td>
                    </tr>`;
        });

        table += "</table>";
        scheduleOutput.innerHTML += table;
    });
}

function filterScheduleByYear(year) {
    const filtered = {};
    Object.entries(fullSchedule).forEach(([section, classes]) => {
        if (section.startsWith(year)) {
            filtered[section] = classes;
        }
    });
    return filtered;
}

// Event Listeners for Admin Page
document.getElementById("generate-btn").addEventListener("click", () => {
    generateAllSchedules();
    displaySchedule(yearLevelSelect.value);
});

document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all schedules? This will clear all generated schedules but keep student records.")) {
        fullSchedule = {};
        displaySchedule("all");
    }
});

yearLevelSelect.addEventListener("change", (e) => { 
    if (Object.keys(fullSchedule).length > 0) {
        displaySchedule(e.target.value);
    }
});

if (Object.keys(fullSchedule).length === 0) {
    generateAllSchedules();
}

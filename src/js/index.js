'use strict'

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId = undefined;

const addHabbitPanel = document.querySelector('.add-habbit');



// Page elements
const page = {
    menu: document.querySelector('.panel__nav-list'),
    header: {
        title: document.querySelector('.content__title'),
        deleteHabbitButton: document.querySelector('.content__delete-habbit-button'),
        progressBar: {
            progressBarWrapper: document.querySelector('.progress-bar'),
            progressCounter: document.querySelector('.progress-bar__counter'),
            progressDone: document.querySelector('.progress-bar__done')
        }
    },
    main: {
        habbitsContainer: document.getElementById('days'),
        nextDay: document.querySelector('.habbit__day')
    },
}

// Utils
function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);
    if (Array.isArray(habbitArray)) {
        habbits = habbitArray;
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function resetForm(form, fields) {
    for(const field of fields) {
        form[field].value = '';
   }
}

function validateForm(form, fields) {
    const formData = new FormData(form);
    const res = {};
    for(const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('input--error');
        if(!fieldValue) {
            form[field].classList.add('input--error');
            return;
        };
        res[field] = fieldValue;
   }
   let isValid = true;
   for(const field of fields) {
        if(!res[field]) isValid = false;
   }
   if(!isValid) return;
   return res;
}

// Render functions
function rerenderMenu(activeHabbit) {
    page.menu.innerHTML = '';
    for (const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if (!existed) {
            const element = document.createElement('button');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.classList.add('habbit-button', 'panel__habbit-button');
            element.addEventListener('click', () => rerender(habbit.id));
            element.innerHTML = 
                `<span class="visually-hidden">Habbit</span>
                <svg class="icon icon--${habbit.icon}">
                    <use href="./img/svgsprite/sprite.symbol.svg#${habbit.icon}"></use>
                </svg>`;
            if (activeHabbit.id === habbit.id) {
                element.classList.add('habbit-button--active');
            }
            page.menu.appendChild(element);
            continue;
        }
        if (activeHabbit.id === habbit.id) {
            existed.classList.add('habbit-button--active');
        } else {
            existed.classList.remove('habbit-button--active');
        }
    }
}

function renderHead(activeHabbit) {
    page.header.title.innerText = activeHabbit.name;
    const progress = activeHabbit.days.length / activeHabbit.target > 1 
    ? 100
    : activeHabbit.days.length / activeHabbit.target * 100;
    page.header.progressBar.progressCounter.innerText = progress.toFixed(0) + '%';
    page.header.progressBar.progressDone.style.width = progress.toFixed(0) + '%';
}

function renderBody(activeHabbit) {
    page.main.habbitsContainer.innerHTML = '';
    for(const index in activeHabbit.days){
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = 
        `<div class="habbit__day">День ${Number(index) + 1}</div>
        <h2 class="habbit__title">${activeHabbit.days[index].comment}</h2>
        <button class="habbit__delete-button delete-button" onclick="deleteDay(${index})">
            <span class="visually-hidden">Delete day ${index}</span>
            <svg class="icon icon--delete">
                <use href="./img/svgsprite/sprite.symbol.svg#delete"></use>
            </svg>
        </button>`;
        page.main.habbitsContainer.appendChild(element);
    }
    page.main.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}


function rerender(activeHabbitId) {
    globalActiveHabbitId = activeHabbitId;
    if(!activeHabbitId) {
        page.header.title.innerText = 'У вас нет привычек!';
        page.header.deleteHabbitButton.classList.add('none');
        page.header.progressBar.progressBarWrapper.classList.add('none');
        page.menu.classList.add('none');
        addHabbitPanel.classList.add('none');
        rerenderMenu();
        return;
    };
    document.location.replace(document.location.pathname + '#' + activeHabbitId)
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
    rerenderMenu(activeHabbit);
    renderHead(activeHabbit);
    renderBody(activeHabbit);

    if(habbits.length > 0) {
        page.menu.classList.remove('none');
        page.header.deleteHabbitButton.classList.remove('none');
        page.header.progressBar.progressBarWrapper.classList.remove('none');
        addHabbitPanel.classList.remove('none');
    } 

}

//work with days
function addDays(event) {
    event.preventDefault();
    const data = validateForm(event.target, ['comment']);
    if(!data) return;

    habbits = habbits.map(habbit => {
        if(habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{comment: data.comment}])
            }
        }
        return habbit;
    });
    resetForm(event.target, ['comment']);
    rerender(globalActiveHabbitId);
    saveData();
    
}

function deleteDay(index) {
    habbits = habbits.map(habbit => {
        if(habbit.id === globalActiveHabbitId) {
            habbit.days.splice(index, 1);
            return {
                ...habbit,
                days: habbit.days
            }
        }
        return habbit;
    });
    rerender(globalActiveHabbitId);
    saveData();
}

const addCommentform = document.querySelector('.add-habbit__form');
addCommentform.addEventListener('submit', addDays);

//Work with popup
function togglePopup() {
    const popup = document.querySelector('.cover');
    popup.classList.toggle('none');
}

function setIcon(context, icon) {
    const iconField = document.querySelector('.popup__form input[name="icon"]');
    iconField.value = icon;
    const activeIcon = document.querySelector('.popup__habbit-button.habbit-button--active');
    activeIcon.classList.remove('habbit-button--active');
    context.classList.add('habbit-button--active');
}

function addHabbit(event) {
   event.preventDefault();
   const data = validateForm(event.target, ['name', 'icon', 'target']);
   if(!data) return;
   const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0)
   habbits.push({
        id: maxId + 1,
        icon: data.icon,
        name: data.name,
        target: data.target,
        days: []
   });
   resetForm(event.target, ['name', 'target']);
   togglePopup();
   rerender(maxId + 1);
   saveData();
}

const addHabbitform = document.querySelector('.popup__form');
addHabbitform.addEventListener('submit', addHabbit);

function deleteHabbit() {
    const index = habbits.findIndex(habbit => habbit.id === globalActiveHabbitId);
    if (index !== -1) {
        habbits.splice(index, 1);
        saveData();
        if (habbits.length > 0) {
            rerender(globalActiveHabbitId - 1);
        } else {
            rerender();
        }
    }
}

// Init
(() => {
    loadData();
    window.habbits = habbits;
    window.page = page;
    window.deleteDay = deleteDay;
    window.togglePopup = togglePopup;
    window.setIcon = setIcon;
    window.deleteHabbit = deleteHabbit;

    if (habbits.length > 0) {
        const hashId = Number(document.location.hash.replace('#', ''));
        const urlHabbit = habbits.find(habbit => habbit.id === hashId);
        if(urlHabbit) rerender(urlHabbit.id);
        else rerender(habbits[0].id);
    } 

    if(habbits.length === 0) {
        page.header.deleteHabbitButton.classList.add('none');
        page.header.progressBar.progressBarWrapper.classList.add('none');
        page.menu.classList.add('none');
        addHabbitPanel.classList.add('none');
    }
})();


class Task {
  constructor(
    periodIndex, 
    periodLabel, 
    turnIndex, 
    turnLabel, 
    roleIndex, 
    roleLabel,
  ) {
    this.periodLabel = periodLabel;
    this.turnLabel = turnLabel;
    this.roleLabel = roleLabel;

    this.periodIndex = periodIndex;
    this.turnIndex = turnIndex;
    this.roleIndex = roleIndex;
  }
}

function getTurnsElement() {
  return document.getElementById("turns");
}

function getRolesElement() {
  return document.getElementById("roles");
}

function getPeriodWithoutRolesElement() {
  return document.getElementById("period-without-roles");
}

function getSuggestedPeriodWithoutRolesElement() {
  return document.getElementById("suggested-period-without-roles");
}

function defineSuggestedPeriodWithoutRoles() {
  getSuggestedPeriodWithoutRolesElement().innerHTML = "Auto";
  getSuggestedPeriodWithoutRolesElement().title = guessBestPeriodWithoutRoles();
}

function definePeriodWithoutRolesElement() {
  getPeriodWithoutRolesElement().value = guessBestPeriodWithoutRoles();

  generate();
}

function getDefinedTurns() {
  const content = getTurnsElement().value.trim();

  if ('' === content) {
    return [];
  }
  
  return content.split('\n');  
}

function getTurns() {
  return getDefinedTurns();
}

function getDefinedRoles() {
  const content = getRolesElement().value.trim();

  if ('' === content) {
    return [];
  }
  
  return content.split('\n');
}

function getRoles() {
  const rolesDefined = getDefinedRoles();

  if (0 === rolesDefined.length) {
    return [];
  }

  const periodWithoutRoles = getPeriodWithoutRolesElement().value.trim();

  let rolesWithFakes = [];
  for (let iRole = 0; iRole < rolesDefined.length; iRole++) {
    rolesWithFakes.push(rolesDefined[iRole]);

    if (iRole + 1 < rolesDefined.length) {
      let iFake = 0;
      while (iFake < periodWithoutRoles) {
        rolesWithFakes.push('');
        iFake++;
      }
    }
  }

  return rolesWithFakes;
}

function guessBestPeriodWithoutRoles() {
  const turns = getDefinedTurns();
  const roles = getDefinedRoles();

  const maxTurns = turns.length;
  const maxRoles = roles.length;

  return Math.max(0, Math.round(maxTurns / maxRoles) - 1);
}

function saveValues() {
  localStorage.setItem("turns", getTurnsElement().value);
  localStorage.setItem("roles", getRolesElement().value);
  localStorage.setItem("period-without-roles", getPeriodWithoutRolesElement().value);
}

function loadValues() {
  getTurnsElement().value = localStorage.getItem("turns");
  getRolesElement().value = localStorage.getItem("roles");
  getPeriodWithoutRolesElement().value = localStorage.getItem("period-without-roles");
}

function loadForm() {
  loadValues();

  defineSuggestedPeriodWithoutRoles();

  generate();
}

function updateForm() {
  saveValues();

  defineSuggestedPeriodWithoutRoles();

  generate();
}

function resetForm() {
  if (! confirm("Tu es sûr·e de vouloir tout effacer ?")) {
    return;
  }
  getTurnsElement().value = '';
  getRolesElement().value = '';
  getPeriodWithoutRolesElement().value = '';

  updateForm();
  
  document.getElementById('listing-by-period').classList.add('is-hidden');
  document.getElementById('listing-content-by-period').innerHTML = '';
  
  document.getElementById('listing-by-role').classList.add('is-hidden');
  document.getElementById('listing-content-by-role').innerHTML = '';

  document.getElementById('listing-by-turn').classList.add('is-hidden');
  document.getElementById('listing-content-by-turn').innerHTML = '';
}

function getTasks() {
  const turns = getTurns();
  const roles = getRoles();

  const maxTurn = turns.length;
  const maxRole = roles.length;

  if (0 === maxTurn || 0 === maxRole) {
    return [];
  }

  const tasks = [];
  for (let iTurn = 0; iTurn < maxTurn; iTurn++) {
    for (let iRole = 0; iRole < maxRole; iRole++) {
      const turn = turns[iTurn];
      const role = roles[iRole];

      let iPeriod = (iTurn + iRole) % maxTurn;

      tasks.push(
        new Task(
          iPeriod,
          iPeriod + 1,
          iTurn,
          turn, 
          iRole,
          role,
        )
      );
    }
  }

  for (let iPeriod = 0; iPeriod < maxTurn; iPeriod++) {
    for (let iTurn = 0; iTurn < maxTurn; iTurn++) {
      const exists = tasks.some(task => 
        task.periodIndex === iPeriod
        && task.turnIndex === iTurn
      );

      if (exists) {
        continue;
      }
      
      const turn = turns[iTurn];
      const role = roles[maxRole];

      tasks.push(
        new Task(
          iPeriod,
          iPeriod + 1,
          iTurn,
          turn, 
          maxRole,
          role,
        )
      );
    }
  }

  return tasks;
}

function createTableElement(labelOne, labelTwo) {
  let table = document.createElement("table");
  table.classList.add('table');
  table.classList.add('is-striped');
  table.classList.add('is-hoverable');
  table.classList.add('is-fullwidth');
  table.classList.add('is-narrow');
  let thead = document.createElement("thead");
  let trHead = document.createElement("tr");
  let thRole = document.createElement("th");
  thRole.innerHTML = labelOne;
  trHead.appendChild(thRole);
  let thPeriod = document.createElement("th");
  thPeriod.innerHTML = labelTwo;
  trHead.appendChild(thPeriod);
  thead.appendChild(trHead);
  table.appendChild(thead);

  let tbody = document.createElement("tbody");
  table.appendChild(tbody);

  return table;
}

function createRow(table, cellOne, cellTwo) {
  let tr = document.createElement("tr");
  let tdRole = document.createElement("td");
  tdRole.textContent = cellOne;
  tr.appendChild(tdRole);
  let tdPeriod = document.createElement("td");
  tdPeriod.textContent = cellTwo;
  tr.appendChild(tdPeriod);

  const tbody = table.querySelector("tbody");
  tbody.appendChild(tr);
}

function generateTable(tasks, targetId, itemKey, rowOneItem, rowTwoItem, colOneTitle, colTwoTitle, groupTitle) {
  let lastItem = null;

  const target = document.getElementById(targetId);
  target.innerHTML = "";

  let table = createTableElement(colOneTitle, colTwoTitle);
  lastItem = null;
  tasks.forEach(function (task) {
    const item = task[itemKey];
    if ('' == item) {
      return;
    }

    if (lastItem != item) {
      if (null != lastItem) {
        target.appendChild(table);

        table = createTableElement(colOneTitle, colTwoTitle);
      }

      let h2 = document.createElement("h2");
      h2.classList.add('title');
      h2.classList.add('is-2');
      h2.textContent = groupTitle + item;

      target.appendChild(h2);

      lastItem = item;
    }

    createRow(table, task[rowOneItem], task[rowTwoItem]);
  });

  target.appendChild(table);
}

function exportListing(event) {
  event.preventDefault;

  let target = event.target;

  if (! target.classList.contains('export-listing')) {
    target = target.closest('[data-type]');
  }

  const type = target.attributes.getNamedItem('data-type').value;

  let header = [];
  switch (type) {
    case 'period':
      header = [
        "Semaine", 
        "Élève", 
        "Métier",
      ];

      break;

    case 'role':
      header = [
        "Métier",
        "Élève", 
        "Semaine", 
      ];

      break;

    case 'turn':
      header = [
        "Élève", 
        "Métier",
        "Semaine", 
      ];

      break;
  }  

  const tasks = getTasks();

  const rows = tasks.map(task => {
    switch (type) {
      case 'period':
        return [
          task.periodLabel,
          task.turnLabel,
          task.roleLabel,
        ];    
      case 'role':
        return [
          task.turnLabel,
          task.roleLabel, 
          task.periodLabel,
        ];
      case 'turn':
        return [
          task.roleLabel,
          task.turnLabel,
          task.periodLabel,
        ];
    }  
  });

  const csvContent = [
    header.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = 'a-tour-de-role.csv';
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generate() {
  const tasks = getTasks();

  if (0 === tasks.length) {
    return;
  }

  const tasksByPeriods = [...tasks].sort((a, b) => {
    if (a.periodIndex !== b.periodIndex) {
      return a.periodIndex - b.periodIndex;
    }
    
    if (a.turnIndex !== b.turnIndex) {
      return a.turnIndex - b.turnIndex;
    }      

    return a.roleIndex - b.roleIndex;
  });
  generateTable(
    tasksByPeriods,
    'listing-content-by-period',
    'periodLabel',
    'turnLabel',
    'roleLabel',
    'Tour',
    'Métier ',
    'Semaine ',
  );

  const tasksByRoles = [...tasks].sort((a, b) => {
    if (a.roleIndex !== b.roleIndex) {
      return a.roleIndex - b.roleIndex;      
    }
    
    if (a.periodIndex !== b.periodIndex) {
      return a.periodIndex - b.periodIndex;
    }        

    return a.turnIndex - b.turnIndex;
  });
  generateTable(
    tasksByRoles,
    'listing-content-by-role',
    'roleLabel',
    'turnLabel',
    'periodLabel',
    'Tour',
    'Semaine',
    '',
  );

  const tasksByTurns = [...tasks].sort((a, b) => {
    if (a.turnIndex !== b.turnIndex) {
      return a.turnIndex - b.turnIndex;
    }
    
    if (a.periodIndex !== b.periodIndex) {
      return a.periodIndex - b.periodIndex;      
    }    

    return a.roleIndex - b.roleIndex;
  });
  generateTable(
    tasksByTurns,
    'listing-content-by-turn',
    'turnLabel',
    'roleLabel',
    'periodLabel',
    'Métier',
    'Semaine',
    '',
  );

  document.querySelector('[data-tab="listing-by-period"]').dispatchEvent(new Event("click"));
}

window.addEventListener("DOMContentLoaded", function () {
  loadForm();

  document.getElementById('reset').addEventListener('click', resetForm);
  getSuggestedPeriodWithoutRolesElement().addEventListener("click", definePeriodWithoutRolesElement);
  
  getPeriodWithoutRolesElement().addEventListener('change', updateForm);
  
  getTurnsElement().addEventListener('input', updateForm);
  getRolesElement().addEventListener('input', updateForm);
  
  getTurnsElement().addEventListener('change', updateForm);
  getRolesElement().addEventListener('change', updateForm);

  document.querySelectorAll('.export-listing').forEach(element => {
    element.addEventListener('click', exportListing);
  });
});

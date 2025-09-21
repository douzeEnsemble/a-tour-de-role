function loadDefaultValues() {
  Promise.all([
    fetch("txt/turns.txt").then(r => r.text()),
    fetch("txt/roles.txt").then(r => r.text())
  ])
  .then(([turnsData, rolesData]) => {
    document.getElementById("turns").value = turnsData;
    document.getElementById("roles").value = rolesData;

    document.getElementById("period-without-roles").value = guessBestPeriodWithoutRoles();
  })
  .catch(error => console.error("Erreur:", error));
}
window.addEventListener("DOMContentLoaded", loadDefaultValues);

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

function getDefinedTurns() {
  const content = document.getElementById("turns").value.trim();
  
  return content.split('\n');  
}

function getTurns() {
  return getDefinedTurns();
}

function getDefinedRoles() {
  const rolesContent = document.getElementById("roles").value.trim();
  
  return rolesContent.split('\n');
}

function getRoles() {
  const rolesDefined = getDefinedRoles();

  const periodWithoutRoles = document.getElementById("period-without-roles").value.trim();

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

  return Math.round(maxTurns / maxRoles) - 1;
}

function getTasks() {
  const turns = getTurns();
  const roles = getRoles();

  const maxTurn = turns.length;
  const maxRole = roles.length;

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

function generate(event) {
  event.preventDefault();

  const tasks = getTasks();

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
    'Rôle',
    'Période',
    'Les tours de ',
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
    'Période',
    'Rôle ',
  );

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
    'Rôle ',
    'Période ',
  );
}

window.addEventListener("DOMContentLoaded", function () {
  document.getElementById('generate').addEventListener('click', generate);
});

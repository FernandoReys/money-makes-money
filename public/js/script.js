const API = "/api/transactions";

async function fetchTransactions() {
  const response = await fetch(API);
  return response.json();
}

async function addTransaction() {
  const type = document.getElementById("type").value;
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value;

  if (!description || !amount || !date) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, description, amount, date })
  });

  
  document.getElementById("description").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("date").value = "";

  loadData();
}

async function deleteTransaction(id) {
  await fetch(API + "/" + id, { method: "DELETE" });
  loadData();
}


function animateValue(element, start, end, duration) {
  let startTimestamp = null;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;

    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = progress * (end - start) + start;

    element.innerText = "R$ " + value.toFixed(2);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

async function loadData() {
  const data = await fetchTransactions();

  const table = document.getElementById("transactionsTable");
  const incomeElement = document.getElementById("totalIncome");
  const expenseElement = document.getElementById("totalExpense");
  const profitElement = document.getElementById("totalProfit");

  if (!table) return;

  let income = 0;
  let expense = 0;

  table.innerHTML = `
    <tr>
      <th>Tipo</th>
      <th>Descrição</th>
      <th>Valor</th>
      <th>Data</th>
      <th>Ação</th>
    </tr>
  `;

  data.forEach(t => {
    const value = parseFloat(t.amount);

    if (t.type === "income") {
      income += value;
    } else {
      expense += value;
    }

    table.innerHTML += `
      <tr>
        <td>${t.type === "income" ? "Ganho" : "Gasto"}</td>
        <td>${t.description}</td>
        <td>R$ ${value.toFixed(2)}</td>
        <td>${t.date}</td>
        <td>
          <button class="danger" onclick="deleteTransaction(${t.id})">
            X
          </button>
        </td>
      </tr>
    `;
  });

  const profit = income - expense;

  // Atualiza ganhos e gastos

  incomeElement.innerText = "R$ " + income.toFixed(2);
  expenseElement.innerText = "R$ " + expense.toFixed(2);

  // Animação suave no lucro

  const currentProfit = parseFloat(
    profitElement.innerText.replace("R$", "").replace(",", "") || 0
  );

  animateValue(profitElement, currentProfit, profit, 600);

  // Cor dinâmica

  if (profit >= 0) {
    profitElement.style.color = "#22c55e";
  } else {
    profitElement.style.color = "#ef4444";
  }
}

loadData();
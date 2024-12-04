// Select table body
const dataBody = document.getElementById("data-body");

// Render application data dynamically
const renderData = (applications) => {
  dataBody.innerHTML = ""; // Clear previous data

  applications.forEach((app) => {
    const row = document.createElement("tr");

    // Create cells for each piece of data
    const idCell = document.createElement("td");
    idCell.textContent = app.id;

    const valuationCell = document.createElement("td");
    valuationCell.textContent = app.Details.isValuationFeePaid
      ? "Passed"
      : "Failed";
    valuationCell.classList.add(
      app.Details.isValuationFeePaid ? "passed" : "failed"
    );

    const ukResidentCell = document.createElement("td");
    ukResidentCell.textContent = app.Details.isUkResident ? "Passed" : "Failed";
    ukResidentCell.classList.add(
      app.Details.isUkResident ? "passed" : "failed"
    );

    const riskCell = document.createElement("td");
    riskCell.textContent =
      app.Details.riskRating === "Medium" ? "Passed" : "Failed";
    riskCell.classList.add(
      app.Details.riskRating === "Medium" ? "passed" : "failed"
    );

    const ltvCell = document.createElement("td");
    const ltv = parseInt(app.Details.ltv, 10);
    ltvCell.textContent = ltv < 60 ? "Passed" : "Failed";
    ltvCell.classList.add(ltv < 60 ? "passed" : "failed");

    const statusCell = document.createElement("td");
    statusCell.textContent = app.status;
    statusCell.classList.add(app.status === "Passed" ? "passed" : "failed");

    // Append cells to row
    row.appendChild(idCell);
    row.appendChild(valuationCell);
    row.appendChild(ukResidentCell);
    row.appendChild(riskCell);
    row.appendChild(ltvCell);
    row.appendChild(statusCell);

    // Append row to table body
    dataBody.appendChild(row);
  });
};

// Fetch application data from API
const fetchData = async () => {
  const API_URL =
    "https://srinu-transition-computing-backend-project.vercel.app/checklist";

  try {
    const response = await fetch(API_URL);
    const result = await response.json();

    if (response.ok) {
      renderData(result.results);
    } else {
      console.error("Error fetching data:", result.message);
    }
  } catch (error) {
    console.error("Fetch error:", error.message);
  }
};

// Call fetchData on page load
fetchData();

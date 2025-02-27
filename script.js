function addUser() {
  const inputFields = document.getElementById("inputFields");
  const userWrapper = document.createElement("div");
  userWrapper.className = "userWrapper"; // Wrapper for user input and remove button

  const newUserInput = document.createElement("div");
  newUserInput.className = "userInput";
  newUserInput.innerHTML = `
    <input type="text" placeholder="Name" required>
    <input type="number" placeholder="Pay" step="any" value="0" required>
    <input type="number" placeholder="Receive" step="any" value= "0" required>
  `;

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "removeUser";
  removeButton.textContent = "x";

  // Add event listener to the "Remove" button
  removeButton.addEventListener("click", () => {
    inputFields.removeChild(userWrapper);
  });

  // Append the user input and remove button to the wrapper
  userWrapper.appendChild(newUserInput);
  userWrapper.appendChild(removeButton);

  // Append the wrapper to the inputFields container
  inputFields.appendChild(userWrapper);
}

document.getElementById("paymentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const users = [];
  const inputs = document.querySelectorAll(".userInput");

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const name = input.children[0].value;
    const expected = parseFloat(input.children[1].value);
    const paid = parseFloat(input.children[2].value);
    users.push({ name, expected, paid });
  }
  try {
    const response = await fetch("/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json; cahrset=utf-8" },
      body: JSON.stringify({ users }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    displayResult(result);
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Check the console for details.");
  }
});

function displayResult(result) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  if (result.lack) {
    resultDiv.innerHTML += `<p><strong>Imbalance:</strong> Lack of funds: ${result.lack}</p>`;
  }

  else if (result.overflow) {
    resultDiv.innerHTML += `<p><strong>Imbalance:</strong> Overflow of funds: ${result.overflow}</p>`;
  }
  else if (result.payments.length > 0) {
    for (let i = 0; i < result.payments.length; i++) {
      const payment = result.payments[i];
      resultDiv.innerHTML += `<p>${payment.from} pays ${payment.to}: $${payment.amount}</p>`;
    }
  }
  else {
     resultDiv.innerHTML += `<p>Why do you need to calculate that? </p>`;
  }
}

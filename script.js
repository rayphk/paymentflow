// Get the language of the current document
const language = document.documentElement.lang;

// Check the language and perform actions accordingly
function addUser() {
  const inputFields = document.getElementById("inputFields");
  const userWrapper = document.createElement("div");
  userWrapper.className = "userWrapper"; // Wrapper for user input and remove button

  const newUserInput = document.createElement("div");
  newUserInput.className = "userInput";
  if (language === 'en'){
  newUserInput.innerHTML = `
    <input type="text" placeholder="Name" required>
    <input type="text" placeholder="Pay" step="any">
    <input type="text" placeholder="Receive" step="any">
  `;}
  else if (language === 'zh'){
  newUserInput.innerHTML = `
    <input type="text" placeholder="姓名" required>
    <input type="text" placeholder="需繳交" step="any">
    <input type="text" placeholder="應收取" step="any">
  `;}

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
    const expected = eval(input.children[1].value||0);
    const paid = eval(input.children[2].value ||0);
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
    if (language === 'en'){
      resultDiv.innerHTML += `<p><strong>Imbalance:</strong> Lack of funds: ${result.lack}</p>`;}
    if (language === 'zh'){
      resultDiv.innerHTML += `<p><strong>不平衡:</strong> 費用不足: ${result.lack}</p>`;}
  }

  else if (result.overflow) {
    if (language === 'en'){
      resultDiv.innerHTML += `<p><strong>Imbalance:</strong> Overflow of funds: ${result.overflow}</p>`;}
    if (language === 'zh'){
      resultDiv.innerHTML += `<p><strong>不平衡:</strong> 支付過多: ${result.overflow}</p>`;}
  }
  else if (result.payments.length > 0) {
    for (let i = 0; i < result.payments.length; i++) {
      const payment = result.payments[i];
      if (language === 'en'){
        resultDiv.innerHTML += `<p>${payment.from} pays ${payment.to}: $${payment.amount}</p>`;}
      if (language === 'zh'){
        resultDiv.innerHTML += `<p>${payment.from} 應支付 ${payment.to}: $${payment.amount}</p>`;}
    }
  }
  else {
     if (language === 'en'){
       resultDiv.innerHTML += `<p> Why do you need to calculate that? </p>`;}
     if (language === 'zh'){
       resultDiv.innerHTML += `<p> 你確定？ </p>`;}
  }
}


  }
}

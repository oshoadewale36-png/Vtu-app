const { useCallback } = require("react");

async function register() {

    const username =
      document.getElementById("registerUsername").value;

    const password =
     document.getElementById("registerPassword").value;

    const response = await fetch("http://vtu-backend-lcve.onrender.com", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            username,
             password
             })
    });

    const data = await res.json();

    document.getElementById("result").innerText = 
    JSON.stringify(data, null, 2);
}

async function login() {

    const username =
     document.getElementById("loginUsername").value;

    const password =
     document.getElementById("loginPassword").value;

    const response = await fetch("http://vtu-backend-lcve.onrender.com", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            username,
             password
             })
    });

    const data = await response.json();

        localStorage.setItem("token", data.token);

    document.getElementById("result").innerText = 
    "Login successful";
    document.getElementById("wallet").style.display = "block";
    getBalance();
}
async function createWallet() {

    const res = await fetch("http://vtu-backend-lcve.onrender.com", {
        method: "POST",
        headers: {
            "Authorization": `Bearer + {localStorage.getItem("token")}`
        }
    });

    const data = await res.json();

    document.getElementById("result").innerText = 
    JSON.stringify(data, null, 2);
}
async function fundWallet() {

    const amount = 
    Number(document.getElementById("fundAmount").value);

    const res = await fetch("http://vtu-backend-lcve.onrender.com", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: 
            "Bearer "  + localStorage.getItem("token")
     },
        body: JSON.stringify({ 
            amount 
     })
 });

    const data = await res.json();

    document.getElementById("result").innerText = 
   data.message;

    getBalance();
}
async function buyAirtime() {

    const network = document.getElementById("airtimeNetwork").value;
    const phone = document.getElementById("airtimePhone").value;
    const amount = Number(document.getElementById("airtimeAmount").value);

    const res = await fetch("http://vtu-backend-lcve.onrender.com", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
            network,
            phone,
            amount
        })
    });

    const data = await res.json();
    document.getElementById("result").innerText = data.message;
    getBalance();
}
async function buyData() {

    const network = document.getElementById("dataNetwork").value;
    const phone = document.getElementById("dataPhone").value;
    const plan = document.getElementById("dataPlan").value;
    const amount = Number(document.getElementById("dataAmount").value);

    const res = await fetch("http://vtu-backend-lcve.onrender.com", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
            network,
            phone,
            plan,
            amount
        })
    });

    const data = await res.json();
    document.getElementById("result").innerText = data.message;
    getBalance();
}
async function getTransactions() {

    const res = await fetch("http://vtu-backend-lcve.onrender.com", {
        method: "GET",
        headers: {
            Authorization:
                "Bearer "  + localStorage.getItem("token")
        }
    });
    const data = await res.json();

    const container = document.getElementById("result");
    container.innerHTML = "<h3>Transactions History</h3>";

    data.forEach(tx => {
        const txElement = document.createElement("div");

        Card.style.background = "#fff";
        card.style.padding = "15px";
        card.style.margin = "10px 0";
        card.style.borderRadius = "12px";
        card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
        card.style.borderLeft = "5px solid #00a859";

        card.innerHTML = `
        <h4 style="margin:0; color: #00a859;">
            ${tx.type.toUpperCase()} 
            </h4>
            <p> Amount: ₦${tx.amount}</p>
            <p> phone: ${tx.phone || "-"}</p>
            <p> network: ${tx.network || "-"}</p>
            <p> plan: ${tx.plan || "-"}</p>
            <p> ${new Date(tx.date).toLocaleString()}</p>
        `;

        container.appendChild(card);
     });


}

async function getBalance() {
    const res = await fetch("http://vtu-backend-lcve.onrender.com", {
        method: "GET",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
        }
    });
    const data = await res.json();

    document.getElementById("balance").innerText = 
     "₦" + data.balance;
}
function paywithPaystack() {
    console.log("cliicked");
    let handler = paystackPop.setup({
        key: pk_test_3145abc87a413f3e5338840aba3951d30262e8c2,
        email: "oshoadewale36@gmail.com",
        amount: 1000 * 100,
        useCallback: function(response){

            fetch("http://vtu-backend-lcve.onrender.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reference: response.reference
                })
            });
        }
    });
    
    handler.openIframe();
}    
let db;

const request = indexedDB.open("budget tracker", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;

    db.createObjectStore("new transaction", { autoIncrement: true });
};


request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadTransactions();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transactions = db.transaction(["new transaction"], "readwrite");

    const transactionStore = transactions.objectStore("new transaction");

    transactionStore.add(record);
}

function uploadTransactions() {
    const transactions = db.transaction(["new transaction"], "readwrite");

    const transactionStore = transactions.objectStore("new transaction");

    const getAll = transactionStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((serverResponse) => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transactions = db.transaction(["new transaction"], "readwrite");

                    const transactionStore =
                        transactions.objectStore("new transaction");

                    transactionStore.clear();

                    alert("New transactions have been submitted");
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };
}

window.addEventListener('online', uploadTransactions);
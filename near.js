const { KeyPair, keyStores, connect, InMemorySigner } = require("near-api-js");
const bigInt = require("big-integer");
const Table = require('cli-table');
const chalk = require('chalk');

require('dotenv').config();

const getRandomInterval = () => {
    return Math.floor(Math.random() * (process.env.MAX_INTERVAL - process.env.MIN_INTERVAL + 1) + process.env.MIN_INTERVAL) * 1000;
};

let transactionCompleted = false;
let countdown = 0;
let intervalId = null;
let loopCount = 0;
let totalSenderChange = bigInt(0);
let totalReceiverChange = bigInt(0);
let account, receiver, sender_balance, receiver_balance;

const clearConsole = () => {
    process.stdout.write('\x1b[2J\x1b[3J\x1b[H');
};

const updateTable = (account, receiver, sender_balance, receiver_balance, taskStatus) => {
    clearConsole();

    const table = new Table({
        head: ['Account', 'Balance', 'Total Change'],
        colWidths: [20, 20, 20]
    });

    table.push(
        [account?.accountId || 'N/A', Number(bigInt(sender_balance?.available || 0) / bigInt(10**24)).toFixed(4), chalk.red(`-${Number(totalSenderChange / bigInt(10**24)).toFixed(4)}`)],
        [receiver?.accountId || 'N/A', Number(bigInt(receiver_balance?.available || 0) / bigInt(10**24)).toFixed(4), chalk.green(`+${Number(totalReceiverChange / bigInt(10**24)).toFixed(4)}`)],
        ['Next Task', taskStatus || `${countdown} seconds`, ''],
        ['Loop Count', loopCount, '']
    );

    console.log(table.toString());
};

const task = async () => {
    try {
        loopCount++;
        const keyPair = KeyPair.fromString(process.env.PRIVATE_KEY);

        const signer = await InMemorySigner.fromKeyPair("testnet", process.env.ID, keyPair);

        const connectionConfig = {
            deps: {
                keyStore: signer.keyStore,
            },
            networkId: "testnet",
            nodeUrl: process.env.RPC,
            walletUrl: "https://wallet.testnet.near.org",
            helperUrl: "https://helper.testnet.near.org",
        };

        const accountConnection = await connect(connectionConfig);
        account = await accountConnection.account(process.env.ID);
        receiver = await accountConnection.account(process.env.RECEIVER);
        sender_balance = await account.getAccountBalance();
        receiver_balance = await receiver.getAccountBalance();
        const before_send = bigInt(sender_balance.available);
        const before_receive = bigInt(receiver_balance.available);

        updateTable(account, receiver, sender_balance, receiver_balance, 'Doing Task');

        let sendMoney;

        try {
            sendMoney = await account.sendMoney(process.env.RECEIVER, process.env.MAX_AMOUNT);
            transactionCompleted = true;
        } catch (error) {
            console.error("Failed to send money:", error);
            return;
        }

        sender_balance = await account.getAccountBalance();
        receiver_balance = await receiver.getAccountBalance();
        const sender_delta = before_send.minus(bigInt(sender_balance.available));
        const receiver_delta = bigInt(receiver_balance.available).minus(before_receive);

        totalSenderChange = totalSenderChange.plus(sender_delta);
        totalReceiverChange = totalReceiverChange.plus(receiver_delta);

        updateTable(account, receiver, sender_balance, receiver_balance);

    } catch (error) {
        console.error("Error in task:", error);
        throw error;
    }
};

const nearTask = async () => {
    try {
        await task();
    } catch (error) {
        console.error("Cannot Perform Task:", error);
        console.log("Waiting 5 minutes before retrying...");
        setTimeout(nearTask, 5 * 60 * 1000); // Wait for 5 mins before retry
        return;
    } finally {
        countdown = getRandomInterval() / 1000;
        intervalId = setInterval(() => {
            countdown--;
            updateTable(account, receiver, sender_balance, receiver_balance, countdown > 0 ? `${countdown} seconds` : 'Doing Task');
            if (countdown <= 0) {
                clearInterval(intervalId);
                nearTask();
            }
        }, 1000);
    }
};

nearTask();

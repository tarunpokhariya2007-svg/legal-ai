const { spawn } = require("child_process");

console.log("========================================");
console.log("NYAYA AI — SERVER + BACKGROUND INGESTION");
console.log("========================================");

console.log("Starting web server immediately...");

const server = spawn(
    process.execPath,
    ["server.js"],
    {
        stdio: "inherit",
        env: process.env
    }
);

server.on("error", error => {
    console.error(
        "SERVER PROCESS ERROR:",
        error.message
    );
});

console.log(
    "Starting legal ingestion in background..."
);

const ingestionArgs = [
    "scripts/ingestCentralActsFast.js",
    ...process.argv.slice(2)
];

const ingestion = spawn(
    process.execPath,
    ingestionArgs,
    {
        stdio: "inherit",
        env: process.env
    }
);

ingestion.on("error", error => {
    console.error(
        "INGESTION PROCESS ERROR:",
        error.message
    );
});

ingestion.on("exit", (code, signal) => {
    if (code === 0) {
        console.log(
            "LEGAL INGESTION FINISHED SUCCESSFULLY."
        );
    } else {
        console.error(
            `LEGAL INGESTION EXITED. code=${code}, signal=${signal}`
        );
    }
});

server.on("exit", (code, signal) => {
    console.error(
        `SERVER EXITED. code=${code}, signal=${signal}`
    );

    if (!ingestion.killed) {
        ingestion.kill("SIGTERM");
    }

    process.exit(
        typeof code === "number" ? code : 1
    );
});

process.on("SIGTERM", () => {
    console.log(
        "SIGTERM received. Stopping processes..."
    );

    if (!server.killed) {
        server.kill("SIGTERM");
    }

    if (!ingestion.killed) {
        ingestion.kill("SIGTERM");
    }
});

process.on("SIGINT", () => {
    console.log(
        "SIGINT received. Stopping processes..."
    );

    if (!server.killed) {
        server.kill("SIGINT");
    }

    if (!ingestion.killed) {
        ingestion.kill("SIGINT");
    }
});
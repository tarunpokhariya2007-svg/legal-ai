const { spawn } = require("child_process");

async function run() {
    console.log("========================================");
    console.log("NYAYA AI — STARTUP INGESTION");
    console.log("========================================");

    const ingestionArgs = [
    "scripts/ingestCentralActs.js",
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

    ingestion.on("close", code => {
        if (code !== 0) {
            console.error(
                `Ingestion failed with exit code ${code}`
            );

            process.exit(code || 1);
        }

        console.log(
            "\nIngestion completed successfully."
        );

        console.log(
            "Starting Nyaya AI server...\n"
        );

        const server = spawn(
            process.execPath,
            ["server.js"],
            {
                stdio: "inherit",
                env: process.env
            }
        );

        server.on("close", serverCode => {
            process.exit(serverCode || 0);
        });
    });
}

run().catch(error => {
    console.error(
        "Startup process failed:",
        error
    );

    process.exit(1);
});
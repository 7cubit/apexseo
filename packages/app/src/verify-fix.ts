import { savePageWithLinks } from "./lib/neo4j/repositories/PageRepository";

async function verify() {
    try {
        if (typeof savePageWithLinks === 'function') {
            console.log("Verification Success: savePageWithLinks exists.");
        } else {
            console.error("Verification Failed: savePageWithLinks is NOT a function.");
            process.exit(1);
        }
    } catch (e) {
        console.error("Verification Error:", e);
        process.exit(1);
    }
}

verify();

import "dotenv/config";
import { adminClient } from "..";

const dbName = process.env["PGDATABASE"];

adminClient.connect();

adminClient.query(`CREATE DATABASE "${dbName}"`, (err) => {
    if(err) {
        console.error("Error create the data base", err.stack);
    } else {
        console.log(`Data base "${dbName}" created succesfully`);
    }
    adminClient.end();
});
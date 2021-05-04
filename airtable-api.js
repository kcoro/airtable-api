const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
var Airtable = require('airtable');
var customerPipelineBase = new Airtable({apiKey: AIRTABLE_API_KEY}).base('appLhC9McNSEeDMmE');

let repsCustomers = []
let totalAnnualRevenue = 0
let searchSalesID = -1

function queryCustomerPipeline() {
    customerPipelineBase('Customer Pipeline').select({
        // Selecting the first 3 records in Grid-View-Pipeline:
        maxRecords: 50,
        view: "Grid-View-Pipeline"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        // For each record, if record has matching TM id, add that records annual revenue to running total
        records.forEach(record => {
            let sid = record.get('SalesID (from Territory Manager)')
            if (sid == searchSalesID) { repsCustomers.push(record) }
        })
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are no more records, `done` will get called.
        fetchNextPage();
    
    }, function done(err) {
        if (err) { 
            console.error(err);
            return; 
        }
    });
}

function printCustomers() {
        console.log(`Showing Customers and Annual Revenue for SalesID ${searchSalesID}\n`)
    for (let i in repsCustomers) {
        console.log(`Company Name: ${repsCustomers[i].get('Company Name')}\tAnnual Revenue: ${repsCustomers[i].get('Annual Revenue')}`)
    }
}

// Read from stdin
const readline = require("readline");
const readline_interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// Prompt user to enter SalesID
// Run query on DB and print results of query
readline_interface.question("Enter Sales Rep ID:  ", (input) => {
        searchSalesID = input.toString()
        if (searchSalesID != -1) {
            queryCustomerPipeline()
            setTimeout(() => printCustomers(), 1000)
        }        
        readline_interface.close()
})

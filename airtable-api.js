const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
let Airtable = require('airtable');
let corDistributionBase = new Airtable({apiKey: AIRTABLE_API_KEY}).base('appLhC9McNSEeDMmE');

let repsCustomers = []  // list of a given sales reps customers
let totalAnnualRevenue = 0  // total revenue for a particular sales reps account base
let searchSalesID = -1  // reps SalesID, received from stdin

// queryCustomerPipeline() connects to a Airtable base, and performs a table level select opera
async function queryCustomerPipeline() {
    corDistributionBase('Customer Pipeline').select({
        fields: ["CustomerID", "SalesID (from Territory Manager)",  "Company Name", "Annual Revenue", "Status"],
        maxRecords: 100,
        view: "Grid-View-Pipeline"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
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
    })
}

function printCustomers() {
    console.log(`\nShowing accounts assigned to SalesID ${searchSalesID}\n`)
    console.log(`CID:\tCompany Name:\tAnnual Revenue:\tStatus:`)

    for (let i in repsCustomers) {
        console.log(`${repsCustomers[i].get('CustomerID')}\t${repsCustomers[i].get('Company Name')}\t$${repsCustomers[i].get('Annual Revenue').toLocaleString('en-US')}\t${repsCustomers[i].get('Status')}`)
        totalAnnualRevenue += repsCustomers[i].get('Annual Revenue')
    }

    console.log('\t\t\t$' + totalAnnualRevenue.toLocaleString('en-US') +'\n')
}

// Read from stdin
const readline = require('readline-sync');

let selection = readline.question(`Customer Pipeline CLI Edition
Please select from the following options:
1 - Get customer list by SalesID
2 - Update customer status
3 - Exit
Selection: `);

if (selection == 1) {
    // Prompt user to enter SalesID
    // Run query on DB and print results of query
    searchSalesID = readline.question('Enter SalesID: ')

    if (searchSalesID != -1) {
        queryCustomerPipeline()
        setTimeout(() => printCustomers(), 1250)
    } 
}

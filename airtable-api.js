const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const Airtable = require('airtable');
const corDistributionBase = new Airtable({apiKey: AIRTABLE_API_KEY}).base('appLhC9McNSEeDMmE');
const table = corDistributionBase('Customer Pipeline');
const readline = require('readline-sync');

let repsCustomers = []  // list of a given sales reps customers
let totalAnnualRevenue = 0  // total revenue for a particular sales reps account base
let searchSalesID = -1  // reps SalesID, received from stdin
let searchCustomerID = -1 // CustomerID received from stdin
let setStatus = ""
let recordId = -1
let records = [] // list of all records returned by query, used to store results prior to filtering

// queryCustomerPipeline() performs a table level select operation, searching for specific fields in a view
async function queryCustomerPipeline() {
    repsCustomers = []
    records = await table
        .select({
            fields: ["CustomerID", "SalesID (from Territory Manager)",  "Company Name", "Annual Revenue", "Status"],
            maxRecords: 100, 
            view: 'Grid-View-Pipeline'
        })
        .firstPage()

    // filter out records, such that only records containing SalesID are stored
    records.forEach(record => {
        let sid = record.get('SalesID (from Territory Manager)')
        if (sid == searchSalesID) { repsCustomers.push(record) }
    })
}

// updateCustomerStatus() receives CustomerID to search for
// gets the hashed table id of the record matching CustomerID
// the hashed id is used to update the records status
async function updateCustomerStatus(searchCustomerID, setStatus) {
    // query table and look for record which matches searched CustomerID
    // get that records hashed id
    records = await table
        .select({
            fields: ["CustomerID", "Status"],
            maxRecords: 100, 
            view: 'Grid-View-Pipeline'
        })
        .firstPage()

    records.forEach(record => {
        if (record.get('CustomerID') == searchCustomerID) { recordId = record.getId() }
    })

    // use targets hashed id to update record status
    corDistributionBase('Customer Pipeline').update(recordId, {
        "Status": setStatus
    }, function(err) {
        if (err) {
          console.error(err)
          return
        }
      })
}

// Output results of querying Customer Pipeline
function printCustomers() {
    console.log(`\nShowing accounts assigned to SalesID ${searchSalesID}\n`)
    console.log(`CID:\tCompany Name:\tAnnual Revenue:\tStatus:`)

    for (let i in repsCustomers) {
        console.log(`${repsCustomers[i].get('CustomerID')}\t${repsCustomers[i].get('Company Name')}\t$${repsCustomers[i].get('Annual Revenue').toLocaleString('en-US')}\t${repsCustomers[i].get('Status')}`)
        totalAnnualRevenue += repsCustomers[i].get('Annual Revenue')
    }

    console.log('\t\t\t$' + totalAnnualRevenue.toLocaleString('en-US') +'\n')
}

// Main loop prompts user to choose a given operation
// Get customer list runs queryCustomerPipeline and prints customer list
// Update custoemr status, takes a customerID and status from stdin, and updates
// record in base.
async function main() {
    console.log('*********************************\n* CUSTOMER PIPELINE CLI EDITION *\n*********************************\n')
    let prompt = true

    while (prompt) {
        let selection = readline.question(`Please select from the following options
1 - Get customer list by SalesID
2 - Update customer status
3 - Exit\n
Selection: `);

        if (selection == 1) {
            searchSalesID = readline.question('Enter SalesID: ')
            // Run query on DB and print results of query
            await queryCustomerPipeline()
            printCustomers()
            totalAnnualRevenue = 0
        } else if (selection == 2) {
            let searchCustomerID = readline.question('Enter CustomerID: ')
            let setStatus = readline.question('Set Status: ')
            await updateCustomerStatus(searchCustomerID, setStatus)
            console.log(`Successfully updated status for CID: ${searchCustomerID} to ${setStatus}\n`)
        } else if (selection == 3) {
            prompt = false
        }
    }
}

// Execute the main loop
main()

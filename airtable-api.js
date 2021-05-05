const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const Airtable = require('airtable');
const corDistributionBase = new Airtable({apiKey: AIRTABLE_API_KEY}).base('appLhC9McNSEeDMmE');
const table = corDistributionBase('Customer Pipeline');
const readline = require('readline-sync');

let repsCustomers = []  // list of a given sales reps customers
let totalAnnualRevenue = 0  // total revenue for a particular sales reps account base
let searchSalesID = -1  // reps SalesID, received from stdin
let records = []

// queryCustomerPipeline() connects to a Airtable base, and performs a table level select opera
async function queryCustomerPipeline() {
    repsCustomers = []
    records = await table
        .select({
            fields: ["CustomerID", "SalesID (from Territory Manager)",  "Company Name", "Annual Revenue", "Status"],
            maxRecords: 100, 
            view: 'Grid-View-Pipeline'
        })
        .firstPage()

    records.forEach(record => {
        let sid = record.get('SalesID (from Territory Manager)')
        if (sid == searchSalesID) { repsCustomers.push(record) }
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

async function main() {
    let prompt = true
    console.log('*********************************\n* CUSTOMER PIPELINE CLI EDITION *\n*********************************\n')

    while (prompt) {

        let selection = readline.question(`Please select from the following options:
1 - Get customer list by SalesID
2 - Update customer status
3 - Exit\n
Selection: `);
            
        if (selection == 1) {
            // Prompt user to enter SalesID
            // Run query on DB and print results of query
            searchSalesID = readline.question('Enter SalesID: ')
    
            if (searchSalesID != -1) {
                await queryCustomerPipeline()
                printCustomers()
                totalAnnualRevenue = 0
            }
        } else if (selection == 3) {
            prompt = false
        }
    }
}


main()

var mysql = require("mysql");
const inquirer = require('inquirer');
const Table = require('cli-table');


var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});


connection.connect(function (err) {
    if (err) throw err;
    afterConnection();

});
let itemsList = [];
let totalArray = [];
let totalPurchase;
function afterConnection() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        let itemsInStore = res;
        const table = new Table({
            chars: {
                'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                , 'right': '║', 'right-mid': '╢', 'middle': '│'
            }
        });

        table.push(
            ['id', 'product_name', 'Department name', 'price', 'stock_quantity']
        );
        for (i = 0; i < itemsInStore.length; i++) {
            table.push([itemsInStore[i].id, itemsInStore[i].product_name, itemsInStore[i].department_name, itemsInStore[i].price, itemsInStore[i].stock_quantity]);
        };
        console.log(table.toString() + "\n");

        inquirer
            .prompt([
                {
                    type: 'list',
                    choices: ['Purchase item', 'Exit'],
                    name: 'action'
                },
                {
                    type: 'input',
                    message: "\nWhat is id of the product you are interested in purchasing?\n" + "\n",
                    name: 'idrequested'
                },
                {
                    type: 'input',
                    message: "\nHow many of the requested id do you want?\n" + "\n",
                    name: 'amountRequested'
                },
            ])
            .then(function (inquireResponse) {
                if (inquireResponse.action == "Purchase item") {
                    let itemCount = 0;
                    let idRequest = inquireResponse.idrequested;
                    let prodName;
                    let prodSales;
                    let amountRequest = inquireResponse.amountRequested;

                    for (i = 0; i < itemsInStore.length; i++) {
                        if (itemsInStore[i].id == idRequest) {
                            console.log('================================== \n');
                            prodName = itemsInStore[i].product_name;
                            // console.log(itemsInStore[i]);
                            if (itemsInStore[i].stock_quantity >= amountRequest) {
                                console.log('\n Sufficient amount\n' + "\n");
                                let stock_withdrawal = parseInt(itemsInStore[i].stock_quantity) - parseInt(amountRequest);
                                itemsInStore[i].products_sales = itemsInStore[i].price * amountRequest;
                                // console.log(itemsInStore[i].product_name)
                                let totalCost = itemsInStore[i].price * amountRequest;
                                prodSales = itemsInStore[i].products_sales + totalCost;
                                // console.log('$' + totalCost + "\n");
                                itemCount++;
                                var items = {};
                                for (j = 0; j < itemCount; j++) {
                                    items[j] = {
                                        idreq: idRequest,
                                        name: prodName,
                                        amountreq: amountRequest,
                                        stkWth: stock_withdrawal,
                                        prdsles: prodSales,
                                        tot: totalCost
                                    };
                                    itemsList.push(items[j]);
                                    totalArray.push(items[j].tot);
                                }
                                for (a = 0; a < itemsList.length; a++) {
                                    console.log("\nItem: " + itemsList[a].name + ", Amount: " + itemsList[a].amountreq + ', Price: $' + itemsList[a].tot.toFixed(2));
                                };
                                const arrSum = arr => arr.reduce((a, b) => a + b, 0);
                                totalPurchase = arrSum(totalArray).toFixed(2);
                                console.log("\nTotal: $" + totalPurchase + "\n\n");
                                selectItem();
                                // afterConnection();
                            }
                            else {
                                console.log('\n Insufficient amount\n' + "\n");
                                // return;
                                selectItem();
                            }
                        }
                    };
                    function selectItem() {

                        inquirer
                            .prompt([
                                {
                                    type: 'list',
                                    message: "Would you like to continue shopping or checkout?",
                                    choices: ['continue_shopping', 'checkout', 'Exit'],
                                    name: 'shoppingAction'
                                }
                            ]).then(function (inquireResponse) {
                                if (inquireResponse.shoppingAction == 'continue_shopping') {

                                    afterConnection();



                                }
                                else if (inquireResponse.shoppingAction == 'checkout') {
                                    checkout();
                                }
                                else {
                                    exit();
                                }
                            })
                    }
                }
                else if(inquireResponse.action) {
                    exit();
                }
            })
        function exit() {

            console.log("Cya later alligator");
            connection.end();
        };
        function checkout() {
            const checkOutTable = new Table({
                chars: {
                    'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                    , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                    , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                    , 'right': '║', 'right-mid': '╢', 'middle': '│'
                }
            });
            console.log("===================================================================================================================================");
            console.log("PURCHASE ORDER");
            checkOutTable.push(
                ['Id', 'Name', 'Amount', 'Price']
            );
            for (i = 0; i < itemsList.length; i++) {
                checkOutTable.push([itemsList[i].idreq, itemsList[i].name, itemsList[i].amountreq, itemsList[i].tot]);
                connection.query('UPDATE products SET stock_quantity = ?, products_sales = ? WHERE id = ?', [parseFloat(itemsList[i].stkWth), parseFloat(itemsList[i].prdsles), itemsList[i].idreq], function (err, result, fields) {
                    if (err) throw err;
                    // if err console.log(result)
                });
            };
            console.log(checkOutTable.toString() + "\n");
            console.log("__________________________________\n");
            console.log("Total of Purchase: $" + totalPurchase);
            console.log("\n===================================================================================================================================");
            connection.end();
        }
    });
};

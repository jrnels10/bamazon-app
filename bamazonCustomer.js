var mysql = require("mysql");
const inquirer = require('inquirer');

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

function afterConnection() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        let itemsInStore = res;
        // console.log(res);
        // console.log('==================================');

        // console.log(res[1].stock_quantity);

        inquirer
            .prompt([
                // {
                //     type:'list',
                //     message: 'Add or remove from inventory?',
                //     choices: ['add','remove'],
                //     name:'action'
                // },
                {
                    type: 'input',
                    message: "What is id of the product you are interested in?",
                    name: 'idrequested'
                },
                {
                    type: 'input',
                    message: "How many of items of the requested id do you want?",
                    name: 'amountRequested'
                },
            ])
            .then(function (inquireResponse) {
                let idRequest = inquireResponse.idrequested;
                let amountRequest = inquireResponse.amountRequested;
                // let userAction = inquireResponse.action;
                // if(userAction == 'add') {
                //     addToInventory();
                // }
                // else {
                //     removeFromInventory();
                // }
                // function removeFromInventory() {
                    for (i = 0; i < itemsInStore.length; i++) {
                        if (itemsInStore[i].id == idRequest) {
                            console.log('================================== \n');

                            console.log(itemsInStore[i]);
                            if (itemsInStore[i].stock_quantity >= amountRequest) {
                                console.log('\n Sufficient amount');
                                itemsInStore[i].stock_quantity = parseInt(itemsInStore[i].stock_quantity) - parseInt(amountRequest);
                                itemsInStore[i].products_sales = itemsInStore[i].price * amountRequest;
                                // console.log(itemsInStore[i].id)
                                connection.query('UPDATE products SET stock_quantity = ?, products_sales = ? WHERE id = ?', [itemsInStore[i].stock_quantity, itemsInStore[i].products_sales, itemsInStore[i].id], function (err, result, fields) {
                                    // console.log(result)
                                });
                                console.log('\n New inventory amount: ' + itemsInStore[i].stock_quantity + '\n');
                                let totalCost = itemsInStore[i].price * amountRequest;
                                console.log('$' + totalCost);
                                // return;
                                connection.end();
                            }
                            else {
                                console.log('\n Insufficient amount');
                                // return;
                                connection.end();
                            }
                        }

                    }
                // };
                function totalRevenue() {
                    for (i = 0; i < itemsInStore.length; i++) {
                        if (itemsInStore[i].id == idRequest) {
                            console.log('================================== \n');
                            console.log(itemsInStore[i]);

                            itemsInStore[i].stock_quantity = parseInt(itemsInStore[i].stock_quantity) + parseInt(amountRequest);
                            connection.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [itemsInStore[i].stock_quantity, itemsInStore[i].id], function (err, result, fields) {
                                // console.log(result)
                            });
                            console.log('\n New inventory amount: ' + itemsInStore[i].stock_quantity + '\n');
                            connection.end();
                        }

                    }
                }
                // console.log(idRequest)
                // if (inquireResponse.confirm){
                //     console.log("Who are we kidding... " + inquireResponse.tallest + " is the tallest");
                //     console.log(inquireResponse.coolest + ' is the coolest')
                // }
            })
    });
};

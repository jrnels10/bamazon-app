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
    // console.log("connected as id " + connection.threadId);
    afterConnection();
    // createProduct();
    // update();
    // queryAllSongs();
    // queryDanceSongs();
    // queryDelete();
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
                {
                    type: 'list',
                    message: 'Add or remove from inventory?',
                    choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
                    name: 'action'
                },
                // {
                //     type: 'input',
                //     message: "What is id of the product you are interested in?",
                //     name: 'idrequested'
                // },
                // {
                //     type: 'input',
                //     message: "How many of items of the requested id do you want?",
                //     name: 'amountRequested'
                // },
            ])
            .then(function (inquireResponse) {
                // console.log(inquireResponse.action)
                switch (inquireResponse.action) {
                    case 'View Products for Sale':
                        console.log('The user wants to View products for sale: \n');
                        for (i = 0; i < itemsInStore.length; i++) {

                            console.log(itemsInStore[i].product_name)
                        }
                        connection.end();
                        break;
                    case 'View Low Inventory':
                        console.log('\nThe user wants to View Low Inventory: \n');
                        for (i = 0; i < itemsInStore.length; i++) {
                            // console.log(parseInt(itemsInStore[i].stock_quantity));
                            if (parseInt(itemsInStore[i].stock_quantity) < 20) {
                                console.log(itemsInStore[i].product_name + ' : ' + itemsInStore[i].stock_quantity + ' remaining.')
                            }
                        }
                        connection.end();
                        break;
                    case 'Add to Inventory':
                        console.log('\nThe user wants to Add to Inventory \n');
                        inquirer
                            .prompt([
                                {
                                    type: 'input',
                                    message: "What is id of the product you want to increase the stock of? \n",
                                    name: 'idrequested'
                                },
                                {
                                    type: 'input',
                                    message: "How many of items do you want to add? \n",
                                    name: 'amountRequested'
                                }
                            ]).then(function (inquireResponse) {
                                let idRequest = inquireResponse.idrequested;
                                let amountRequest = inquireResponse.amountRequested;
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
                            });
                        break;
                    case 'Add New Product':
                        console.log('The user wants to Add New Product: \n');
                        inquirer
                            .prompt([
                                {
                                    type: 'input',
                                    message: "What is the name of the product? \n",
                                    name: 'nameProduct'
                                },
                                {
                                    type: 'list',
                                    message: "Which department? \n",
                                    choices: ['Hiking', 'Running', 'Electronics'],
                                    name: 'nameDept'
                                },
                                {
                                    type: 'input',
                                    message: "What is the price for this product? \n",
                                    name: 'newPrice'
                                },
                                {
                                    type: 'input',
                                    message: "How many of this product are you adding to inventory? \n",
                                    name: 'newStock'
                                },
                            ]).then(function (inquireResponse) {
                                let post = { product_name: inquireResponse.nameProduct, department_name: inquireResponse.nameDept, price: inquireResponse.newPrice, stock_quantity: inquireResponse.newStock };
                                connection.query('INSERT INTO products SET ?', post, function (error, results, fields) {
                                    if (error) throw error;
                                    // console.log(itemsInStore)
                                });
                            });
                        break;
                }
            });
    });
}
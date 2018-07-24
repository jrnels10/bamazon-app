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

function afterConnection() {
    let DeptInStore;
    let hikingTotal;
    let runningtotal;
    let electronicsTotal;
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        let prodInStore = results;
        let hikingArray = [];
        let runningArray = [];
        let electronicsArray = [];
        for (i = 0; i < prodInStore.length; i++) {
            if (prodInStore[i].department_name == 'Hiking') {
                hikingArray.push(prodInStore[i].products_sales);
            }
            else if (prodInStore[i].department_name == 'Running') {
                runningArray.push(prodInStore[i].products_sales);
            }
            else if (prodInStore[i].department_name == 'Electronics') {
                electronicsArray.push(prodInStore[i].products_sales);
            }

        }
        const arrSum = arr => arr.reduce((a, b) => a + b, 0);

        hikingTotal = arrSum(hikingArray).toFixed(2);
        runningtotal = arrSum(runningArray).toFixed(2);
        electronicsTotal = arrSum(electronicsArray).toFixed(2);

    });
    connection.query("SELECT * FROM departments", function (err, res) {
        DeptInStore = res;
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: 'Menu options',
                    choices: ['View Product Sales by Department', 'Create New Department', 'Exit'],
                    name: 'action'
                }
            ])
            .then(function (inquireResponse) {
                let action = inquireResponse.action;
                let product_sales;
                if (action == "View Product Sales by Department") {

                    const table = new Table({
                        chars: {
                            'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                            , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                            , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                            , 'right': '║', 'right-mid': '╢', 'middle': '│'
                        }
                    });

                    table.push(
                        ['id', 'Department name', 'Overhead cost', 'product sales', 'money money money']
                    );
                    for (i = 0; i < DeptInStore.length; i++) {
                        if (DeptInStore[i].department_name == "Hiking") {
                            product_sales = hikingTotal;
                        }
                        else if (DeptInStore[i].department_name == "Running") {
                            product_sales = runningtotal;
                        }
                        else if (DeptInStore[i].department_name == "Electronics") {
                            product_sales = electronicsTotal;
                        }
                        else {
                            product_sales = 0;
                        }
                        table.push([DeptInStore[i].department_id, DeptInStore[i].department_name, DeptInStore[i].over_head_costs, product_sales, (product_sales - DeptInStore[i].over_head_costs)]);
                    };

                    console.log(table.toString());
                    if (err) throw err;
                    afterConnection();
                }
                else if (action == "Create New Department") {
                    inquirer
                        .prompt([
                            {
                                type: 'input',
                                message: "\nWhat is the name of the new department? \n",
                                name: 'deptName'
                            },
                            {
                                type: 'input',
                                message: '\nWhat is the over head cost? \n',
                                name: 'overHead'
                            }]).then(function (inquireResponse) {
                                let post = { department_name: inquireResponse.deptName, over_head_costs: inquireResponse.overHead };
                                connection.query('INSERT INTO departments SET ?', post, function (error, results, fields) {
                                    afterConnection();
                                });
                            });
                }
                else if (action == 'Exit') {
                    console.log('Good bye');
                    connection.end();
                }
            });
    });
}

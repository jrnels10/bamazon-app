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
    // console.log("connected as id " + connection.threadId);
    afterConnection();
    // createProduct();
    // update();
    // queryAllSongs();
    // queryDanceSongs();
    // queryDelete();
});

function afterConnection() {
    connection.query("SELECT * FROM departments", function (err, res) {
        connection.query("SELECT * FROM products", function (err, results) {
            if (err) throw err;
            let DeptInStore = res;
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
            let hikingTotal = arrSum(hikingArray);
            let runningtotal = arrSum(runningArray);
            let electronicsTotal = arrSum(electronicsArray);
            let post = { department_name: 'Hiking', department_name: 'Running', department_name: 'Electronics' };

            connection.query('INSERT INTO departments SET ?', post, function (error, results, fields) {
            })
            // console.log(parseInt(prodInStore[i].products_sales));

            inquirer
                .prompt([
                    {
                        type: 'list',
                        message: 'Menu options',
                        choices: ['View Product Sales by Department', 'Create New Department'],
                        name: 'action'
                    }
                ])
                .then(function (inquireResponse) {
                    let action = inquireResponse.action;

                    const table = new Table({
                        chars: {
                            'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                            , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                            , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                            , 'right': '║', 'right-mid': '╢', 'middle': '│'
                        }
                    });

                    table.push(
                        ['id', 'Department name', 'Overhead cost', 'product sales', 'tp']
                    );
                    for (i = 0; i < DeptInStore.length; i++) {
                        table.push([DeptInStore[i].department_id, DeptInStore[i].department_name, DeptInStore[i].over_head_costs, DeptInStore[i].total_profit]);
                    };

                    console.log(table.toString());
                })

        });
        if (err) throw err;
    });
}
//вызов необходимых модулей
const express = require('express');
const app = express();
const port = 3000;
app.listen(port, () => console.log(`Используется 3000 порт`));
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
//создаем подключение к БД
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "test",
  password: "1234"
});
//проверка подключения
connection.connect(function(err){
  if (err) {
    return console.error("Ошибка: " + err);
  }
  else{
    console.log("Подключение к БД установлено!");
  }
});
//просмотр фаилов с расширением ejs в папке view
app.set('view engine', 'ejs');

//формат даты YYYY-mm-dd
var today = new Date();
let dd = today.getDate();
let mm = today.getMonth()+1; //Январь это  0!    
let yyyy = today.getFullYear();
    if(dd<10){dd='0'+dd}; 
    if(mm<10){mm='0'+mm}; 
today = yyyy+'-'+mm+'-'+dd;

// получаем отправленные данные и добавляем их в БД 
app.post("/add", urlencodedParser, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);

  const name = req.body.name;
  const age = req.body.inn;

  connection.query("INSERT INTO `users` (name, age, dat) VALUES (?,?,?)", [name, age, today], function(err, data) {
    if(err) return console.log(err);
    res.redirect("/add");
  });
});

// получаем отредактированные данные и отправляем их в БД
app.post("/edit", urlencodedParser, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);

  const id = req.body.id;
  const name = req.body.name;
  const age = req.body.age;
 
  connection.query("UPDATE `users` SET name=?, age=?, dat=? WHERE id=?", [name, age, today, id], function(err, data) {
    if(err) return console.log(err);
    res.redirect("/data");
  });
});

//удаление выбранной записи по id
app.get('/delete/:id', function(req, res){ 
  let id = req.params.id;

  connection.query("DELETE FROM `users` WHERE id=?", [id], function(err, data){
    if (err) console.log(err);
    res.redirect('/data');
  });
});

//переход на главную страницу
app.get('/index', (req, res)=> res.render('index', {title: "Главная"}));

// переход на страницу добавления данных
app.get('/add', (req, res)=> res.render('add', {title: "Добавление данных", now: today}));

//переход на страницу с данными из бд
app.get('/data', function(req, res){
  connection.query("SELECT * FROM `users`", function(err, data){
    if (err) console.log(err);
    res.render('data', {title: "Данные из БД", user: data});
  });
});

//переход на страницу редактирования
app.get('/edit/:id/:name/:age', (req, res)=> 
  res.render('edit', {title: "Редактирование", id: req.params.id, name: req.params.name, age: req.params.age, now: today}));

// перенаправление на главную страницу
app.get('/:page?', (req, res)=> {let page = req.params.page;
     if (!page) page = 'index';
    res.render('index', {title: "Главная"})});
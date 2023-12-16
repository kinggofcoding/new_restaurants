const express = require("express")
const { engine } = require("express-handlebars")
const app = express()
const port = 3000
const methodOverride = require("method-override")
const router = require('./routes')
const flash = require('connect-flash')
const messageHandler = require('./middlewares/message-handler')
const errorHandler = require('./middlewares/error-handler')
const session = require('express-session')


// express初始化設定: template,static file, view path,post數據解析
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method")) // 可使用put,delete來表示更新及刪除動作
app.engine(".hbs", engine({ extname: ".hbs" }))
app.set("view engine", ".hbs")
app.set("views", "./views")
app.use(express.static("public"))

// 設置session存放於Server
app.use(session({
  secret: 'This is secret',
  resave: false,
  saveUninitialized: false
}))


app.use(flash()) //設定 flash message
app.use(messageHandler) //設定 middleware: message handle
app.use('/', router) //設定 router
app.use(errorHandler) //設定 middleware: error handle

// 伺服器啟動並監聽port:3000
app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})

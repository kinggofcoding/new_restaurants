const express = require("express")
const { engine } = require("express-handlebars")
const app = express()
const port = 3000
const methodOverride = require("method-override") // 可以使用put,delete來表示更新及刪除動作
const router = require('./routes')
const flash = require('connect-flash')
const messageHandler = require('./middlewares/message-handler')
const errorHandler = require('./middlewares/error-handler')

// express初始化設定: template,static file, view path,post數據解析
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.engine(".hbs", engine({ extname: ".hbs" }))
app.set("view engine", ".hbs")
app.set("views", "./views")
app.use(express.static("public"))

app.use(flash())
app.use(messageHandler)
app.use('/', router)
app.use(errorHandler)

// 伺服器啟動並監聽port:3000
app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})

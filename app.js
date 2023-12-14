const express = require("express")
const { engine } = require("express-handlebars")
const app = express()
const port = 3000
const cssIndex = "/stylesheets/index.css" // index所使用的css
const cssShow = "/stylesheets/show.css" // show所使用的css
const methodOverride = require("method-override") // 可以使用put,delete來表示更新及刪除動作

// 引入所有model
const db = require("./models")
// 引入restaurant model
const Restaurant = db.Restaurant

// express初始化設定: template,static file, view path,post數據解析
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.engine(".hbs", engine({ extname: ".hbs" }))
app.set("view engine", ".hbs")
app.set("views", "./views")
app.use(express.static("public"))


// 搜尋符合條件餐廳
app.get('/restaurants/search', async (req, res) => {
  try {
  const keyword = req.query.keyword?.trim()
  const restaurants = await Restaurant.findAll({ raw: true })
  const matchedRestaurants = keyword
    ? restaurants.filter((restaurant) =>
        Object.values(restaurant).some((property) => {
          if (typeof property === 'string') {
            return property.toLowerCase().includes(keyword.toLowerCase())
          }
          return false
        })
      )
    : restaurants
  res.render('index', {
    restaurants: matchedRestaurants,
    cssPath: cssIndex,
    keyword,
  })    
  } catch (error) {
    res.status(422).json(error)
  }
})


// 讀取所有餐廳
app.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({ raw: true })
    res.render("index", { cssPath: cssIndex, restaurants })
  } catch (error) {
    res.status(422).json(error)
  }
})

// 新增餐廳頁面
app.get("/restaurants/new", (req, res) => {
  try {
    res.render("new")
  } catch (error) {
    res.status(422).json(error)
  }
})

// 讀取單一餐廳
app.get("/restaurants/:id", async (req, res) => {
  try {
    const id = req.params.id
    const restaurant = await Restaurant.findByPk(id, { raw: true })
    res.render("show", { cssPath: cssShow, restaurant })
  } catch (error) {
    res.status(422).json(error)
  }
})

// 新增餐廳
app.post("/restaurants", async (req, res) => {
  try {
    const {
      name,
      name_en,
      category,
      image,
      location,
      google_map,
      phone,
      rating,
      description,
    } = req.body
    const restaurant = await Restaurant.create({
      name,
      name_en,
      category,
      image,
      location,
      google_map,
      phone,
      rating: parseFloat(rating),
      description,
    })
    if (restaurant) {
      res.redirect("/restaurants")
    }
  } catch (error) {
    res.status(422).json(error)
  }
})

// 編輯餐廳頁面
app.get("/restaurants/:id/edit", async (req, res) => {
  try {
    const id = req.params.id
    const restaurant = await Restaurant.findByPk(id, { raw: true })
    res.render("edit", { restaurant })
  } catch (error) {
    res.status(422).json(error)
  }
})
// 更新餐廳
app.put("/restaurants/:id", async (req, res) => {
  try {
    const id = req.params.id
    const {
      name,
      name_en,
      category,
      image,
      location,
      google_map,
      phone,
      rating,
      description,
    } = req.body

    await Restaurant.update(
      {
        name,
        name_en,
        category,
        image,
        location,
        google_map,
        phone,
        rating: parseFloat(rating),
        description,
      },
      { where: { id } }
    )
    res.redirect(`/restaurants/${id}`)
  } catch (error) {
    res.status(422).json(error)
  }
})

// 刪除餐廳
app.delete("/restaurants/:id", async (req, res) => {
  try {
    const id = req.params.id
    await Restaurant.destroy({ where: { id } })
    res.redirect("/restaurants")
  } catch (error) {
    res.status(422).json(error)
  }
})



// 伺服器啟動並監聽port:3000
app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})

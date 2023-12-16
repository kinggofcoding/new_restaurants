const express = require("express")
const router = express.Router()
const cssIndex = "/stylesheets/index.css" // index所使用的css
const cssShow = "/stylesheets/show.css" // show所使用的css
const { Op } = require("sequelize")
// 引入所有model
const db = require("../models")
// 引入restaurant model
const Restaurant = db.Restaurant


// 讀取所有餐廳
router.get("/", async (req, res, next) => {
  try {
    const keyword = req.query.keyword?.trim() // 搜尋關鍵字
    const sortState = req.query.sort || "排序" // 排序方式
    const orderBy = [] // 資料排序的參數

    // 確認排序的方式並設定參數
    switch (sortState) {
      case "A-Z":
        orderBy.push("name")
        break
      case "Z-A":
        orderBy.push("name", "DESC")
        break
      case "Category":
        orderBy.push("category")
        break
      case "Location":
        orderBy.push("location")
        break
      default:
        orderBy.push("id")
        break
    }
    
    // 如果有關鍵字則設定為查詢條件
    const searchByKeyword = keyword ? {
      [Op.or]: [
        { name: { 
          [Op.substring]: keyword
        }},
        { name_en: { 
          [Op.substring]: keyword
        }},
        { category: { 
          [Op.substring]: keyword
        }},
        { location: { 
          [Op.substring]: keyword
        }},
        { description: { 
          [Op.substring]: keyword
        }}
      ]
    }
    : ''
    //取得餐廳並設定排序方式
    const restaurants = await Restaurant.findAll({
        attributes: ["id" ,"name", "category", "image", "rating"],
        raw: true,
        order: [orderBy],
        where: searchByKeyword
    })

    res.render("index", {
         cssPath: cssIndex,
         restaurants,
         sortState,
         keyword
    })
  } catch (error) {
    error.Message = '資料取得失敗'
    next(error)
  }
})

// 新增餐廳頁面
router.get("/new", (req, res, next) => {
  try {
    res.render("new")
  } catch (error) {
    error.Message = '讀取頁面失敗'
    next(error)
  }
})

// 讀取單一餐廳
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const restaurant = await Restaurant.findByPk(id, { raw: true })
    res.render("show", { cssPath: cssShow, restaurant })
  } catch (error) {
    error.Message = '資料取得失敗'
    next(error)
  }
})

// 新增餐廳
router.post("/", async (req, res, next) => {
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
    error.Message = '新增失敗'
    next(error)
  }
})

// 編輯餐廳頁面
router.get("/:id/edit", async (req, res, next) => {
  try {
    const id = req.params.id
    const restaurant = await Restaurant.findByPk(id, { raw: true })
    res.render("edit", { restaurant })
  } catch (error) {
    error.Message = '讀取頁面失敗'
    next(error)
  }
})
// 更新餐廳
router.put("/:id", async (req, res, next) => {
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
    error.Message = '更新失敗'
    next(error)
  }
})

// 刪除餐廳
router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    await Restaurant.destroy({ where: { id } })
    res.redirect("/restaurants")
  } catch (error) {
    error.Message = '刪除失敗'
    next(error)
  }
})

module.exports = router

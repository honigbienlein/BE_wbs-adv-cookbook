import express from "express";
import data from "./data.json" assert {type: "json"};
import cors from "cors";
import * as pg from 'pg'
import 'dotenv/config'


// BE Server
const app = express();
const port = 8000;

// DB
const pool = new pg.default.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// to get pictures public
app.use(express.static('public'))

// localhost conflict handler
app.use(cors())

app.get('/', (req, res) => {
    res.send('Wenn du schlau bist und die richtige Route wählst, bekommst du ein json zurück.')
})

app.get('/testgetauthors', (req, res) => {
    pool.query("SELECT * FROM authors").then(data => res.json(data))
})

app.get('/testgetrecipes', (req, res) => {
    pool.query("SELECT * FROM recipes").then(data => res.json(data))
})

app.post("/setAuthors", (req, res) => {
    // filter json for authors
    const authorsList = data.items.filter((item) => {
        if(item.fields && item.fields.nickname) {
            return item;
        }
        return null
    })
    // insert authors in db
    for(var i=0; i<authorsList.length; i++){
        const adddate = authorsList[i].fields.addDate
        const birth = authorsList[i].fields.birthday
        const name = authorsList[i].fields.nickname
        const filename = authorsList[i].fields.profilePicture.fields.file.fileName
        /*  
            pool.query(`
            INSERT INTO authors (adddate, birthday, nickname, filename) values ($1, $2, $3, $4);`,
            [adddate, birth, name, filename])
        */
    }
    res.send(authorsList)
})

app.post("/setRecipes", (req, res) => {
    // filter for recipes in json
    const recipesList = data.items.filter((item) => {
        if(item.fields && item.fields.recipeName) {
            return item;
        }
    return null;
    })
    // insert recipes in db 
    for(var i=0; i<recipesList.length; i++){
        const addDate = recipesList[i].fields.addDate
        const recipeName = recipesList[i].fields.recipeName
        const ingredients = recipesList[i].fields.ingredients
        const tags = recipesList[i].fields.tags
        const description = recipesList[i].fields.description
        const fileName = recipesList[i].fields.picture[0].fields.file.fileName
        /*  
            pool.query(`
            INSERT INTO recipes (author_Id, addDate, recipeName, ingredients, tags, description, fileName) values ($1, $2, $3, $4, $5, $6, $7);`, 
            [1, addDate, recipeName, ingredients, tags, description, fileName])
        */
    }
        res.send(recipesList)
})

app.get('/dataJasonFile', (req, res) => {
    res.json(data)
})

app.get('/data', async (req, res) => {
    // get authors from db
    const authors = await pool.query("SELECT * FROM authors")
    // get recipes from db
    const recipes = await pool.query("SELECT * FROM recipes")
    
    // translate authors to contentful structure
    const dataAuthors = await authors.rows.map(author => 
        ({"fields": {
            "author_Id": author.authorid,
            "addDate": author.adddate,
            "birthday": author.birthday,
            "nickname": author.nickname,
            "profilePicture": {
                "fields":{
                    "file":{
                        "fileName": author.filename
                    }
                }
            }
        }})
    )
    
    // translate recipes to contentful structure
    const dataRecipes = await recipes.rows.map(recipe => 
        ({"fields": {
            "recipeId": recipe.recipeid,
            "author_Id": {
                "fields": {
                    "author_Id": recipe.author_id
                }
            },
            "addDate": recipe.adddate,
            "recipeName": recipe.recipename,
            "ingredients": recipe.ingredients,
            "tags": recipe.tags,
            "description": recipe.description,
            "picture": [
                {
                    "fields": {
                        "file": {
                            "fileName": recipe.filename
                        }
                    }
                }
            ]
        }})
    )
    
    // combine authors and recipes
    const data = {items:[...dataRecipes,...dataAuthors]}

    res.json(data)
})

app.listen(process.env.PORT ?? port, () => {
    console.log(`Example app listening on port ${port}`);
});

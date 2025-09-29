import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

// API URLs from TheCocktailDB
const API_BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1";

app.set("view engine", "ejs");
app.use(express.static("public"));

// Main route: Display a random cocktail AND the category list
app.get("/", async (req, res) => {
  try {
    const [cocktailResponse, categoryResponse, quoteResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/random.php`),
      axios.get(`${API_BASE_URL}/list.php?c=list`),
      // CHANGED: New API for quotes
      axios.get("https://zenquotes.io/api/random"), 
    ]);

    const cocktail = cocktailResponse.data.drinks[0];
    const categories = categoryResponse.data.drinks;
    // CHANGED: The new API returns an array, so we take the first element
    const quote = quoteResponse.data[0]; 

    res.render("index", {
      cocktail: cocktail,
      categories: categories,
      drinksList: null,
      quote: quote,
      error: null,
    });
  } catch (error) {
    console.error("Failed to fetch data:", error.message);
    res.render("index", {
      cocktail: null,
      categories: [],
      drinksList: null,
      quote: null,
      error: "Oops! Could not fetch data. Please try again.",
    });
  }
});
// Route to handle filtering by category
app.get("/filter", async (req, res) => {
  const selectedCategory = req.query.category;

  try {
    const [drinksResponse, categoryResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/filter.php?c=${selectedCategory}`),
        axios.get(`${API_BASE_URL}/list.php?c=list`),
      ]);

    const drinksList = drinksResponse.data.drinks;
    const categories = categoryResponse.data.drinks;

    res.render("index", {
      cocktail: null,
      categories: categories,
      drinksList: drinksList,
      selectedCategory: selectedCategory,
      quote: null, // ADD THIS: Pass null for the quote on the filter page
      error: null,
    });
  } catch (error) {
    console.error("Failed to filter by category:", error.message);
    res.render("index", {
        cocktail: null,
        categories: [],
        drinksList: null,
        quote: null, // ADD THIS: Also add it to the error case
        error: "Oops! Could not fetch that category. Please try again.",
      });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
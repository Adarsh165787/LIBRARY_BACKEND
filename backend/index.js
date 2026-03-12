const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// ================= DATABASE CONNECTION =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });


// ================= BOOK SCHEMA =================

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
    },

    isbn: {
      type: String,
      required: true,
      unique: true,
    },

    genre: {
      type: String,
      required: true,
    },

    publisher: {
      type: String,
      required: true,
    },

    publicationYear: {
      type: Number,
    },

    totalCopies: {
      type: Number,
      required: true,
      min: [1, "Total copies must be positive"],
    },

    availableCopies: {
      type: Number,
    },

    shelfLocation: {
      type: String,
    },

    bookType: {
      type: String,
      enum: ["Reference", "Circulating"],
    },

    status: {
      type: String,
      enum: ["Available", "Checked Out"],
      default: "Available",
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);


// ================= ROUTES =================


// CREATE BOOK
app.post("/books", async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// GET ALL BOOKS
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET BOOK BY ID
app.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// UPDATE BOOK
app.put("/books/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// DELETE BOOK
app.delete("/books/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// SEARCH BOOK BY TITLE
app.get("/books/search", async (req, res) => {
  try {
    const { title } = req.query;

    const books = await Book.find({
      title: { $regex: title, $options: "i" },
    });

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= SERVER =================

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
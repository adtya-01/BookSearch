
import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

const BookSearch = (props) => {
  // State variables using useState hook
  const [books, setBooks] = useState([]); // array of books from search results
  const [searchBook, setSearchBook] = useState(""); // search input value
  const [selectedBook, setSelectedBook] = useState(null); // currently selected book from search results
  const [isbn, setIsbn] = useState(""); // ISBN of currently selected book
  const [sortBy, setSortBy] = useState("title"); // sort by option (default is title)
  const [ascending, setAscending] = useState(true); // sort order (ascending or descending)
  const [isLoading, setIsLoading] = useState(false); // add isLoading state variable

  // useEffect hook to add and remove event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown); // add event listener to listen for "Backspace" key press
    return () => {
      document.removeEventListener("keydown", handleKeyDown); // remove event listener when component unmounts
    };
  }, []);

  // Function to handle search form submission
  const handleSearch = (event) => {
    event.preventDefault(); // prevent default form submission behavior
    if (searchBook.trim() !== "") {
      // make API call to Open Library search API
      setIsLoading(true); // set isLoading to true before fetching data
      axios
        .get(`http://openlibrary.org/search.json?q=${searchBook}`)
        .then((response) => {
          setBooks(response.data.docs); // update books state with search results
          setSelectedBook(null); // reset selectedBook and isbn state variables
          setIsbn("");
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error); // log error if API call fails
          setIsLoading(false); // set isLoading to false if there's an error fetching data
        });
    }
  };
  // Function to handle click on a book card
  const handleBookClick = (book) => {
    setSelectedBook(book); // update selectedBook state with clicked book
    setIsbn(book.isbn && book.isbn[0]); // update isbn state with ISBN of clicked book (if available)
  };

  // Function to handle click on "Back to Search" button or "Backspace" key press
  const handleBackButtonClick = () => {
    setSelectedBook(null); // reset selectedBook and isbn state variables
    setIsbn("");
  };

  // Function to handle "Backspace" key press
  const handleKeyDown = (event) => {
    if (event.key === "Backspace") {
      // check if "Backspace" key was pressed
      handleBackButtonClick(); // call handleBackButtonClick function to reset selectedBook and isbn state variables
    }
  };

  // Function to handle sort by select option change
  const handleSortByChange = (event) => {
    setSortBy(event.target.value); // update sortBy state with new select option value
  };

  // Sort books array based on current sortBy and ascending state values
  const sortedBooks = books.sort((a, b) => {
    if (sortBy === "ascending") {
      // sort by title ascending
      return ascending
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortBy === "descending") {
      // sort by title descending
      return ascending
        ? b.title.localeCompare(a.title)
        : a.title.localeCompare(b.title);
    } else if (sortBy === "published-ascending") {
      // sort by published date ascending
      return ascending
        ? a.first_publish_year - b.first_publish_year
        : b.first_publish_year - a.first_publish_year;
    } else if (sortBy === "published-descending") {
      // sort by published date descending
      return ascending
        ? b.first_publish_year - a.first_publish_year
        : a.first_publish_year - b.first_publish_year;
    } else {
      return 0;
    }
  });

  return (
    <div className="App">
      {!selectedBook && (
        <>
          <h1>Public Library</h1>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for a book"
              value={searchBook}
              onChange={(event) => setSearchBook(event.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </>
      )}
      
      {!selectedBook && (
        <div className="sort-by">
          <label htmlFor="sort-by-select">Sort by:</label>
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={handleSortByChange}
          >
            <option value="ascending">Title (A-Z)</option>
            <option value="descending">Title (Z-A)</option>
            <option value="published-ascending">
              Published Date (ascending)
            </option>
            <option value="published-descending">
              Published Date (descending)
            </option>
          </select>
        </div>
      )}

      {isLoading ? (
        <p className="loading">Loading....</p>
      ) : selectedBook ? (
        <div className="selected-book">
          <h2>{selectedBook.title}</h2>
          <img
            src={`http://covers.openlibrary.org/b/id/${selectedBook.cover_i}-M.jpg`}
            alt={selectedBook.title}
          />
          <p className="book-details">
            <strong>Author:</strong>{" "}
            {selectedBook.author_name && selectedBook.author_name.join(", ")}
          </p>
          <p className="book-details">
            <strong>Published Date:</strong> {selectedBook.first_publish_year}
          </p>
          <p className="book-details">
            <strong>Total Editions:</strong> {selectedBook.edition_count}
          </p>
          <button
            onClick={handleBackButtonClick}
            onKeyDown={handleKeyDown}
            className="back-button"
          >
            Back to Search
          </button>
        </div>
      ) : (
        <div className="book-list">
          {sortedBooks.length > 0 ? (
            sortedBooks.map((book) => (
              <div
                key={book.key}
                onClick={() => handleBookClick(book)}
                className="book-card"
              >
                <h3 className="book-title">{book.title}</h3>
                <img
                  src={`http://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                  alt={book.title}
                  className="book-cover"
                />
              </div>
            ))
          ) : (
            <p>No books found</p>
          )}
        </div>
      )}
    </div>
  );
};
export default BookSearch;

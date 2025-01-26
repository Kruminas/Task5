import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [region, setRegion] = useState('en-US');
  const [seed, setSeed] = useState('');
  const [likes, setLikes] = useState(0.0);
  const [reviews, setReviews] = useState(0.0);

  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const generateRandomSeed = () => Math.floor(Math.random() * 10000000).toString();

  useEffect(() => {
    // Reset state when filters change
    setPage(1);
    setBooks([]);
    setHasMore(true);
  }, [region, seed, likes, reviews]);

  useEffect(() => {
    if (!hasMore && page > 1) return;

    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          region,
          seed,
          likes: likes.toString(),
          reviews: reviews.toString(),
          page: page.toString(),
        }).toString();

        const response = await fetch(`http://localhost:3001/api/books?${params}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setBooks((prevBooks) => [...prevBooks, ...data]);
        }
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [page, region, seed, likes, reviews, hasMore]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (!isLoading && hasMore) {
        setPage((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="container my-4" onScroll={handleScroll} style={{ height: '80vh', overflowY: 'auto' }}>
      <h1 className="text-center mb-4">Random Books Generator</h1>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <label htmlFor="region-select" className="form-label">Language</label>
          <select
            id="region-select"
            className="form-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="en-US">English (US)</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        <div className="col-md-3 mb-3">
          <label htmlFor="seed-input" className="form-label">Seed</label>
          <div className="input-group">
            <input
              id="seed-input"
              type="text"
              className="form-control"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
            <button className="btn btn-outline-secondary" onClick={() => setSeed(generateRandomSeed())}>
              🔀
            </button>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <label htmlFor="likes-slider" className="form-label">Likes: {likes}</label>
          <input
            id="likes-slider"
            type="range"
            className="form-range"
            min="0"
            max="10"
            step="0.1"
            value={likes}
            onChange={(e) => setLikes(parseFloat(e.target.value))}
          />
        </div>
        <div className="col-md-3 mb-3">
          <label htmlFor="reviews-input" className="form-label">Reviews</label>
          <input
            id="reviews-input"
            type="number"
            className="form-control"
            step="0.1"
            value={reviews}
            onChange={(e) => setReviews(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>ISBN</th>
              <th>Title</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>Likes</th>
              <th>Reviews</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.index}</td>
                <td>{book.isbn}</td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.publisher}</td>
                <td>{book.likes}</td>
                <td>{book.reviews.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isLoading && (
        <div className="text-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!hasMore && !isLoading && (
        <div className="alert alert-info text-center">No more books to load.</div>
      )}
    </div>
  );
}

export default App;
const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const LIST_STATE = {
  gridMoviesState: "gridMovieState",
  listMoviesState: "listMoviesState"
};

let currentState = "";
const movies = [];
let filteredMovies = [];
const MOVIES_PER_PAGE = 12;

const gridmovies = document.querySelector("#gridMovies");
const listmovies = document.querySelector("#listMovies");
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const mylovelist = document.querySelector(".mylovelist");

function listStyle(data) {
  let rawHTML = "";
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  list;
  data.forEach((item) => {
    //title, id 隨著每個item改變
    let heartIcon;
    if (list.some((movie) => movie.id === item.id)) {
      heartIcon = `<i class="fa-solid fa-heart mylovelist " data-id="${item.id}"></i>`;
    } else {
      heartIcon = `<i class="fa-regular fa-heart mylovelist " data-id="${item.id}"></i>`;
    }
    rawHTML += `
    <div>
      <ul class="list-group">
        <li class="list-group-item"  data-id="${item.id}">${item.title}
        <nav>
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
        ${heartIcon}
        </nav>
        </li>     
      </ul>
    </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

function renderMovieList(data) {
  let rawHTML = "";
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  list;
  data.forEach((item) => {
    let heartIcon;
    // title, image, id 隨著每個 item 改變
    if (list.some((movie) => movie.id === item.id)) {
      heartIcon = `<i class="fa-solid fa-heart mylovelist gridheart" data-id="${item.id}"></i>`;
    } else {
      heartIcon = `<i class="fa-regular fa-heart mylovelist gridheart" data-id="${item.id}"></i>`;
    }
    rawHTML += `<div class="col-sm-2">
    <div class="mb-2">
      <div class="card">
      <div class="card-post">
${heartIcon}
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        </div>
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
      }">More</button>
        </div>
      </div>
    </div>
  </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
  });
}

function getMoviesByPage(page) {
  //新增這裡
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  //修改這裡
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  //製作 template
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  const index = list.findIndex((item) => item.id === id);
  if (index !== -1) {
    list.splice(index, 1);
  } else {
    list.push(movie);
  }
  event.target.classList.toggle("fa-regular");
  event.target.classList.toggle("fa-solid");
  checkFavoriteState(id);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 監聽 data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".mylovelist")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filteredMovies.length);

  //預設顯示第 1 頁的搜尋結果
  if (currentState === LIST_STATE.listMoviesState) {
    listStyle(getMoviesByPage(1));
  } else {
    renderMovieList(getMoviesByPage(1));
  }
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page);
  //更新畫面
  if (currentState === LIST_STATE.listMoviesState) {
    listStyle(getMoviesByPage(page));
  } else {
    renderMovieList(getMoviesByPage(page));
  }
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => console.log(err));

gridmovies.addEventListener("click", function switchToGrid(event) {
  if (event.target.matches("#gridmovies")) {
    return;
  } else {
    axios
      .get(INDEX_URL)
      .then((response) => {
        movies.length = 0;
        const newMovieList = response.data.results;
        movies.push(...newMovieList);
        renderPaginator(movies.length);
        renderMovieList(getMoviesByPage(1));
        currentState = LIST_STATE.gridMoviesState;
        if (filteredMovies.length > 0) {
          renderPaginator(filteredMovies.length);
        }
      })
      .catch((err) => console.log(err));
  }
});

listmovies.addEventListener("click", function switchToList(event) {
  if (event.target.matches("#listmovies")) {
    return;
  } else {
    axios
      .get(INDEX_URL)
      .then((response) => {
        movies.length = 0;
        const newMovieList = response.data.results;
        movies.push(...newMovieList);
        renderPaginator(movies.length);
        listStyle(getMoviesByPage(1));
        currentState = LIST_STATE.listMoviesState;
        if (filteredMovies.length > 0) {
          renderPaginator(filteredMovies.length);
        }
      })
      .catch((err) => console.log(err));
  }
});

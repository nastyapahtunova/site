let titleInput = document.querySelector("#title");
let genreInput = document.querySelector("#genre");
let releaseYearInput = document.querySelector("#realeseYear");
let isWatchedInput = document.querySelector("#isWatched");
let id = null;
let filmForm = document.querySelector(".film-form");
let submit = document.querySelector("#submit");
let cancel = document.querySelector(".cancel");
let sort = document.querySelector(".sort");
let select = document.querySelector(".select");

const validator = new JustValidate(".film-form");
validator
  .addField("#title", [
    { rule: "required", errorMessage: "Введите название фильма" },
  ])
  .addField("#genre", [
    { rule: "required", errorMessage: "Введите жанр фильма" },
  ])
  .addField("#realeseYear", [
    { rule: "required", errorMessage: "Введите год выпуска фильма" },
  ])
  .onSuccess(() => {
    let title = titleInput.value;
    let genre = genreInput.value;
    let releaseYear = releaseYearInput.value;
    let isWatched = isWatchedInput.checked;

    let film = {
      id: id ? id : Date.now(),
      title,
      genre,
      releaseYear,
      isWatched,
    };

    if (id) {
      editFilmToLocalStorage(film, id);
    } else {
      addFilmToLocalStorage(film);
    }
    filmForm.reset();
  });

function addFilmToLocalStorage(film) {
  let films = JSON.parse(localStorage.getItem("films")) || [];
  films.push(film);
  localStorage.setItem("films", JSON.stringify(films));
  renderTable();
  sendLeadToRoistat(film);
}

function editFilmToLocalStorage(film, id) {
  let films = JSON.parse(localStorage.getItem("films")) || [];
  films = films.map((filmEl) => (filmEl.id === id ? film : filmEl));
  localStorage.setItem("films", JSON.stringify(films));
  submit.textContent = "Добавить";
  cancel.style.display = "none";
  renderTable();
  sendLeadToRoistat(film);
}

function sendLeadToRoistat(film) {
  fetch("https://cloud.roistat.com/api/proxy/1.0/leads/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roistat: window.roistatVisit || "",
      key: "7ed059ed206579a5cbb1ac6be2d0571e4" ,
      title: "Добавлен или обновлён фильм",
      name: film.title,
      fields: {
        genre: film.genre,
        releaseYear: film.releaseYear,
        isWatched: film.isWatched ? "Да" : "Нет",
      },
    }),
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Ошибка отправки в Roistat");
      }
    })
    .catch((error) => {
      console.error("Ошибка отправки в Roistat:", error);
    });
}

function renderTable() {
  let films = JSON.parse(localStorage.getItem("films")) || [];
  let filmTableBody = document.querySelector(".film-tbody");
  filmTableBody.innerHTML = "";
  films.forEach((film) => {
    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${film.title}</td>
      <td>${film.genre}</td>
      <td>${film.releaseYear}</td>
      <td>${film.isWatched ? "Да" : "Нет"}</td>
    `;

    let btnDel = document.createElement("button");
    btnDel.textContent = "Удалить";
    row.appendChild(btnDel);

    let btnAddit = document.createElement("button");
    btnAddit.textContent = "Редактировать";
    row.appendChild(btnAddit);

    filmTableBody.append(row);

    btnDel.onclick = () => {
      const sortFilms = films.filter((i) => i.id !== film.id);
      localStorage.setItem("films", JSON.stringify(sortFilms));
      renderTable();
    };

    btnAddit.onclick = () => {
      titleInput.value = film.title;
      genreInput.value = film.genre;
      releaseYearInput.value = film.releaseYear;
      isWatchedInput.checked = film.isWatched;
      id = film.id;

      submit.textContent = "Обновить";
      cancel.style.display = "block";
    };
  });
}

sort.onclick = () => {
  let sortCh = select.value;
  let films = JSON.parse(localStorage.getItem("films")) || [];
  if (sortCh == "title") {
    films = films.sort((a, b) => a.title.localeCompare(b.title, "ru"));
  } else if (sortCh == "genre") {
    films = films.sort((a, b) => a.genre.localeCompare(b.genre, "ru"));
  } else {
    films = films.sort((a, b) => a.releaseYear - b.releaseYear);
  }
  localStorage.setItem("films", JSON.stringify(films));
  renderTable();
};

cancel.onclick = () => {
  submit.textContent = "Добавить";
  cancel.style.display = "none";
  filmForm.reset();
};

renderTable();

// URL de la API de Disney para obtener información de personajes
const urlCharacters = "https://api.disneyapi.dev/character";
// Elementos del DOM
const formulario = document.getElementById("busqueda");
const inputConsulta = document.getElementById("consulta");
const tipoBusqueda = document.getElementById("tipoBusqueda");
const resultadosContainer = document.getElementById("resultados");
const templateCard = document.getElementById("template-card").content;
const templateEpisode = document.getElementById("template-episode").content;
const fragment = document.createDocumentFragment();

// Evento de envío del formulario
formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    const consulta = inputConsulta.value.trim();
    const tipo = tipoBusqueda.value;
    buscar(consulta, tipo);
});

// Función principal de búsqueda
function buscar(consulta, tipo) {
    if (tipo === "nombre") {
        // Obtener personajes por nombre
        getCharactersByName(consulta)
            .then((results) => {
                if (results && results.data && results.data.length > 0) {
                    // Si hay resultados, pintar los personajes
                    pintarPersonajes(results);
                } else {
                    // Si no hay resultados, mostrar mensaje de error
                    mostrarError("No se encontraron personajes con ese nombre");
                }
            })
            .catch((error) => {
                // En caso de error, mostrar mensaje de error
                console.error(error);
                mostrarError("Hubo un error al buscar personajes. Por favor, intenta de nuevo");
            });
    } else if (tipo === "pelicula") {
        // Obtener personajes por película
        getCharactersByMovies(consulta).then((characters) => {
            if (characters && characters.length > 0) {
                // Si hay resultados, pintar los personajes
                pintarPersonajes({ data: characters });
            } else {
                // Si no hay resultados, mostrar mensaje de error
                mostrarError("No se encontraron personajes para esa película");
            }
        })
            .catch((error) => {
                // En caso de error, mostrar mensaje de error
                console.error(error);
                mostrarError("Hubo un error al buscar películas. Por favor, intenta de nuevo");
            });
    } else if (tipo === "videojuego") {
        // Obtener personajes por videojuego
        getCharactersByVideojuego(consulta)
            .then((characters) => {
                if (characters && characters.length > 0) {
                    // Si hay resultados, pintar los personajes
                    pintarPersonajes({ data: characters });
                } else {
                    // Si no hay resultados, mostrar mensaje de error
                    mostrarError("No se encontraron personajes para ese videojuego");
                }
            })
            .catch((error) => {
                // En caso de error, mostrar mensaje de error
                console.error(error);
                mostrarError("Hubo un error al buscar videojuegos. Por favor, intenta de nuevo.");
            });
    }
    // Se pueden agregar más condiciones según sea necesario para otros tipos de búsqueda
}

// Función asincrónica para obtener personajes por nombre
async function getCharactersByName(name) {
    try {
        const urlFetch = `${urlCharacters}?name=${name}`;
        const response = await fetch(urlFetch);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error al obtener los personajes. Por favor, intenta de nuevo.");
    }
}

// Función asincrónica para obtener personajes por película
async function getCharactersByMovies(movie) {
    try {
        const urlFetch = `${urlCharacters}?films=${movie}`;
        const response = await fetch(urlFetch);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error al obtener los personajes. Por favor, intenta de nuevo.");
    }
}

// Función asincrónica para obtener personajes por videojuego
async function getCharactersByVideojuego(videojuego) {
    try {
        const urlFetch = `${urlCharacters}?videoGames=${videojuego}`;
        const response = await fetch(urlFetch);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error al obtener los personajes. Por favor, intenta de nuevo.");
    }
}

// Función para mostrar botones de detalle para un personaje
async function mostrarBotonesDetalle(personaje) {
    limpiarDetalles();

    const detalleButtons = document.createElement("div");
    detalleButtons.classList.add("detalle-buttons", "row", "mt-2");

    try {
        // Botón para mostrar películas relacionadas al personaje
        const peliculasButton = document.createElement("button");
        peliculasButton.classList.add("col-4", "btn", "btn-primary", "mr-2");
        peliculasButton.textContent = "Películas";
        peliculasButton.addEventListener("click", async () => {
            limpiarDetalles();

            try {
                // Obtener películas relacionadas al personaje
                const movies = await getMoviesByCharacter(personaje.id);
                pintarPeliculas(movies);

                // Generar enlaces para redirigir a la información detallada de cada película
                movies.forEach((movie) => {
                    const movieLink = document.createElement("a");
                    movieLink.href = `#`;  // Reemplaza "#" con la URL real de la información detallada de la película
                    movieLink.textContent = `Ver detalles de ${movie}`;
                    movieLink.addEventListener("click", (event) => {
                        event.preventDefault();
                        mostrarDetallesPelicula(movie);  // Agrega una función para mostrar detalles de la película
                    });
                    resultadosContainer.appendChild(movieLink);
                });
            } catch (error) {
                console.error(error);
                resultadosContainer.textContent = "Hubo un error al obtener las películas. Por favor, intenta de nuevo.";
            }
        });

        // Botón para mostrar series de TV relacionadas al personaje
        const seriesButton = document.createElement("button");
        seriesButton.classList.add("col-4", "btn", "btn-primary");
        seriesButton.textContent = "Series de TV";
        seriesButton.addEventListener("click", () => {
            limpiarDetalles();
            pintarSeries(personaje.tvShows);
        });

        detalleButtons.appendChild(peliculasButton);
        detalleButtons.appendChild(seriesButton);

        resultadosContainer.appendChild(detalleButtons);
    } catch (error) {
        console.error(error);
        resultadosContainer.textContent = "Hubo un error al mostrar los botones de detalle. Por favor, intenta de nuevo.";
    }
}

// Función para pintar tarjetas de personajes en el contenedor de resultados
function pintarPersonajes(personajes) {
    limpiarPersonajes();
    personajes.data.forEach((personaje) => {
        const clone = templateCard.cloneNode(true);
        clone.querySelector("img").setAttribute("src", personaje.imageUrl);
        clone.querySelector("img").setAttribute("alt", personaje.name);
        clone.querySelector("h5").textContent = personaje.name;

        let listaP = clone.querySelectorAll("p");
        listaP[0].textContent = `Películas: ${personaje.films.join(", ")}`;
        listaP[1].textContent = `Series de TV: ${personaje.tvShows.join(", ")}`;
        listaP[2].textContent = `Videojuegos: ${personaje.videoGames.join(", ")}`;

        clone.querySelector(".card-body").addEventListener("click", () => {
            limpiarDetalles();
            mostrarBotonesDetalle(personaje);
        });

        // Agregar botón de Películas a la tarjeta del personaje
        const peliculasButton = document.createElement("button");
        peliculasButton.classList.add("btn", "btn-primary", "mt-2");
        peliculasButton.textContent = "Películas";
        peliculasButton.addEventListener("click", () => {
            limpiarDetalles();
            pintarPeliculas(personaje.films);
        });

        clone.querySelector(".card-body").appendChild(peliculasButton);

        fragment.appendChild(clone);
    });
    resultadosContainer.appendChild(fragment);
}

// Función para mostrar mensaje de error en el contenedor de resultados
function mostrarError(mensaje) {
    limpiarResultados();

    const mensajeError = document.createElement("div");
    mensajeError.classList.add("mensaje-error");
    mensajeError.textContent = mensaje;

    resultadosContainer.appendChild(mensajeError);
}

// Función para limpiar el contenedor de resultados
function limpiarResultados() {
    resultadosContainer.textContent = "";
}

// Función para pintar películas en el contenedor de resultados
function pintarPeliculas(peliculas) {
    limpiarEpisodios();
    peliculas.forEach((pelicula) => {
        const clone = templateEpisode.cloneNode(true);
        clone.querySelector(".card-title").textContent = `Película: ${pelicula}`;
        fragment.appendChild(clone);
    });
    resultadosContainer.appendChild(fragment);
}

// Función para pintar series de TV en el contenedor de resultados
function pintarSeries(series) {
    limpiarEpisodios();
    series.forEach((serie) => {
        const clone = templateEpisode.cloneNode(true);
        clone.querySelector(".card-title").textContent = `Serie de TV: ${serie}`;
        fragment.appendChild(clone);
    });
    resultadosContainer.appendChild(fragment);
}

// Función para limpiar los botones de detalle en el contenedor de resultados
function limpiarDetalles() {
    const detalleButtons = document.querySelector(".detalle-buttons");
    if (detalleButtons) {
        detalleButtons.remove();
    }
}

// Función para limpiar el contenedor de episodios
function limpiarEpisodios() {
    resultadosContainer.textContent = "";
}

// Función para limpiar el contenedor de personajes
function limpiarPersonajes() {
    resultadosContainer.textContent = "";
}

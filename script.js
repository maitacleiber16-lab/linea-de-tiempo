document.addEventListener("DOMContentLoaded", () => {
    // 1. GESTIÓN DEL MODO OSCURO
    const btnModo = document.getElementById("btn-modo");
    const currentTheme = localStorage.getItem("theme") || "dark";

    if (currentTheme === "dark") {
        document.body.classList.add("dark-mode");
        if (btnModo) btnModo.textContent = "☀️ Modo";
    } else {
        document.body.classList.remove("dark-mode");
        if (btnModo) btnModo.textContent = "🌙 Modo";
    }

    if (btnModo) {
        btnModo.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            let theme = "light";
            if (document.body.classList.contains("dark-mode")) {
                theme = "dark";
                btnModo.textContent = "☀️ Modo";
            } else {
                btnModo.textContent = "🌙 Modo";
            }
            localStorage.setItem("theme", theme);
        });
    }

    // FUNCIÓN PARA TRANSICIÓN SUAVE DE SALIDA ANTES DE CAMBIAR DE PÁGINA
    function navegarConTransicion(urlDestino) {
        document.body.classList.add("fade-out");
        setTimeout(() => {
            window.location.href = urlDestino;
        }, 330); // Coincide con la duración de la animación CSS
    }

    // Interceptar clics en los enlaces del menú de navegación
    document.querySelectorAll(".navbar a").forEach(enlace => {
        enlace.addEventListener("click", (e) => {
            const destino = enlace.getAttribute("href");
            if (destino && destino.endsWith(".html")) {
                e.preventDefault();
                navegarConTransicion(destino);
            }
        });
    });

    // 2. BOTONES DE REDIRECCIÓN ESPECÍFICOS
    const btnRedirigir = document.getElementById("btn-redirigir");
    const btnVolver = document.getElementById("btn-volver");
    const btnVolverTimeline = document.getElementById("btn-volver-timeline");

    if (btnRedirigir) {
        btnRedirigir.addEventListener("click", () => {
            navegarConTransicion("linea-tiempo.html");
        });
    }

    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            navegarConTransicion("index.html");
        });
    }

    if (btnVolverTimeline) {
        btnVolverTimeline.addEventListener("click", () => {
            navegarConTransicion("linea-tiempo.html");
        });
    }

    // 3. CARGA DINÁMICA DE LA LÍNEA DE TIEMPO DESDE LA BASE DE DATOS
    const timelineContainer = document.getElementById("timeline-container");
    
    if (timelineContainer) {
        const URL_BASE_DATOS = "https://docs.google.com/spreadsheets/d/1YTJLBLimbt5nHDU_P7oRsXbJeFqYR0k9hMpn0U1NUEE/export?format=csv&gid=0";

        fetch(URL_BASE_DATOS)
            .then(response => response.text())
            .then(csvText => {
                const filas = csvText.trim().split("\n");
                const cabeceras = filas[0].split(",").map(h => h.trim());
                
                const eventosData = filas.slice(1).map(fila => {
                    const valores = fila.split(",");
                    let eventoObj = {};
                    cabeceras.forEach((cabecera, index) => {
                        eventoObj[cabecera] = valores[index] ? valores[index].trim() : "";
                    });
                    return eventoObj;
                });

                timelineContainer.innerHTML = ""; // Limpiamos contenedor

                eventosData.forEach((evento, index) => {
                    const clasePosicion = index % 2 === 0 ? "izquierda" : "derecha";
                    
                    const imagenHTML = evento.imagen && evento.imagen.trim() !== "" 
                        ? `<img src="${evento.imagen}" alt="${evento.titulo}" class="img-evento">` 
                        : "";

                    const article = document.createElement("article");
                    article.className = `evento ${clasePosicion}`;
                    
                    article.innerHTML = `
                        <div class="contenido">
                            <span class="tooltip-contexto">💡 Presiona para ver detalles</span>
                            ${imagenHTML}
                            <span class="fecha">${evento.fecha}</span>
                            <h3>${evento.titulo}</h3>
                            <p class="contexto-breve">${evento.contextoBreve}</p>
                        </div>
                    `;

                    article.addEventListener("click", () => {
                        localStorage.setItem("eventoSeleccionado", JSON.stringify(evento));
                        navegarConTransicion("detalle.html");
                    });

                    timelineContainer.appendChild(article);
                });
            })
            .catch(error => {
                console.error("Error al conectar con la base de datos:", error);
                timelineContainer.innerHTML = `<p style="text-align: center; color: #94a3b8; grid-column: 1/-1;">Error al cargar los eventos desde la base de datos. Verifica tu enlace.</p>`;
            });
    }
});
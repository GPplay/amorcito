// APP.JS - LÓGICA ROMÁNTICA Y MAPA INTERACTIVO DE COLOMBIA

document.addEventListener('DOMContentLoaded', () => {
    iniciarParticulas();
    iniciarContadorAmor();
    iniciarReproductorMusica();
    iniciarLightbox();
    iniciarMapaColombia();
});

/* ==========================================================================
   1. PARTÍCULAS FLOTANTES DE CORAZONES Y PÉTALOS
   ========================================================================== */
function iniciarParticulas() {
    const canvas = document.getElementById('canvas-corazones');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particulas = [];
    let animacionId;
    let activo = true;

    function redimensionar() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    redimensionar();
    window.addEventListener('resize', redimensionar);

    class Particula {
        constructor() {
            this.reiniciar();
        }
        reiniciar() {
            this.x = Math.random() * canvas.width;
            this.y = -20 - Math.random() * 50;
            this.tamano = 8 + Math.random() * 14;
            this.velocidadY = 0.8 + Math.random() * 1.5;
            this.velocidadX = (Math.random() - 0.5) * 1.2;
            this.rotacion = Math.random() * Math.PI * 2;
            this.velocidadRotacion = (Math.random() - 0.5) * 0.03;
            this.opacidad = 0.3 + Math.random() * 0.5;
            this.esCorazon = Math.random() > 0.4;
            this.color = Math.random() > 0.5 ? '#e55c7b' : '#ff8fa3';
        }
        actualizar() {
            this.y += this.velocidadY;
            this.x += this.velocidadX + Math.sin(this.y * 0.01) * 0.5;
            this.rotacion += this.velocidadRotacion;
            if (this.y > canvas.height + 30) {
                this.reiniciar();
            }
        }
        dibujar() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotacion);
            ctx.globalAlpha = this.opacidad;
            ctx.fillStyle = this.color;

            if (this.esCorazon) {
                const s = this.tamano / 15;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-5 * s, -10 * s, -15 * s, -5 * s, -15 * s, 5 * s);
                ctx.bezierCurveTo(-15 * s, 15 * s, 0, 22 * s, 0, 26 * s);
                ctx.bezierCurveTo(0, 22 * s, 15 * s, 15 * s, 15 * s, 5 * s);
                ctx.bezierCurveTo(15 * s, -5 * s, 5 * s, -10 * s, 0, 0);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.ellipse(0, 0, this.tamano * 0.5, this.tamano, Math.PI / 4, 0, 2 * Math.PI);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    const cantidad = window.innerWidth < 768 ? 22 : 45;
    for (let i = 0; i < cantidad; i++) {
        const p = new Particula();
        p.y = Math.random() * canvas.height;
        particulas.push(p);
    }

    function animar() {
        if (!activo) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particulas.forEach(p => {
            p.actualizar();
            p.dibujar();
        });
        animacionId = requestAnimationFrame(animar);
    }
    animar();

    const btnCorazones = document.getElementById('btn-toggle-corazones');
    if (btnCorazones) {
        btnCorazones.addEventListener('click', () => {
            activo = !activo;
            btnCorazones.classList.toggle('activo', activo);
            if (activo) {
                animar();
            } else {
                cancelAnimationFrame(animacionId);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
    }
}

/* ==========================================================================
   2. REPRODUCTOR DE MÚSICA ROMÁNTICA (AUDIO ELEMENT O SYNTH ACÚSTICO)
   ========================================================================== */
function iniciarReproductorMusica() {
    const btnMusica = document.getElementById('btn-musica');
    const audioTag = document.getElementById('musica-fondo');
    let reproduciendo = false;
    let audioCtx = null;
    let synthTimer = null;

    function reproducirMelodiaAcustica() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!audioCtx) audioCtx = new AudioContext();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            // Melodía romántica y relajante
            const notas = [261.63, 329.63, 392.00, 493.88, 440.00, 293.66, 369.99, 523.25];
            const acordes = [
                [0, 1, 2, 3], // Cmaj7
                [4, 0, 1, 2], // Am7
                [5, 2, 6, 4], // D7 / F#
                [2, 1, 3, 5]  // G7
            ];
            let compas = 0;

            function tocarArpegio() {
                if (!reproduciendo) return;
                const acorde = acordes[compas % acordes.length];
                acorde.forEach((notaIdx, idx) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(notas[notaIdx], audioCtx.currentTime + idx * 0.4);

                    gain.gain.setValueAtTime(0, audioCtx.currentTime + idx * 0.4);
                    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + idx * 0.4 + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + idx * 0.4 + 1.6);

                    osc.connect(gain);
                    gain.connect(audioCtx.destination);

                    osc.start(audioCtx.currentTime + idx * 0.4);
                    osc.stop(audioCtx.currentTime + idx * 0.4 + 1.8);
                });
                compas++;
                synthTimer = setTimeout(tocarArpegio, 2400);
            }
            tocarArpegio();
        } catch (e) {
            console.log('Audio contextual no soportado o bloqueado.');
        }
    }

    if (btnMusica) {
        btnMusica.addEventListener('click', () => {
            reproduciendo = !reproduciendo;
            btnMusica.classList.toggle('activo', reproduciendo);

            if (audioTag && audioTag.src && audioTag.src !== window.location.href) {
                if (reproduciendo) {
                    audioTag.play().catch(() => reproducirMelodiaAcustica());
                } else {
                    audioTag.pause();
                }
            } else {
                if (reproduciendo) {
                    reproducirMelodiaAcustica();
                } else {
                    if (synthTimer) clearTimeout(synthTimer);
                    if (audioCtx) audioCtx.suspend();
                }
            }
        });
    }
}

/* ==========================================================================
   3. CONTADOR DE AMOR EN TIEMPO REAL
   ========================================================================== */
function iniciarContadorAmor() {
    const elDias = document.getElementById('contador-dias');
    const elHoras = document.getElementById('contador-horas');
    const elMinutos = document.getElementById('contador-minutos');
    const elSegundos = document.getElementById('contador-segundos');
    const btnFecha = document.getElementById('btn-cambiar-fecha');

    let fechaInicioStr = localStorage.getItem('amorcito_fecha_aniversario');
    // Si no está definida o si tenía la fecha provisional previa '2024-01-01', fijar al 9 de marzo de 2025
    if (!fechaInicioStr || fechaInicioStr.startsWith('2024-01-01')) {
        fechaInicioStr = '2025-03-09T00:00:00';
        try {
            localStorage.setItem('amorcito_fecha_aniversario', fechaInicioStr);
        } catch (e) {}
    }

    function actualizar() {
        const inicio = new Date(fechaInicioStr).getTime();
        const ahora = new Date().getTime();
        let diferencia = ahora - inicio;

        if (diferencia < 0) diferencia = 0;

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        if (elDias) elDias.textContent = dias;
        if (elHoras) elHoras.textContent = String(horas).padStart(2, '0');
        if (elMinutos) elMinutos.textContent = String(minutos).padStart(2, '0');
        if (elSegundos) elSegundos.textContent = String(segundos).padStart(2, '0');
    }

    actualizar();
    setInterval(actualizar, 1000);

    if (btnFecha) {
        btnFecha.addEventListener('click', () => {
            const nuevaFecha = prompt('Ingresa la fecha de nuestro aniversario (Formato: AAAA-MM-DD):', fechaInicioStr.substring(0, 10));
            if (nuevaFecha && !isNaN(new Date(nuevaFecha).getTime())) {
                fechaInicioStr = nuevaFecha + 'T00:00:00';
                localStorage.setItem('amorcito_fecha_aniversario', fechaInicioStr);
                actualizar();
            }
        });
    }
}

/* ==========================================================================
   4. VISOR LIGHTBOX PARA FOTOS CON NAVEGACIÓN Y SWIPE
   ========================================================================== */
function iniciarLightbox() {
    const modal = document.getElementById('lightbox-modal');
    const imgModal = document.getElementById('lightbox-img');
    const captionModal = document.getElementById('lightbox-caption');
    const btnCerrar = document.getElementById('lightbox-cerrar');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');

    if (!modal) return;

    const elementosFoto = Array.from(document.querySelectorAll('.tarjeta-foto, .polaroid-principal'));
    let indiceActual = 0;

    function abrir(indice) {
        indiceActual = indice;
        const item = elementosFoto[indiceActual];
        const img = item.querySelector('img');
        const pie = item.querySelector('.foto-pie p') || item.querySelector('.polaroid-caption');

        imgModal.src = img.src;
        captionModal.textContent = pie ? pie.textContent : 'Nuestro amor ❤️';
        modal.classList.add('activo');
        document.body.style.overflow = 'hidden';
    }

    function cerrar() {
        modal.classList.remove('activo');
        document.body.style.overflow = 'auto';
    }

    function siguiente() {
        indiceActual = (indiceActual + 1) % elementosFoto.length;
        abrir(indiceActual);
    }

    function anterior() {
        indiceActual = (indiceActual - 1 + elementosFoto.length) % elementosFoto.length;
        abrir(indiceActual);
    }

    elementosFoto.forEach((elem, idx) => {
        elem.addEventListener('click', () => abrir(idx));
    });

    if (btnCerrar) btnCerrar.addEventListener('click', cerrar);
    if (btnNext) btnNext.addEventListener('click', siguiente);
    if (btnPrev) btnPrev.addEventListener('click', anterior);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrar();
    });

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('activo')) return;
        if (e.key === 'Escape') cerrar();
        if (e.key === 'ArrowRight') siguiente();
        if (e.key === 'ArrowLeft') anterior();
    });

    // Soporte táctil (Swipe)
    let touchStartX = 0;
    let touchEndX = 0;
    modal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    modal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) siguiente();
        if (touchEndX - touchStartX > 50) anterior();
    }, { passive: true });
}

/* ==========================================================================
   5. MAPA INTERACTIVO DE COLOMBIA (LEAFLET + GEOJSON)
   ========================================================================== */
function iniciarMapaColombia() {
    const contenedor = document.getElementById('mapa-colombia');
    if (!contenedor || typeof L === 'undefined') return;

    const esMovil = window.innerWidth < 768;
    const mapa = L.map('mapa-colombia', {
        center: [4.5709, -73.8],
        zoom: esMovil ? 4.9 : 5.8,
        minZoom: 4.5,
        maxZoom: 9,
        scrollWheelZoom: false
    });

    // Capa base limpia y elegante
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB &copy; OpenStreetMap',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mapa);

    function procesarGeoJson(data) {
        let totalDeptos = data.features.length;
        let visitadosCount = 0;

        data.features.forEach(f => {
            if (f.properties.visited) visitadosCount++;
        });

        // Actualizar barra de progreso
        const barra = document.getElementById('progreso-viajes');
        const textoProgreso = document.getElementById('texto-progreso-viajes');
        const porcentaje = Math.round((visitadosCount / totalDeptos) * 100);
        if (barra) barra.style.width = porcentaje + '%';
        if (textoProgreso) {
            textoProgreso.innerHTML = `<strong>${visitadosCount}</strong> de <strong>${totalDeptos}</strong> departamentos visitados (${porcentaje}%) 💕`;
        }

        // Estilos por departamento
        function estiloDepto(feature) {
            const visitado = feature.properties.visited;
            return {
                fillColor: visitado ? '#e55c7b' : '#ffccd5',
                weight: visitado ? 2.5 : 1.2,
                opacity: 1,
                color: visitado ? '#b32244' : '#f09ab0',
                fillOpacity: visitado ? 0.78 : 0.4
            };
        }

        // Capa GeoJSON
        const geojsonLayer = L.geoJson(data, {
            style: estiloDepto,
            onEachFeature: (feature, layer) => {
                const props = feature.properties;
                const nombre = props.NOMBRE_DPT;
                const esVisitado = props.visited;
                const nota = props.note || '';

                const popupHtml = `
                    <div class="contenido-popup-depto">
                        <h4>${nombre}</h4>
                        <span class="badge-status ${esVisitado ? 'visitado' : 'pendiente'}">
                            ${esVisitado ? '❤️ ¡Ya lo visitamos!' : '✈️ Próximo destino'}
                        </span>
                        <p>${nota}</p>
                    </div>
                `;

                layer.bindPopup(popupHtml, {
                    className: 'popup-romantico',
                    closeButton: false
                });

                layer.on({
                    mouseover: (e) => {
                        const l = e.target;
                        l.setStyle({
                            weight: 3,
                            color: '#e55c7b',
                            fillOpacity: 0.85
                        });
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            l.bringToFront();
                        }
                    },
                    mouseout: (e) => {
                        geojsonLayer.resetStyle(e.target);
                    },
                    click: (e) => {
                        mapa.panTo(e.latlng);
                    }
                });
            }
        }).addTo(mapa);

        // Ajustar vista centrada en Colombia
        mapa.fitBounds(geojsonLayer.getBounds(), {
            padding: [20, 20]
        });

        // PINES DE CORAZÓN PULSANTE EN BOGOTÁ Y BOLÍVAR
        const pinesVisitados = [
            {
                nombre: 'Bogotá D.C.',
                coords: [4.7110, -74.0721],
                mensaje: '<strong>Bogotá D.C.</strong><br>❤️ ¡Ciudad visitada! Llenos de amor en la capital.'
            },
            {
                nombre: 'Bolívar (Cartagena)',
                coords: [10.3910, -75.4794],
                mensaje: '<strong>Bolívar / Cartagena</strong><br>❤️ ¡Ciudad visitada! Inolvidable frente al mar caribe.'
            }
        ];

        pinesVisitados.forEach(pin => {
            const iconoHtml = `
                <div class="pin-corazon-wrapper">
                    <div class="pin-pulso"></div>
                    <div class="pin-corazon-icono">💖</div>
                </div>
            `;
            const customIcon = L.divIcon({
                html: iconoHtml,
                className: 'custom-pin-corazon',
                iconSize: [36, 36],
                iconAnchor: [18, 18],
                popupAnchor: [0, -20]
            });

            const marcador = L.marker(pin.coords, { icon: customIcon }).addTo(mapa);
            marcador.bindPopup(`
                <div class="contenido-popup-depto">
                    <h4>${pin.nombre}</h4>
                    <span class="badge-status visitado">❤️ ¡Ciudad visitada juntos!</span>
                    <p>${pin.mensaje}</p>
                </div>
            `, { className: 'popup-romantico' });
        });
    }

    if (window.COLOMBIA_GEOJSON) {
        procesarGeoJson(window.COLOMBIA_GEOJSON);
    } else {
        fetch('colombia.json')
            .then(res => res.json())
            .then(procesarGeoJson)
            .catch(err => console.error('Error cargando colombia.json:', err));
    }
}

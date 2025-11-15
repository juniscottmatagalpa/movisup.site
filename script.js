class SoraDownloader {
    constructor() {
        this.downloadBtn = document.getElementById('downloadBtn');
        this.videoUrlInput = document.getElementById('videoUrl');
        this.resultContainer = document.getElementById('result');
        this.videoThumbnail = document.getElementById('videoThumbnail');
        this.videoTitle = document.getElementById('videoTitle');
        this.videoDuration = document.getElementById('videoDuration');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.downloadBtn.addEventListener('click', () => this.processVideo());
        
        // Enter key support
        this.videoUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processVideo();
            }
        });
        
        // Download buttons
        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.downloadVideo(e.target.dataset.quality);
            });
        });
    }
    
    async processVideo() {
        const videoUrl = this.videoUrlInput.value.trim();
        
        if (!videoUrl) {
            this.showError('Por favor, ingresa una URL válida');
            return;
        }
        
        if (!this.isValidSoraUrl(videoUrl)) {
            this.showError('Por favor, ingresa una URL válida de Sora 2');
            return;
        }
        
        try {
            this.showLoading();
            
            // Simulación de procesamiento (en un caso real, conectarías con un backend)
            const videoInfo = await this.fetchVideoInfo(videoUrl);
            
            this.displayVideoInfo(videoInfo);
            this.showResult();
            
        } catch (error) {
            this.showError('Error al procesar el video: ' + error.message);
        }
    }
    
    isValidSoraUrl(url) {
        // Patrón básico para URLs de Sora (ajustar según necesidad)
        const soraPattern = /sora\.com|sora2\./i;
        return soraPattern.test(url);
    }
    
    async fetchVideoInfo(url) {
        // Simulación de API call
        // En producción, esto se conectaría con tu backend
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    title: 'Video de Sora 2',
                    thumbnail: 'https://via.placeholder.com/400x300/667eea/white?text=Sora+Video',
                    duration: '2:30',
                    videoId: this.extractVideoId(url)
                });
            }, 1500);
        });
    }
    
    extractVideoId(url) {
        // Extraer ID del video de la URL
        const match = url.match(/(?:sora\.com\/video\/|sora2\.com\/v\/)([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    }
    
    displayVideoInfo(info) {
        this.videoThumbnail.src = info.thumbnail;
        this.videoTitle.textContent = info.title;
        this.videoDuration.textContent = `Duración: ${info.duration}`;
    }
    
    downloadVideo(quality) {
        const videoUrl = this.videoUrlInput.value;
        const videoId = this.extractVideoId(videoUrl);
        
        if (!videoId) {
            this.showError('No se pudo obtener el ID del video');
            return;
        }
        
        // En producción, esto redirigiría a tu endpoint de descarga
        const downloadUrl = `/download/${videoId}?quality=${quality}`;
        
        // Simulación de descarga
        this.showMessage(`Iniciando descarga en calidad ${quality.toUpperCase()}...`);
        
        // En un caso real:
        // window.location.href = downloadUrl;
    }
    
    showLoading() {
        this.downloadBtn.textContent = 'Procesando...';
        this.downloadBtn.disabled = true;
    }
    
    showResult() {
        this.downloadBtn.textContent = 'Descargar Video';
        this.downloadBtn.disabled = false;
        this.resultContainer.style.display = 'block';
    }
    
    showError(message) {
        alert(message); // En producción, usar un toast mejor
        this.downloadBtn.textContent = 'Descargar Video';
        this.downloadBtn.disabled = false;
    }
    
    showMessage(message) {
        alert(message); // En producción, usar un toast mejor
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SoraDownloader();
});

// Smooth scroll para navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

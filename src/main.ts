import './index.css';

// ==========================================
// CONFIGURATION
// ==========================================
// 1. Paste your published Google Sheets CSV link here.
// To get this: File > Share > Publish to web > Link > Entire Document > Comma-separated values (.csv)
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/11Llp4JT0UBCzeB9MYbn_Bxh-Nu_OrCtd4ZQlO5aIiJs/export?format=csv';

// 2. Paste your WhatsApp phone number here (include country code, no + or spaces).
// Example: '1234567890' for US, '447123456789' for UK.
const WHATSAPP_NUMBER = '918369453991';
// ==========================================

interface WatchData {
  'Watch Name': string;
  Brand: string;
  Quality: string;
  Price: string;
  'Image URL': string; // Can now be comma-separated list of URLs
  'In Stock': string;
  'Original Price': string;
  Description: string;
}

// Helper to generate a random number between min and max
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to generate WhatsApp link
const generateWhatsAppLink = (watchName: string, quality: string, price: string) => {
  const message = `Hi! I'm interested in buying the ${watchName} (${quality} quality). Is it available for ${price}?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

// Main function to initialize the catalog
async function initCatalog() {
  const gridContainer = document.getElementById('catalog-grid');
  if (!gridContainer) return;

  try {
    // We use PapaParse from the global window object (loaded via CDN in index.html)
    // @ts-ignore
    Papa.parse(GOOGLE_SHEETS_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function(results: { data: WatchData[] }) {
        const watches = results.data;
        
        // Filter out out-of-stock items
        const availableWatches = watches.filter(
          watch => watch['In Stock'] && watch['In Stock'].trim().toLowerCase() !== 'no'
        );

        renderWatches(availableWatches, gridContainer);
      },
      error: function(error: any) {
        console.error('Error parsing CSV:', error);
        gridContainer.innerHTML = `
          <div class="col-span-full text-center py-20 text-red-400 font-light">
            Failed to load the collection. Please check the CSV URL.
          </div>
        `;
      }
    });
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

function renderWatches(watches: WatchData[], container: HTMLElement) {
  // Clear loading indicator
  container.innerHTML = '';

  if (watches.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-20 text-white/50 font-light">
        No timepieces currently available.
      </div>
    `;
    return;
  }

  watches.forEach((watch, index) => {
    // Psychological Tricks Logic
    const viewersCount = getRandomInt(8, 45);
    const scarcityCount = getRandomInt(1, 3);
    const showScarcity = Math.random() > 0.5; // 50% chance to show scarcity tag

    const waLink = generateWhatsAppLink(watch['Watch Name'], watch.Quality, watch.Price);

    // Handle multiple media URLs (comma separated)
    const rawMediaUrls = watch['Image URL'] || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop';
    const mediaUrls = rawMediaUrls.split(',').map(url => url.trim()).filter(url => url.length > 0);
    
    // Generate HTML for all media items
    const mediaItemsHTML = mediaUrls.map((url, i) => {
      const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm');
      const isActive = i === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0';
      
      if (isVideo) {
        return `<video src="${url}" autoplay loop muted playsinline class="media-item absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${isActive}"></video>`;
      } else {
        return `<img src="${url}" alt="${watch['Watch Name']} - View ${i + 1}" loading="lazy" referrerpolicy="no-referrer" class="media-item absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${isActive}" onerror="this.src='https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop'" />`;
      }
    }).join('');

    // Generate dots indicator if there are multiple media items
    const dotsHTML = mediaUrls.length > 1 ? `
      <div class="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5 z-20">
        ${mediaUrls.map((_, i) => `
          <div class="media-dot w-1.5 h-1.5 rounded-full bg-white transition-all duration-300 ${i === 0 ? 'opacity-100 scale-125' : 'opacity-40'}"></div>
        `).join('')}
      </div>
    ` : '';

    const cardHTML = `
      <article class="watch-card group flex flex-col glass-panel rounded-2xl overflow-hidden relative" data-card-index="${index}">
        
        <!-- Scarcity Tag -->
        ${showScarcity ? `
          <div class="absolute top-4 left-4 z-20 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-full shadow-lg">
            🔥 Only ${scarcityCount} Left!
          </div>
        ` : ''}

        <!-- Image/Video Section -->
        <div class="relative aspect-[4/5] overflow-hidden bg-white/5 media-container">
          ${mediaItemsHTML}
          ${dotsHTML}
          
          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none"></div>
          
          <!-- Social Proof -->
          <div class="absolute bottom-4 left-4 flex items-center gap-2 text-white/80 text-xs font-medium z-20">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            👀 ${viewersCount} people looking right now
          </div>
        </div>

        <!-- Content Section -->
        <div class="p-6 flex flex-col flex-grow relative z-20 bg-black/20">
          <div class="text-xs tracking-[0.2em] uppercase text-white/50 mb-2">${watch.Brand}</div>
          <h3 class="font-serif text-2xl mb-1 text-white">${watch['Watch Name']}</h3>
          <div class="text-sm text-white/60 mb-3 font-light">${watch.Quality} Quality</div>
          
          ${watch.Description ? `<p class="text-sm text-white/70 mb-6 line-clamp-3 font-light leading-relaxed">${watch.Description}</p>` : '<div class="mb-6"></div>'}
          
          <div class="mt-auto">
            <!-- Pricing -->
            <div class="flex items-baseline gap-3 mb-6">
              <span class="text-2xl font-light text-white">${watch.Price}</span>
              ${watch['Original Price'] ? `
                <span class="text-sm text-white/40 line-through decoration-red-500/50">${watch['Original Price']}</span>
              ` : ''}
            </div>

            <!-- WhatsApp CTA -->
            <a 
              href="${waLink}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="btn-whatsapp w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-xl font-medium tracking-wide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Order via WhatsApp
            </a>
          </div>
        </div>
      </article>
    `;

    container.insertAdjacentHTML('beforeend', cardHTML);
  });

  // Initialize carousels
  initCarousels();
}

function initCarousels() {
  const containers = document.querySelectorAll('.media-container');
  
  containers.forEach(container => {
    const items = container.querySelectorAll('.media-item');
    const dots = container.querySelectorAll('.media-dot');
    
    if (items.length <= 1) return; // No carousel needed for single items
    
    let currentIndex = 0;
    
    // Auto-advance carousel every 4 seconds
    setInterval(() => {
      // Hide current
      items[currentIndex].classList.remove('opacity-100', 'z-10');
      items[currentIndex].classList.add('opacity-0', 'z-0');
      if (dots[currentIndex]) {
        dots[currentIndex].classList.remove('opacity-100', 'scale-125');
        dots[currentIndex].classList.add('opacity-40');
      }
      
      // Move to next
      currentIndex = (currentIndex + 1) % items.length;
      
      // Show next
      items[currentIndex].classList.remove('opacity-0', 'z-0');
      items[currentIndex].classList.add('opacity-100', 'z-10');
      if (dots[currentIndex]) {
        dots[currentIndex].classList.remove('opacity-40');
        dots[currentIndex].classList.add('opacity-100', 'scale-125');
      }
    }, 4000);
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCatalog);

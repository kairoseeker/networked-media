const stickerTabHotspot = document.getElementById('stickerTabHotspot');
const stickerTabHotspotTOC = document.getElementById('stickerTabHotspotTOC');
const stickerSheetModal = document.getElementById('stickerSheetModal');
const closeStickerSheet = document.getElementById('closeStickerSheet');
const stickerItems = document.querySelectorAll('.sticker-item');
const placedStickersContainer = document.getElementById('placedStickersContainer');
const monthSpreadImage = document.getElementById('monthSpreadImage');
const twoMonthView = document.querySelector('.two-month-view');

let selectedSticker = null;
let selectedStickerSrc = null;
let currentMonth = twoMonthView ? twoMonthView.dataset.month : null;

if (stickerTabHotspot) {
  stickerTabHotspot.addEventListener('click', () => {
    stickerSheetModal.classList.add('open');
  });
}

if (stickerTabHotspotTOC) {
  stickerTabHotspotTOC.addEventListener('click', () => {
    if (stickerSheetModal) {
      stickerSheetModal.classList.add('open');
    }
  });
}

if (closeStickerSheet) {
  closeStickerSheet.addEventListener('click', () => {
    stickerSheetModal.classList.remove('open');
  });
}

if (stickerSheetModal) {
  stickerSheetModal.addEventListener('click', (e) => {
    if (e.target === stickerSheetModal) {
      stickerSheetModal.classList.remove('open');
    }
  });
}

stickerItems.forEach(item => {
  item.addEventListener('click', () => {

    stickerItems.forEach(s => s.classList.remove('selected'));
    
    item.classList.add('selected');
    selectedSticker = item.dataset.sticker;
    selectedStickerSrc = item.src;
    
    document.body.classList.add('placing-sticker');
    
    stickerSheetModal.classList.remove('open');
    
    console.log('Selected sticker:', selectedSticker);
  });
});

function createPlacedSticker(x, y, stickerSrc, stickerType, stickerId = null) {
  const placedSticker = document.createElement('div');
  placedSticker.className = 'placed-sticker';
  placedSticker.style.left = x + 'px';
  placedSticker.style.top = y + 'px';
  if (stickerId) {
    placedSticker.dataset.stickerId = stickerId;
  }
  
  const stickerImg = document.createElement('img');
  stickerImg.src = stickerSrc;
  stickerImg.alt = stickerType;
  
  placedSticker.appendChild(stickerImg);
  return placedSticker;
}

async function loadStickers() {
  if (!currentMonth || !placedStickersContainer) return;
  
  try {
    const response = await fetch(`/load-stickers/${currentMonth}`);
    const data = await response.json();
    
    if (data.stickers) {
      data.stickers.forEach(stickerData => {
        const stickerElement = createPlacedSticker(
          stickerData.xPosition,
          stickerData.yPosition,
          stickerData.stickerSrc,
          stickerData.stickerType,
          stickerData._id
        );
        placedStickersContainer.appendChild(stickerElement);
      });
      console.log(`Loaded ${data.stickers.length} stickers`);
    }
  } catch (error) {
    console.error('Error loading stickers:', error);
  }
}

async function saveSticker(stickerType, stickerSrc, x, y) {
  if (!currentMonth) {
    console.log('No month page - skipping save');
    return null;
  }
  
  try {
    const response = await fetch('/save-sticker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        monthPage: currentMonth,
        stickerType: stickerType,
        stickerSrc: stickerSrc,
        xPosition: x,
        yPosition: y
      })
    });
    
    const data = await response.json();
    console.log('Sticker saved:', data);
    return data.sticker;
  } catch (error) {
    console.error('Error saving sticker:', error);
    return null;
  }
}

const placementHotspots = document.querySelectorAll('.placement-hotspot');

placementHotspots.forEach(hotspot => {
  hotspot.addEventListener('click', async (e) => {
    if (!selectedSticker || !selectedStickerSrc) return;
    
    const x = e.clientX - 50; 
    const y = e.clientY - 50;
    
    const placedSticker = createPlacedSticker(x, y, selectedStickerSrc, selectedSticker);
    placedStickersContainer.appendChild(placedSticker);
    
    console.log('Placed sticker at:', x, y);
    
    const savedSticker = await saveSticker(selectedSticker, selectedStickerSrc, x, y);
    
    if (savedSticker) {
      placedSticker.dataset.stickerId = savedSticker._id;
      console.log('Sticker saved with ID:', savedSticker._id);
    } else {
      console.log('Sticker placed but not saved to database');
    }
    
  });
});

const deleteButton = document.getElementById('deleteButton');
const clearButton = document.getElementById('clearButton');
let deleteMode = false;

if (deleteButton) {
  deleteButton.addEventListener('click', () => {
    deleteMode = !deleteMode;
    
    if (deleteMode) {
      deleteButton.classList.add('active');
      document.body.classList.add('delete-mode');
      selectedSticker = null;
      selectedStickerSrc = null;
      document.body.classList.remove('placing-sticker');
      stickerItems.forEach(s => s.classList.remove('selected'));
    } else {
      deleteButton.classList.remove('active');
      document.body.classList.remove('delete-mode');
    }
  });
}

if (clearButton) {
  clearButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete all stickers?')) {
      if (!currentMonth) {
        if (placedStickersContainer) {
          placedStickersContainer.innerHTML = '';
        }
        return;
      }
      
      try {
        const response = await fetch(`/clear-stickers/${currentMonth}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          if (placedStickersContainer) {
            placedStickersContainer.innerHTML = '';
          }
          console.log(`Cleared ${data.numRemoved} stickers`);
          if (deleteMode) {
            deleteMode = false;
            deleteButton.classList.remove('active');
            document.body.classList.remove('delete-mode');
          }
        }
      } catch (error) {
        console.error('Error clearing stickers:', error);
        alert('Failed to clear stickers');
      }
    }
  });
}

document.addEventListener('click', async (e) => {
  if (deleteMode && e.target.closest('.placed-sticker')) {
    const sticker = e.target.closest('.placed-sticker');
    const stickerId = sticker.dataset.stickerId;
    
    if (stickerId) {
      try {
        const response = await fetch(`/delete-sticker/${stickerId}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          sticker.remove();
          console.log('Sticker deleted from database');
        }
      } catch (error) {
        console.error('Error deleting sticker:', error);
        alert('Failed to delete sticker');
      }
    } else {
      sticker.remove();
      console.log('Sticker removed from UI only');
    }
  }
});

if (currentMonth) {
  loadStickers();
  console.log('Loading stickers for month:', currentMonth);
}
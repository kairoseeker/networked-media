const pencilsImg = document.querySelector('.pencils')
const stringImg = document.querySelector('.string')
const notePopup = document.getElementById('notePopup')
const noteForm = document.getElementById('noteForm')
const closePopup = document.getElementById('closePopup')
const board = document.getElementById('board')
const stringCanvas = document.querySelector('.string_canvas')

let isStringMode = false
let selectedPosts = []

if (pencilsImg && board && noteForm) {
    pencilsImg.addEventListener('click', (e) => {
    e.stopPropagation()
    notePopup.style.display = 'flex'
    isStringMode = false
    selectedPosts = []
})

stringImg.addEventListener('click', (e) => {
    e.stopPropagation()
    isStringMode = !isStringMode
    selectedPosts = []
    stringImg.style.opacity = isStringMode ? '0.5' : '1'
    
    if (isStringMode) {
        board.style.cursor = 'crosshair'
    } else {
        board.style.cursor = 'default'
    }
})

    closePopup.addEventListener('click', (e) => {
        e.preventDefault()
        notePopup.style.display = 'none'
        noteForm.reset()
    })

board.addEventListener('click', (e) => {
    if (isStringMode && e.target.closest('.note')) {
        const note = e.target.closest('.note')
        
        if (selectedPosts.includes(note)) {
            return
        }
        
        note.style.border = '2px solid #ffbc32'
        selectedPosts.push(note)
        
        if (selectedPosts.length === 2) {
            drawString()
            isStringMode = false
            selectedPosts = []
            stringImg.style.opacity = '1'
            board.style.cursor = 'default'
        }
    }
})

function drawString() {
    const note1 = selectedPosts[0]
    const note2 = selectedPosts[1]
    
    const x1 = parseFloat(note1.style.left) + 60
    const y1 = parseFloat(note1.style.top) + 35
    const x2 = parseFloat(note2.style.left) + 60
    const y2 = parseFloat(note2.style.top) + 35
    
    fetch('/add-string', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ x1, y1, x2, y2 })
    })
    .then(response => response.json())
    .catch(err => console.error('Error saving string:', err))
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x1)
    line.setAttribute('y1', y1)
    line.setAttribute('x2', x2)
    line.setAttribute('y2', y2)
    line.setAttribute('style', 'stroke:#ffbc32; stroke-width:2')
    stringCanvas.appendChild(line)
    
    note1.style.border = '1px solid #ddd'
    note2.style.border = '1px solid #ddd'
}

    noteForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const board = document.getElementById('board')
    const prompt = document.getElementById('q1')
    const promptBottom = prompt.offsetTop + prompt.offsetHeight
    
    const minX = 10
    const maxX = board.offsetWidth - 150
    const minY = promptBottom + 50
    const maxY = board.offsetHeight - 160
    
    const randomX = minX + Math.random() * (maxX - minX)
    const randomY = minY + Math.random() * (maxY - minY)
    
    const noteText = document.querySelector('input[name="status"]').value
    
    if (!noteText.trim()) {
        alert('Please enter some text')
        return
    }
    
    fetch('/add-note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: noteText,
            x: randomX,
            y: randomY
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Server error')
        return response.json()
    })
    .then(data => {
        const newNote = document.createElement('div')
        newNote.className = 'note'
        newNote.style.left = randomX + 'px'
        newNote.style.top = randomY + 'px'
        newNote.innerHTML = `<p>${noteText}</p><small>${data.time}</small>`
        board.appendChild(newNote)
        
        notePopup.style.display = 'none'
        noteForm.reset()
    })
    .catch(err => {
        console.error('Error posting note:', err)
        alert('Failed to post note')
    })
})
}

const suggestionForm = document.getElementById('suggestionForm')
if (suggestionForm) {
    suggestionForm.addEventListener('submit', (e) => {
        e.preventDefault()
        
        const nameInput = document.getElementById('name')
        const promptInput = document.getElementById('prompt')
        
        const name = nameInput.value.trim()
        const prompt = promptInput.value.trim()
        
        if (!name || !prompt) {
            alert('Please fill in all fields')
            return
        }
        
        fetch('/add-suggestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                prompt: prompt
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Server error')
            return response.json()
        })
        .then(data => {
            document.getElementById('formContainer').style.display = 'none'
            
            const messageContainer = document.getElementById('messageContainer')
            const thankYouMessage = document.getElementById('thankYouMessage')
            thankYouMessage.textContent = 'Thank you for your suggestion, ' + name + '!'
            messageContainer.style.display = 'block'
        })
        .catch(err => {
            console.error('Error submitting suggestion:', err)
            alert('Failed to submit suggestion')
        })
    })
}

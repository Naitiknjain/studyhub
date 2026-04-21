// ============================================
// STEP 1 — Connect to Supabase
// ============================================

// ⚠️ IMPORTANT: Replace these two values with YOUR Supabase details!
const SUPABASE_URL = 'https://bnbdbrtwlqguidqwxynt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuYmRicnR3bHFndWlkcXd4eW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDUzMjUsImV4cCI6MjA5MjE4MTMyNX0.LNsKcPdNrFhD9Fl6St7uuLB41uHNbgiBvOnmeBxGqJE'

// This creates your Supabase client (your connection to the database)
const { createClient } = supabase
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


// ============================================
// STEP 2 — Load Videos (only runs on subject.html)
// ============================================

// Check if we're on the subject page before loading videos
const videosGrid = document.getElementById('videos-grid')

if (videosGrid) {
  loadVideos()
}

async function loadVideos() {

  // Fetch all videos from Supabase
  const { data: videos, error } = await db
    .from('videos')
    .select('*')

  // If something went wrong, show error
  if (error) {
    videosGrid.innerHTML = `
      <p style="color: red; text-align: center;">
        Error loading videos. Please try again later.
      </p>`
    return
  }

  // If no videos found
  if (videos.length === 0) {
    videosGrid.innerHTML = `
      <p style="color: #888; text-align: center;">
        No videos added yet. Check back soon!
      </p>`
    return
  }

  // Clear the "Loading videos..." message
  videosGrid.innerHTML = ''

  // Loop through each video and create a card for it
  videos.forEach(video => {
    const card = document.createElement('div')
    card.className = 'video-card'

    card.innerHTML = `
      <!-- Video Player -->
      <iframe
        src="${video.video_url}"
        title="${video.title}"
        allowfullscreen
        allow="accelerometer; autoplay; clipboard-write;
               encrypted-media; gyroscope; picture-in-picture"
      ></iframe>

      <!-- Video Title and Description -->
      <div class="video-info">
        <h3>${video.title}</h3>
        <p>${video.description}</p>
      </div>

      <!-- Feedback Form -->
      <div class="feedback-form">
        <p>💬 Leave Feedback</p>
        <input
          type="text"
          id="feedback-${video.id}"
          placeholder="Was this helpful? Let us know..."
        />
        <br/>
        <button
          class="btn-submit"
          onclick="submitFeedback(${video.id})">
          Submit
        </button>
        <p class="feedback-msg" id="feedback-msg-${video.id}"></p>
      </div>
    `

    // Add this card to the grid
    videosGrid.appendChild(card)
  })
}


// ============================================
// STEP 3 — Submit Feedback
// ============================================

async function submitFeedback(videoId) {

  // Get the feedback text the user typed
  const input = document.getElementById(`feedback-${videoId}`)
  const message = input.value.trim()

  // Get the message display area
  const msgEl = document.getElementById(`feedback-msg-${videoId}`)

  // Check if user typed something
  if (!message) {
    msgEl.style.color = '#f44336'
    msgEl.textContent = 'Please write something before submitting!'
    return
  }

  // Show a saving message
  msgEl.style.color = '#aaa'
  msgEl.textContent = 'Saving...'

  // Save feedback to Supabase
  const { error } = await db
    .from('feedback')
    .insert([{
      video_id: videoId,
      message: message
    }])

  // If error, show it
  if (error) {
    msgEl.style.color = '#f44336'
    msgEl.textContent = 'Something went wrong. Please try again.'
    return
  }

  // Success! Clear input and show success message
  input.value = ''
  msgEl.style.color = '#4caf50'
  msgEl.textContent = '✅ Feedback submitted! Thank you!'

  // Clear the success message after 4 seconds
  setTimeout(() => {
    msgEl.textContent = ''
  }, 4000)
}


// ============================================
// STEP 4 — Submit Doubt
// ============================================

async function submitDoubt() {

  // Get values from the form
  const name = document.getElementById('doubt-name').value.trim()
  const email = document.getElementById('doubt-email').value.trim()
  const message = document.getElementById('doubt-message').value.trim()

  // Get the message display area
  const msgEl = document.getElementById('doubt-msg')

  // Check all fields are filled
  if (!name || !email || !message) {
    msgEl.style.color = '#f44336'
    msgEl.textContent = 'Please fill in all fields!'
    return
  }

  // Show saving message
  msgEl.style.color = '#aaa'
  msgEl.textContent = 'Submitting...'

  // Save doubt to Supabase
  const { error } = await db
    .from('doubts')
    .insert([{
      name: name,
      email: email,
      message: message
    }])

  // If error
  if (error) {
    msgEl.style.color = '#f44336'
    msgEl.textContent = 'Something went wrong. Please try again.'
    return
  }

  // Success! Clear form
  document.getElementById('doubt-name').value = ''
  document.getElementById('doubt-email').value = ''
  document.getElementById('doubt-message').value = ''

  msgEl.style.color = '#4caf50'
  msgEl.textContent = '✅ Doubt submitted! We will get back to you soon.'

  // Clear after 5 seconds
  setTimeout(() => {
    msgEl.textContent = ''
  }, 5000)
}